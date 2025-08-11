<template>
  <div class="container-wide">
    <h1>Admin: Resources CRUD</h1>
    <p class="tip">Only admins can access this page.</p>

    <section class="panel">
      <button class="btn-danger" @click="onReset">Reset Mock Data</button>
    </section>

    <section class="panel">
      <h2>{{ isEditing ? 'Edit Resource' : 'Create Resource' }}</h2>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="form-control">
          <label for="title">Title *</label>
          <input
            id="title"
            v-model.trim="form.title"
            type="text"
            required
            :maxlength="MAX_TITLE_LEN"
          />
        </div>

        <div class="form-control">
          <label for="category">Category *</label>
          <input
            id="category"
            v-model.trim="form.category"
            type="text"
            required
            :maxlength="MAX_CATEGORY_LEN"
          />
        </div>

        <div class="form-control">
          <label for="summary">Summary *</label>
          <textarea
            id="summary"
            v-model.trim="form.summary"
            rows="3"
            required
            :maxlength="MAX_SUMMARY_LEN"
          />
        </div>

        <div class="form-control">
          <label for="tags">Tags (comma separated, letters/numbers/- only)</label>
          <input
            id="tags"
            v-model.trim="form.tagsStr"
            type="text"
            placeholder="e.g. food,diet,elderly"
            :maxlength="MAX_TAGS_STR_LEN"
          />
        </div>

        <div class="form-control">
          <label for="url">URL (optional)</label>
          <input
          id="url"
          v-model.trim="form.url"
          type="url"
          placeholder="https://..."
          :maxlength="MAX_URL_LEN"
        />
        </div>

        <div class="actions">
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'Update' : 'Create' }}
          </button>

          <button
            v-if="isEditing"
            type="button"
            class="btn-secondary"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>

        <ul v-if="errors.length" class="error-list" aria-live="polite">
          <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
        </ul>
      </form>
    </section>

    <section class="panel">
      <h2>All Resources ({{ resources.length }})</h2>

      <table class="table">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th>Title</th>
            <th>Category</th>
            <th width="130">Avg Rating</th>
            <th width="160">Created At</th>
            <th width="120">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.title }}</td>
          <td>{{ r.category }}</td>
          <td>{{ avg(r).toFixed(1) }} ({{ r.ratings.length }})</td>
          <td>{{ formatDate(r.createdAt) }}</td>
          <td class="actions-td">
            <button class="link" @click="startEdit(r)">Edit</button>
            <button class="link-danger" @click="onDelete(r.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="!resources.length">
          <td colspan="6" class="empty">No resources.</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useResources, type Resource } from '../composables/useResources'
import { sanitizeObject, escapeHtml } from '@/utils/security' // 没有别名请改成 ../utils/security

const router = useRouter()
const { currentUser, isAuthenticated } = useAuth()
const {
  resources,
  createResource,
  updateResource,
  deleteResource,
  resetResources
} = useResources()

// 二次防守（路由守卫已经做了）
const isAdmin = computed(() => currentUser.value?.role === 'admin')
if (!isAuthenticated.value || !isAdmin.value) {
  router.replace('/')
}

// ------- 安全 & 校验常量 -------
const MAX_TITLE_LEN = 100
const MAX_CATEGORY_LEN = 50
const MAX_SUMMARY_LEN = 500
const MAX_TAG_LEN = 30
const MAX_TAGS_COUNT = 12
const MAX_TAGS_STR_LEN = 200
const MAX_URL_LEN = 300

const TAG_REGEX = /^[a-z0-9-]+$/i

// ------- 表单状态 -------
type FormState = {
  id: number | null
  title: string
  category: string
  summary: string
  tagsStr: string
  url?: string
}
const emptyForm: FormState = {
  id: null,
  title: '',
  category: '',
  summary: '',
  tagsStr: '',
  url: ''
}
const form = reactive<FormState>({ ...emptyForm })
const errors = ref<string[]>([])
const isEditing = computed(() => form.id !== null)

// ------- 工具 -------
function toTags(str: string): string[] {
  if (!str.trim()) return []
  const arr = str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    // 去重
    .filter((t, i, self) => self.indexOf(t) === i)
    // 长度裁剪
    .map((t) => t.slice(0, MAX_TAG_LEN))
    // 仅保留合法的（字母/数字/-）
    .filter((t) => TAG_REGEX.test(t))
  return arr.slice(0, MAX_TAGS_COUNT)
}
function fromTags(tags: string[]): string {
  return tags.join(',')
}

