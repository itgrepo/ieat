import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'
import router from './router'

// Intercept Tableau hash routes that leaked to the root domain (due to Tableau SPA using absolute root paths)
const tableauHashes = ['#/signin', '#/views', '#/explore', '#/site', '#/users', '#/workbooks', '#/projects', '#/metrics', '#/datasources'];
if (tableauHashes.some(hash => window.location.hash.startsWith(hash))) {
  window.location.href = '/tableau/' + window.location.hash;
} else {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
