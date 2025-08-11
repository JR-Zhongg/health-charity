<template>
  <div class="resources">
    <div class="container-wide">
      <h1 class="page-title">Health Resources</h1>

      <!-- 控件区：搜索 / 分类 / 排序 -->
      <section class="controls" aria-label="filters">
        <div class="control">
          <label for="search">Search</label>
          <input
            id="search"
            v-model.trim="search"
            type="text"
            placeholder="Search by title, summary or tags…"
          />
        </div>

        <div class="control">
          <label for="category">Category</label>
          <select id="category" v-model="category">
            <option value="all">All</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="control">
          <label for="sort">Sort by</label>
          <select id="sort" v-model="sortBy">
            <option value="newest">Newest</option>
            <option value="rating">Rating</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </div>

        <!-- 只有 admin 能看到 -->
        <button
          v-if="isAdmin"
          class="reset"
          type="button"
          @click="resetData"
        >
          Reset Mock Data
        </button>
      </section>

      <!-- 资源列表 -->
      <section
        v-if="filteredResources.length"
        class="grid"
        aria-label="resources list"
      >
        <article class="card" v-for="res in filteredResources" :key="res.id">
          <header class="card-header">
            <h2 class="title">{{ res.title }}</h2>
            <span class="badge">{{ res.category }}</span>
          </header>

          <p class="summary">{{ res.summary }}</p>

          <!-- 标签 -->
          <div class="tags" v-if="res.tags.length" aria-label="tags">
            <span v-for="t in res.tags" :key="t" class="tag">#{{ t }}</span>
          </div>

          <!-- 平均分显示（聚合评分） -->
          <div
            class="rating-line"
            :aria-label="`Average rating ${avg(res).toFixed(1)} out of 5, from ${res.ratings.length} ratings`"
          >
            <span class="stars">
              <span
                v-for="i in 5"
                :key="i"
                :class="['star', { filled: i <= Math.round(avg(res)) }]"
                aria-hidden="true"
                >★</span
              >
            </span>
            <span class="rating-text">
              {{ avg(res).toFixed(1) }} / 5 • {{ res.ratings.length }} ratings
            </span>
          </div>

          <!-- 评分（登录用户且未评分过才能评分） -->
          <form class="rate-form" @submit.prevent="submitRating(res)">
            <label :for="`rate-${res.id}`">Rate this resource (1–5):</label>
            <select
              :id="`rate-${res.id}`"
              v-model.number="userRatings[res.id]"
              aria-describedby="rateHelp"
              :disabled="!isLoggedIn || hasRated(res)"
            >
              <option disabled value="0">Select…</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
            <button
              type="submit"
              :disabled="!isLoggedIn || hasRated(res)"
            >
              Submit
            </button>
            <small id="rateHelp" class="help">
              Please choose a number between 1 and 5.
            </small>

            <!-- 未登录或已评分的提示 -->
            <p v-if="!isLoggedIn" class="hint">You must login to rate.</p>
            <p v-else-if="hasRated(res)" class="hint">You have already rated this resource.</p>

            <p v-if="errors[res.id]" class="error">{{ errors[res.id] }}</p>
          </form>

          <footer class="meta">
            <span>Published: {{ formatDate(res.createdAt) }}</span>
            <a
              v-if="res.url"
              class="read-more"
              :href="res.url"
              target="_blank"
              rel="noopener noreferrer"
              >Read more →</a
            >
          </footer>
        </article>
      </section>

      <p v-else class="empty">No resources found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

type Resource = {
  id: number
  title: string
  category: string
  summary: string
  tags: string[]
  ratings: number[]
  ratedBy: string[]   // Changed to string[] to store UIDs
  createdAt: string
  url?: string
}

const STORAGE_KEY = 'hc_resources'

