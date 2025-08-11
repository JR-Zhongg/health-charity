<template>
  <div class="auth container-wide">
    <h1>Register</h1>

    <!-- 全局错误汇总（可选） -->
    <ul v-if="summaryErrors.length" class="error-summary" aria-live="polite">
      <li v-for="(e, i) in summaryErrors" :key="i">{{ e }}</li>
    </ul>

    <form @submit.prevent="onSubmit" novalidate>
      <!-- Name -->
      <div class="form-control">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          :maxlength="NAME_MAX"
          :aria-invalid="!!fieldErrors.name"
          :aria-describedby="fieldErrors.name ? 'name-error' : undefined"
          required
        />
        <small class="char-left">{{ NAME_MAX - form.name.length }} characters left</small>
        <p v-if="fieldErrors.name" id="name-error" class="error">{{ fieldErrors.name }}</p>
      </div>

      <!-- Email -->
      <div class="form-control">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          :aria-invalid="!!fieldErrors.email"
          :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
          required
        />
        <p v-if="fieldErrors.email" id="email-error" class="error">{{ fieldErrors.email }}</p>
      </div>

      <!-- Password -->
      <div class="form-control">
        <label for="password">Password *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :aria-invalid="!!fieldErrors.password"
          :aria-describedby="fieldErrors.password ? 'password-error' : 'pwd-hint'"
          required
        />
        <!-- 密码强度提示 -->
        <div class="pwd-strength" :data-strength="pwdStrength.level">
          <div class="bar" :style="{ width: pwdStrength.percent + '%' }"></div>
        </div>
        <small id="pwd-hint" class="help">
          At least 8 chars, include upper/lowercase letters and a number.
        </small>
        <p v-if="fieldErrors.password" id="password-error" class="error">{{ fieldErrors.password }}</p>
      </div>

      <!-- Confirm Password -->
      <div class="form-control">
        <label for="confirm">Confirm Password *</label>
        <input
          id="confirm"
          v-model="form.confirm"
          type="password"
          autocomplete="new-password"
          :aria-invalid="!!fieldErrors.confirm"
          :aria-describedby="fieldErrors.confirm ? 'confirm-error' : undefined"
          required
        />
        <p v-if="fieldErrors.confirm" id="confirm-error" class="error">{{ fieldErrors.confirm }}</p>
      </div>

      <!-- Role（演示需要可保留；真实项目通常只由后台分配 admin） -->
      <div class="form-control">
        <label for="role">Role</label>
        <select id="role" v-model="form.role">
          <option value="user">User</option>
          <option value="admin">Admin (demo)</option>
        </select>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting || hasAnyError">
        {{ isSubmitting ? 'Submitting...' : 'Create Account' }}
      </button>
    </form>

    <p class="tip">
      Already have an account?
      <RouterLink to="/login">Login</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, type Role } from '../composables/useAuth'

// 常量
const NAME_MAX = 50

// 逻辑
const router = useRouter()
const { register, login, users } = useAuth()

type Form = {
  name: string
  email: string
  password: string
  confirm: string
  role: Role
}
const form = reactive<Form>({
  name: '',
  email: '',
  password: '',
  confirm: '',
  role: 'user'
})

const fieldErrors = reactive<Record<keyof Form, string | null>>({
  name: null,
  email: null,
  password: null,
  confirm: null,
  role: null
})
const summaryErrors = ref<string[]>([])
const isSubmitting = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 密码强度（简单示例）
const pwdStrength = computed(() => {
  const pwd = form.password
  let score = 0
  if (pwd.length >= 8) score += 1
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/\d/.test(pwd)) score += 1
  const percent = (score / 4) * 100
  const level = score <= 1 ? 'weak' : score === 2 ? 'medium' : 'strong'
  return { score, percent, level }
})

// 有任何错误就禁用提交
const hasAnyError = computed(() =>
  Object.values(fieldErrors).some((e) => !!e)
)

/** 前端本地验证（更友好提示），再交给 useAuth.register 二次校验 */
function validateLocal(): string[] {
  const errors: string[] = []

  // Name
  if (!form.name.trim()) {
    fieldErrors.name = 'Name is required.'
  } else if (form.name.length > NAME_MAX) {
    fieldErrors.name = `Name must be ≤ ${NAME_MAX} characters.`
  } else {
    fieldErrors.name = null
  }

  // Email
  if (!form.email.trim()) {
    fieldErrors.email = 'Email is required.'
  } else if (!emailRe.test(form.email)) {
    fieldErrors.email = 'Invalid email format.'
  } else if (users.value.some(u => u.email === form.email.trim().toLowerCase())) {
    fieldErrors.email = 'This email is already registered.'
  } else {
    fieldErrors.email = null
  }

  // Password
  const pwd = form.password
  if (!pwd) {
    fieldErrors.password = 'Password is required.'
  } else if (pwd.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.'
  } else if (!(/[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd))) {
    fieldErrors.password = 'Password must include upper/lowercase letters and a number.'
  } else {
    fieldErrors.password = null
  }

  // Confirm
  if (!form.confirm) {
    fieldErrors.confirm = 'Please confirm your password.'
  } else if (form.confirm !== form.password) {
    fieldErrors.confirm = 'Passwords do not match.'
  } else {
    fieldErrors.confirm = null
  }

  // 汇总
  Object.values(fieldErrors).forEach((e) => {
    if (e) errors.push(e)
  })

  return errors
}

async function onSubmit() {
  summaryErrors.value = []
  const local = validateLocal()
  if (local.length) {
    summaryErrors.value = local
    return
  }

  isSubmitting.value = true
  const res = register({
    name: form.name,
    email: form.email,
    password: form.password,
    role: form.role
  })

  if (!res.success) {
    // useAuth.register 的二次校验（防止绕过）
    summaryErrors.value = res.errors ?? ['Register failed']
    isSubmitting.value = false
    return
  }

  // 自动登录
  const loginRes = login({ email: form.email, password: form.password })
  isSubmitting.value = false
  if (loginRes.success) {
    router.push('/')
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
input, select, textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input[aria-invalid="true"],
select[aria-invalid="true"],
textarea[aria-invalid="true"] {
  border-color: #d93025;
}
.char-left {
  color: #777;
  font-size: 0.75rem;
  margin-top: 4px;
}
.error {
  color: #d93025;
  font-size: 0.85rem;
  margin-top: 4px;
}
.help {
  color: #777;
  font-size: 0.75rem;
  margin-top: 4px;
}
.pwd-strength {
  margin: 6px 0 2px;
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.pwd-strength .bar {
  height: 100%;
  transition: width 0.2s ease;
}
.pwd-strength[data-strength="weak"] .bar {
  background: #d93025;
}
.pwd-strength[data-strength="medium"] .bar {
  background: #f6b100;
}
.pwd-strength[data-strength="strong"] .bar {
  background: #2e7d32;
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
