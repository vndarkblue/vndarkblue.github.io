import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

createApp(App)
  .use(router)
  .use(createVuetify())
  .mount('#app')
