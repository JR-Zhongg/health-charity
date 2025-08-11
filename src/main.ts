import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/tokens.css'

import 'primeicons/primeicons.css'
// 修正后的正确路径：从 'lara' 文件夹内部导入 'light-blue'
import Lara from '@primevue/themes/lara';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 使用我们用正确路径导入的 Preset 对象
app.use(PrimeVue, {
  theme: {
    preset: Lara
  }
})

app.mount('#app')