function validate(): string[] {
  const out: string[] = []
  if (!form.title.trim()) out.push('Title is required.')
  if (!form.category.trim()) out.push('Category is required.')
  if (!form.summary.trim()) out.push('Summary is required.')

  if (form.title.length > MAX_TITLE_LEN) out.push(`Title max length is ${MAX_TITLE_LEN}.`)
  if (form.category.length > MAX_CATEGORY_LEN) out.push(`Category max length is ${MAX_CATEGORY_LEN}.`)
  if (form.summary.length > MAX_SUMMARY_LEN) out.push(`Summary max length is ${MAX_SUMMARY_LEN}.`)
  if (form.tagsStr.length > MAX_TAGS_STR_LEN) out.push(`Tags field max length is ${MAX_TAGS_STR_LEN}.`)
  if (form.url && form.url.length > MAX_URL_LEN) out.push(`URL max length is ${MAX_URL_LEN}.`)

  // URL 结构校验（可选）
  if (form.url) {
    try {
      // 只允许 http/https
      const u = new URL(form.url)
      if (!/^https?:$/.test(u.protocol)) {
        out.push('URL must start with http/https.')
      }
    } catch {
      out.push('Invalid URL format.')
    }
  }

  // tags 额外提示（如果输入了不合法的内容，最终 toTags 会过滤掉）
  const rawTags = form.tagsStr.split(',').map(t => t.trim()).filter(Boolean)
  const invalid = rawTags.filter(t => !TAG_REGEX.test(t))
  if (invalid.length) {
    out.push('Tags can only contain letters, numbers and "-".')
  }

  return out
}

// ------- CRUD handlers -------
function onSubmit() {
  errors.value = validate()
  if (errors.value.length) return

  const raw = {
    title: form.title.trim().slice(0, MAX_TITLE_LEN),
    category: form.category.trim().slice(0, MAX_CATEGORY_LEN),
    summary: form.summary.trim().slice(0, MAX_SUMMARY_LEN),
    url: form.url?.trim() ? form.url.trim().slice(0, MAX_URL_LEN) : undefined
  }

  // 1) 先对基本字段转义
  const safeBase = sanitizeObject(raw)

  // 2) tags 单独深度转义（sanitizeObject 不会深入数组）
  const safeTags = toTags(form.tagsStr).map((t) => escapeHtml(t))

  const payload = {
    ...safeBase,
    tags: safeTags
  }

  if (isEditing.value && form.id != null) {
    const ok = updateResource(form.id, payload)
    if (!ok) {
      errors.value = ['Update failed. Resource not found.']
      return
    }
  } else {
    createResource(payload)
  }

  resetForm()
}

function onDelete(id: number) {
  if (!confirm('Delete this resource?')) return
  deleteResource(id)
  if (isEditing.value && form.id === id) {
    resetForm()
  }
}

function startEdit(r: Resource) {
  form.id = r.id
  form.title = r.title
  form.category = r.category
  form.summary = r.summary
  form.tagsStr = fromTags(r.tags)
  form.url = r.url ?? ''
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  Object.assign(form, emptyForm)
  errors.value = []
}

// Reset mock data
function onReset() {
  if (!confirm('Reset to default mock data?')) return
  resetResources()
  resetForm()
}

// helpers
function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString()
}
function avg(res: Resource) {
  if (!res.ratings.length) return 0
  return res.ratings.reduce((a, b) => a + b, 0) / res.ratings.length
}
</script>

<style scoped>
.container-wide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}

.tip {
  color: #777;
  margin-bottom: 1rem;
}

.panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 6px;
}

.form-control {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-control textarea,
.form-control input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: .25rem;
}

.error-list {
  margin-top: 0.75rem;
  color: #d93025;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.table thead tr {
  background: #f7f7f7;
}
.table th,
.table td {
  border: 1px solid #e4e4e4;
  padding: 8px 10px;
  text-align: left;
}
.actions-td {
  display: flex;
  gap: 8px;
}
.link {
  border: none;
  background: transparent;
  color: #0c63e4;
  cursor: pointer;
}
.link-danger {
  border: none;
  background: transparent;
  color: #c00;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 14px;
  background: #000;
  color: #fff;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn-secondary {
  padding: 8px 14px;
  background: #f2f2f2;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
.btn-danger {
  padding: 8px 14px;
  background: #c00;
  color: #fff;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.empty {
  text-align: center;
  color: #777;
}
</style>
