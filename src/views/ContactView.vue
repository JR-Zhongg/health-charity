<template>
  <div class="container-wide">
    <h1>Contact & Support</h1>
    <p class="lead">
      Need help? Send us a message and we’ll get back to you as soon as we can.
    </p>

    <form class="contact-form" @submit.prevent="onSubmit" novalidate>
      <div class="form-control">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model.trim="name"
          type="text"
          :aria-invalid="!!errors.name"
        />
        <p v-if="errors.name" class="error">{{ errors.name }}</p>
      </div>

      <div class="form-control">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          :aria-invalid="!!errors.email"
        />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>
      </div>

      <div class="form-control">
        <label for="message">Message *</label>
        <textarea
          id="message"
          v-model.trim="message"
          rows="5"
          :maxlength="500"
          :aria-invalid="!!errors.message"
        ></textarea>
        <small class="char-left">{{ 500 - message.length }} characters left</small>
        <p v-if="errors.message" class="error">{{ errors.message }}</p>
      </div>

      <button type="submit" class="btn-primary">Send</button>

      <p v-if="success" class="success">
        Thank you for your message! We’ll be in touch soon.
      </p>
    </form>

    <section class="info">
      <h2>Other ways to reach us</h2>
      <ul>
        <li>Email: support@healthcharity.org</li>
        <li>Phone: (03) 1234 5678 (Mon–Fri 9am–5pm)</li>
        <li>Address: 123 Wellbeing Street, Melbourne, VIC</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useContacts } from '../composables/useContacts'

const { addMessage } = useContacts()

const name = ref('')
const email = ref('')
const message = ref('')
const success = ref(false)

const errors = reactive<{ name: string | null; email: string | null; message: string | null }>({
  name: null,
  email: null,
  message: null
})

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.name = !name.value ? 'Name is required.' : null
  errors.email = !email.value
    ? 'Email is required.'
    : !emailRe.test(email.value)
      ? 'Invalid email format.'
      : null
  errors.message = !message.value
    ? 'Message is required.'
    : message.value.length > 500
      ? 'Message must be ≤ 500 characters.'
      : null

  return !(errors.name || errors.email || errors.message)
}

function onSubmit() {
  success.value = false
  if (!validate()) return

  addMessage({
    name: name.value,
    email: email.value,
    message: message.value
  })

  name.value = ''
  email.value = ''
  message.value = ''
  success.value = true
}
</script>

<style scoped>
.container-wide {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}
.lead {
  color: #555;
  margin-bottom: 1.25rem;
}
.contact-form {
  margin-top: 1rem;
}
.form-control {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
input, textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input[aria-invalid="true"],
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
.success {
  margin-top: 1rem;
  color: #2e7d32;
}
.btn-primary {
  padding: 10px 16px;
  border: none;
  background: #000;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.info {
  margin-top: 2rem;
}
</style>