const defaultResources: Resource[] = [
  {
    id: 1,
    title: 'Healthy Eating for Seniors',
    category: 'Nutrition',
    summary:
      'Guidelines on balanced diets, portion sizes, and essential nutrients for older adults.',
    tags: ['food', 'diet', 'elderly'],
    ratings: [5, 4, 4, 5],
    ratedBy: [], // 默认空
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

const resources = ref<Resource[]>([])
const search = ref('')
const category = ref<'all' | string>('all')
const sortBy = ref<'newest' | 'rating' | 'title'>('newest')

const userRatings = ref<Record<number, number>>({})
const errors = ref<Record<number, string>>({})

// ✅ Correctly import 'role', 'currentUser', and 'isAuthenticated'
const { currentUser, isAuthenticated, role } = useAuth()
const isLoggedIn = computed(() => isAuthenticated.value)
// ✅ Use the imported 'role' property for the check
const isAdmin = computed(() => role.value === 'admin')

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    resources.value = JSON.parse(saved)
  } else {
    resources.value = defaultResources
    save()
  }
})

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources.value))
}

function resetData() {
  if (!isAdmin.value) return
  resources.value = JSON.parse(JSON.stringify(defaultResources))
  save()
  search.value = ''
  category.value = 'all'
  sortBy.value = 'newest'
}

function avg(res: Resource) {
  if (!res.ratings.length) return 0
  return res.ratings.reduce((a, b) => a + b, 0) / res.ratings.length
}

function hasRated(res: Resource) {
  // ✅ Use 'uid' instead of 'id'
  const uid = currentUser.value?.uid
  if (!uid) return false
  return res.ratedBy?.includes(uid)
}

function submitRating(res: Resource) {
  // ✅ Use 'uid' instead of 'id'
  const uid = currentUser.value?.uid
  if (!uid) {
    errors.value[res.id] = 'Please login to rate.'
    return
  }

  // 防重复
  if (hasRated(res)) {
    errors.value[res.id] = 'You have already rated this resource.'
    return
  }

  const val = userRatings.value[res.id]
  if (!val || val < 1 || val > 5) {
    errors.value[res.id] = 'Please select a number between 1 and 5.'
    return
  }

  res.ratings.push(val)
  // ✅ Push the correct 'uid' (string) into the ratedBy array
  res.ratedBy.push(uid)

  save()
  userRatings.value[res.id] = 0
  errors.value[res.id] = ''
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString()
}

const categories = computed(() => {
  const set = new Set<string>()
  resources.value.forEach((r) => set.add(r.category))
  return Array.from(set)
})

const filteredResources = computed(() => {
  const term = search.value.toLowerCase()

  let list = resources.value.filter((r) => {
    const matchCategory = category.value === 'all' || r.category === category.value
    const matchSearch =
      !term ||
      r.title.toLowerCase().includes(term) ||
      r.summary.toLowerCase().includes(term) ||
      r.tags.some((t) => t.toLowerCase().includes(term))
    return matchCategory && matchSearch
  })

  switch (sortBy.value) {
    case 'newest':
      list = list.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      break
    case 'rating':
      list = list.slice().sort((a, b) => avg(b) - avg(a))
      break
    case 'title':
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  return list
})
</script>

<style scoped>
.container-wide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 40px;
  box-sizing: border-box;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.control {
  display: flex;
  flex-direction: column;
  min-width: 220px;
}

.control label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.control input,
.control select {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.reset {
  margin-left: auto;
  align-self: center;
  border: 1px solid #ccc;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
}

.card {
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 6px;
  padding: 18px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.title {
  font-size: 1.2rem;
  font-weight: 700;
  flex: 1 1 auto;
}

.badge {
  background: #f0f0f0;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.summary {
  color: #444;
  line-height: 1.6;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  font-size: 0.85rem;
  color: #666;
}

.rating-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: inline-flex;
  gap: 2px;
}
.star {
  color: #ddd;
  font-size: 1rem;
}
.star.filled {
  color: #f6b100;
}

.rating-text {
  font-size: 0.85rem;
  color: #555;
}

.rate-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rate-form select {
  padding: 4px 8px;
}

.rate-form button {
  padding: 6px 10px;
  border: none;
  background: #000;
  color: #fff;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
}

.help {
  color: #777;
  font-size: 0.75rem;
}

.hint {
  color: #777;
  font-size: 0.85rem;
  margin: 0;
}

.error {
  color: #d93025;
  font-size: 0.8rem;
  margin: 0;
}

.meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #777;
}

.read-more {
  text-decoration: none;
  color: #0c63e4;
}

.empty {
  color: #777;
  margin-top: 2rem;
  text-align: center;
}
</style>
