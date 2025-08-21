import { ref, onUnmounted } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '../services/firebase'

export interface Appointment {
  id: string;
  title: string; // 预约人姓名
  start: string; // ISO 格式的开始时间, e.g., '2025-08-15T09:00:00'
  end: string;   // ISO 格式的结束时间, e.g., '2025-08-15T10:00:00'
  userId: string;
}

const appointments = ref<Appointment[]>([]);
const appointmentsCollection = collection(db, 'appointments');

// 实时监听预约数据的变化
const unsubscribe = onSnapshot(query(appointmentsCollection), (snapshot) => {
  appointments.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
});

onUnmounted(() => {
  unsubscribe();
});

/**
 * 检查一个新的预约时间段是否与现有预约冲突
 * @param start 新预约的开始时间
 * @param end 新预约的结束时间
 * @returns 如果有冲突则返回 true，否则返回 false
 */
async function checkBookingConflict(start: Date, end: Date): Promise<boolean> {
  // 查询所有与新预约时间段有重叠的现有预约
  const q = query(
    appointmentsCollection,
    where('start', '<', end.toISOString()),
    where('end', '>', start.toISOString())
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // 如果查询结果不为空，则表示存在冲突
}

/**
 * 创建一个新的预约
 * @param newAppointment 包含 title, start, end, userId 的对象
 */
async function createAppointment(newAppointment: Omit<Appointment, 'id'>) {
  const conflict = await checkBookingConflict(new Date(newAppointment.start), new Date(newAppointment.end));

  if (conflict) {
    throw new Error('This time slot is already booked. Please choose another time.');
  }

  await addDoc(appointmentsCollection, newAppointment);
}

export function useAppointments() {
  return {
    appointments,
    createAppointment,
    checkBookingConflict
  };
}
