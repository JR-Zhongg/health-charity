<template>
  <div class="contact container-wide">
    <h2>Contact Us</h2>

    <form @submit.prevent="sendEmail">
      <label>
        Name:
        <input v-model="form.name" required />
      </label>

      <label>
        Email:
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Title:
        <input v-model="form.title" required />
      </label>

      <label>
        Message:
        <textarea v-model="form.message" required></textarea>
      </label>

      <label>
        Attachment:
        <input type="file" @change="handleFile" />
      </label>

      <button type="submit">Send</button>
    </form>

    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import emailjs from 'emailjs-com'

const form = ref({
  name: '',
  email: '',
  title: '',
  message: '',
})

const file = ref<File | null>(null)
const success = ref('')
const error = ref('')

function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
  }
}

async function sendEmail() {
  success.value = ''
  error.value = ''

  try {
    const formData: Record<string, any> = {
      name: form.value.name,
      email: form.value.email,
      title: form.value.title,
      message: form.value.message,
      time: new Date().toLocaleString(),
    }

    // If file is attached, convert to base64
    if (file.value) {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        formData.attachment = base64

        await emailjs.send(
          'service_2hwe0yj',
          'template_r11atbd',
          formData,
          'D04u_2AexxDPTz8wf'
        )

        success.value = 'Email sent successfully!'
      }
      reader.readAsDataURL(file.value)
    } else {
      await emailjs.send(
        'service_2hwe0yj',
        'template_r11atbd',
        formData,
        'D04u_2AexxDPTz8wf'
      )
      success.value = 'Email sent successfully!'
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Failed to send email.'
  }
}
</script>

<style scoped>
.container-wide {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
label {
  display: block;
  margin-bottom: 1rem;
}
input, textarea {
  width: 100%;
  padding: 8px;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
