<template>
  <div class="auth container-wide">
    <h1>Login</h1>

    <ul v-if="summaryErrors.length" class="error-summary" aria-live="polite">
      <li v-for="(e, i) in summaryErrors" :key="i">{{ e }}</li>
    </ul>

    <form @submit.prevent="onSubmit" novalidate>
      <div class="form-control">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          :aria-invalid="!!fieldErrors.email"
          :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
          required
        />
        <p v-if="fieldErrors.email" id="email-error" class="error">{{ fieldErrors.email }}</p>
      </div>

      <div class="form-control">
        <label for="password">Password *</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          :aria-invalid="!!fieldErrors.password"
          :aria-describedby="fieldErrors.password ? 'password-error' : undefined"
          required
        />
        <p v-if="fieldErrors.password" id="password-error" class="error">{{ fieldErrors.password }}</p>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting || hasAnyError">
        {{ isSubmitting ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p class="tip">
      No account?
      <RouterLink to="/register">Register here</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth' // 若使用别名，请改成 '@/composables/useAuth'

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const email = ref('')
const password = ref('')

const fieldErrors = reactive<{ email: string | null; password: string | null }>({
  email: null,
  password: null
})
const summaryErrors = ref<string[]>([])
const isSubmitting = ref(false)

const hasAnyError = computed(() => !!fieldErrors.email || !!fieldErrors.password)

function validateLocal(): string[] {
  const errors: string[] = []

  // Email
  if (!email.value.trim()) {
    fieldErrors.email = 'Email is required.'
  } else if (!emailRe.test(email.value)) {
    fieldErrors.email = 'Invalid email format.'
  } else {
    fieldErrors.email = null
  }

  // Password
  if (!password.value) {
    fieldErrors.password = 'Password is required.'
  } else {
    fieldErrors.password = null
  }

  if (fieldErrors.email) errors.push(fieldErrors.email)
  if (fieldErrors.password) errors.push(fieldErrors.password)

  return errors
}

function mapFirebaseError(err: unknown): string {
  const msg = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as { message: string }).message)
    : ''

  if (msg.includes('auth/invalid-email')) return 'Invalid email format.'
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) return 'Email or password is incorrect.'
  if (msg.includes('auth/user-not-found')) return 'User not found.'
  if (msg.includes('auth/too-many-requests')) return 'Too many attempts. Please try again later.'
  return 'Login failed. Please try again.'
}


async function onSubmit() {
  summaryErrors.value = []

  const local = validateLocal()
  if (local.length) {
    summaryErrors.value = local
    return
  }

  isSubmitting.value = true
  try {
    await login(email.value.trim(), password.value)
    // 登录成功后的跳转
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e) {
    summaryErrors.value = [mapFirebaseError(e)]
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.container-wide {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 20px;
}
h1 {
  margin-bottom: 1rem;
}
.error-summary {
  border: 1px solid #f3c2c2;
  background: #fde8e8;
  color: #c00;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.form-control {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input[aria-invalid="true"] {
  border-color: #d93025;
}
.error {
  color: #d93025;
  font-size: 0.85rem;
  margin-top: 4px;
}
.btn-primary {
  padding: 10px 16px;
  border: none;
  background: #000;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.tip {
  margin-top: 1rem;
}
</style>
