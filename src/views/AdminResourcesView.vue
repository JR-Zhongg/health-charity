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
          <div class="label-with-action">
            <label for="summary">Summary *</label>
            <button
              type="button"
              class="btn-ai"
              @click="onGenerateSummary"
              :disabled="isGeneratingSummary || !form.title"
              title="Generate summary based on title and category"
            >
              {{ isGeneratingSummary ? 'Generating...' : '✨ AI Generate' }}
            </button>
          </div>
          <textarea
            id="summary"
            v-model.trim="form.summary"
            rows="3"
            required
            :maxlength="MAX_SUMMARY_LEN"
          />
          <p v-if="aiError" class="error-text">{{ aiError }}</p>
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
import { useAi } from '../composables/useAi'
import { sanitizeObject, escapeHtml } from '../utils/security'

const router = useRouter()
const { role, isAuthenticated } = useAuth()
// ✅ FIX: Removed 'resetResources' as it no longer exists in the Firestore version
const {
  resources,
  createResource,
  updateResource,
  deleteResource,
} = useResources()

const { isLoading: isGeneratingSummary, error: aiError, generateSummary } = useAi()

const isAdmin = computed(() => role.value === 'admin')
if (!isAuthenticated.value || !isAdmin.value) {
  router.replace('/')
}

const MAX_TITLE_LEN = 100
const MAX_CATEGORY_LEN = 50
const MAX_SUMMARY_LEN = 500
const MAX_TAG_LEN = 30
const MAX_TAGS_COUNT = 12
const MAX_TAGS_STR_LEN = 200
const MAX_URL_LEN = 300
const TAG_REGEX = /^[a-z0-9-]+$/i
type FormState = {
  id: string | null
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

async function onGenerateSummary() {
  if (!form.title.trim()) {
    alert('Please enter a title first.');
    return;
  }
  try {
    const summary = await generateSummary(form.title, form.category);
    form.summary = summary;
  } catch (err) {
    console.error(err);
  }
}

function toTags(str: string): string[] {
  if (!str.trim()) return []
  const arr = str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t, i, self) => self.indexOf(t) === i)
    .map((t) => t.slice(0, MAX_TAG_LEN))
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
  return out
}
async function onSubmit() {
  errors.value = validate()
  if (errors.value.length) return

  const raw = {
    title: form.title.trim().slice(0, MAX_TITLE_LEN),
    category: form.category.trim().slice(0, MAX_CATEGORY_LEN),
    summary: form.summary.trim().slice(0, MAX_SUMMARY_LEN),
    url: form.url?.trim() ? form.url.trim().slice(0, MAX_URL_LEN) : undefined
  }

  const safeBase = sanitizeObject(raw)
  const safeTags = toTags(form.tagsStr).map((t) => escapeHtml(t))

  const payload = { ...safeBase, tags: safeTags }

  if (isEditing.value && form.id != null) {
    await updateResource(form.id, payload)
  } else {
    await createResource(payload)
  }
  resetForm()
}
function onDelete(id: string) {
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
function onReset() {
  // ✅ FIX: Removed the call to resetResources() and added a user-friendly alert.
  // Resetting the entire database would require a Cloud Function.
  alert('Resetting to mock data is disabled when using the live Firestore database.');
  resetForm()
}
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
}
.panel {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 8px;
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
}
.error-list {
  margin-top: 0.75rem;
  color: #d93025;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #e4e4e4;
  padding: 8px 10px;
  text-align: left;
}
.actions-td {
  display: flex;
  gap: 8px;
}
.link, .link-danger {
  border: none;
  background: transparent;
  cursor: pointer;
}
.link { color: #0c63e4; }
.link-danger { color: #c00; }
.btn-primary, .btn-secondary, .btn-danger {
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary { background: #000; color: #fff; border: none; }
.btn-secondary { background: #f2f2f2; color: #333; border: 1px solid #ccc; }
.btn-danger { background: #c00; color: #fff; border: none; }
.empty { text-align: center; color: #777; }

.label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
.btn-ai {
  padding: 4px 8px;
  font-size: 0.8rem;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error-text {
  color: #d93025;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
</style>
