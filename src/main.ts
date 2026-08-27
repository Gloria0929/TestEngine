import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/index.scss'
import App from './App.vue'
import router from './router'
import { bootstrapMock } from './mocks/browser'
import { i18n } from './locales'
import { permission } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.directive('permission', permission)
for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp)
}
async function bootstrap() {
  await bootstrapMock()
  app.mount('#app')
}
bootstrap()
