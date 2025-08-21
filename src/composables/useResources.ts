import { ref, onUnmounted } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  writeBatch // ✅ 导入 writeBatch 以进行高效的批量写入
} from 'firebase/firestore'
import { db } from '../services/firebase'

export type Resource = {
  id: string
  title: string
  category: string
  summary: string
  tags: string[]
  ratings: number[]
  ratedBy: string[]
  createdAt: string
  url?: string
}

const STORAGE_KEY = 'hc_resources_cache';

// 默认数据
const defaultResources: Omit<Resource, 'id'>[] = [
  {
    title: 'Healthy Eating for Seniors',
    category: 'Nutrition',
    summary:
      'Guidelines on balanced diets, portion sizes, and essential nutrients for older adults.',
    tags: ['food', 'diet', 'elderly'],
    ratings: [5, 4, 4, 5],
    ratedBy: [],
    createdAt: '2024-09-18T09:17:00Z',
    url: 'https://example.com/nutrition'
  },
  {
    title: 'Managing Loneliness & Staying Connected',
    category: 'Mental Health',
    summary:
      'Tips and community resources to help seniors reduce isolation and maintain social connections.',
    tags: ['mental-health', 'community', 'wellbeing'],
    ratings: [4, 3, 5],
    ratedBy: [],
    createdAt: '2024-07-12T10:00:00Z'
  },
  {
    title: 'Safe Exercises at Home',
    category: 'Exercise',
    summary:
      'A set of low-impact exercises designed to help seniors stay active at home safely.',
    tags: ['exercise', 'mobility', 'fall-prevention'],
    ratings: [5, 5],
    ratedBy: [],
    createdAt: '2024-11-02T15:40:00Z'
  }
]

// --- 数据状态 ---
const resources = ref<Resource[]>([]);
const resourcesCollection = collection(db, 'resources');
let isInitialDataSeeded = false; // 防止重复填充

// ✅ 1. 从缓存加载初始数据 (同步操作，立即完成)
function loadFromCache() {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (cachedData) {
      resources.value = JSON.parse(cachedData);
    }
  } catch (e) {
    console.error("Failed to load resources from cache", e);
  }
}
loadFromCache();

// ✅ 2. 设置非阻塞的实时监听器
const unsubscribe = onSnapshot(query(resourcesCollection), async (snapshot) => {
  // 更新本地数据
  const freshData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Resource));
  resources.value = freshData;

  // 更新缓存
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
  } catch (e) {
    console.error("Failed to save resources to cache", e);
  }

  // ✅ 3. 在监听到数据后，再检查是否需要填充初始数据
  //    这个过程现在是异步的，不会阻塞应用启动
  if (snapshot.empty && !isInitialDataSeeded) {
    isInitialDataSeeded = true; // 标记为已尝试填充
    console.log('Firestore is empty, seeding initial data...');

    // 使用批量写入，效率更高
    const batch = writeBatch(db);
    defaultResources.forEach(res => {
      const docRef = doc(resourcesCollection); // 自动生成 ID
      batch.set(docRef, res);
    });
    await batch.commit();
  }
});

onUnmounted(() => {
  unsubscribe();
});


// --- CRUD 操作 (保持不变) ---
async function createResource(payload: Omit<Resource, 'id' | 'createdAt' | 'ratings' | 'ratedBy'>) {
  const resource = {
    ...payload,
    createdAt: new Date().toISOString(),
    ratings: [],
    ratedBy: [],
  }
  const docRef = await addDoc(resourcesCollection, resource)
  return docRef.id
}

async function updateResource(id: string, payload: Partial<Omit<Resource, 'id' | 'createdAt'>>) {
  const docRef = doc(db, 'resources', id)
  await updateDoc(docRef, payload)
  return true
}

async function deleteResource(id: string) {
  const docRef = doc(db, 'resources', id)
  await deleteDoc(docRef)
  return true
}

export function useResources() {
  return {
    resources,
    createResource,
    updateResource,
    deleteResource,
  };
}
