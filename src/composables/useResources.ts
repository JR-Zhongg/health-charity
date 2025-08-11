// src/composables/useResources.ts
import { ref } from 'vue'

export type Resource = {
  id: number
  title: string
  category: string
  summary: string
  tags: string[]
  ratings: number[]
  ratedBy: number[]
  createdAt: string
  url?: string
}

const STORAGE_KEY = 'hc_resources'

// ------- 默认（mock）数据 -------
const defaultResources: Resource[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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

const resources = ref<Resource[]>(load())

function load(): Resource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultResources))
    return JSON.parse(JSON.stringify(defaultResources))
  } catch {
    return JSON.parse(JSON.stringify(defaultResources))
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources.value))
}

function resetResources() {
  resources.value = JSON.parse(JSON.stringify(defaultResources))
  save()
}

function nextId() {
  return resources.value.length
    ? Math.max(...resources.value.map((r) => r.id)) + 1
    : 1
}

// CRUD
function createResource(payload: Omit<Resource, 'id' | 'createdAt' | 'ratings' | 'ratedBy'>) {
  const resource: Resource = {
    id: nextId(),
    createdAt: new Date().toISOString(),
    ratings: [],
    ratedBy: [],
    ...payload
  }
  resources.value.push(resource)
  save()
  return resource
}

function updateResource(id: number, payload: Partial<Omit<Resource, 'id' | 'createdAt'>>) {
  const idx = resources.value.findIndex((r) => r.id === id)
  if (idx === -1) return false
  resources.value[idx] = { ...resources.value[idx], ...payload }
  save()
  return true
}

function deleteResource(id: number) {
  const idx = resources.value.findIndex((r) => r.id === id)
  if (idx === -1) return false
  resources.value.splice(idx, 1)
  save()
  return true
}

export function useResources() {
  return {
    resources,
    createResource,
    updateResource,
    deleteResource,
    resetResources,
    save,
    STORAGE_KEY,
  }
}
