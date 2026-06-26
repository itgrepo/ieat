<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-text">Digital</span>
        <span class="logo-subtext">Smart Port</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-item">
          <LayoutDashboard :size="20" />
          <span>Data Exchange & API</span>
        </div>
        <div class="nav-item">
          <BarChart3 :size="20" />
          <span>Executive Dashboard</span>
        </div>
        <div class="nav-item">
          <Globe :size="20" />
          <span>Smart Port Portal (SSO)</span>
        </div>
      </div>

      <div class="nav-section active">
        <div class="nav-item dropdown-toggle" @click="toggleSSO">
          <Settings :size="20" />
          <span>SSO Settings</span>
          <ChevronDown :size="16" :class="{ 'rotate-180': isSSOOpen }" />
        </div>
        
        <transition name="slide">
          <div v-if="isSSOOpen" class="submenu">
            <router-link to="/" class="submenu-item" active-class="active">Dashboard</router-link>
            <router-link to="/admin/users" class="submenu-item" active-class="active">Users</router-link>
            <router-link to="/admin/applications" class="submenu-item" active-class="active">Applications Management</router-link>
            <router-link to="/admin/idp" class="submenu-item" active-class="active">ID Providers</router-link>
            <router-link to="/admin/logs" class="submenu-item" active-class="active">Logs</router-link>
            <div class="submenu-item">Contact</div>
          </div>
        </transition>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">
          <User :size="20" />
        </div>
        <span class="username">{{ activeUser?.fullName || activeUser?.username || 'User' }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  LayoutDashboard, 
  BarChart3, 
  Globe, 
  Settings, 
  ChevronDown, 
  User 
} from 'lucide-vue-next'

const isSSOOpen = ref(true)

const activeUser = ref(null)

const loadActiveUser = () => {
  const userStr = localStorage.getItem('sso_user') || localStorage.getItem('user')
  activeUser.value = userStr ? JSON.parse(userStr) : null
}

onMounted(() => {
  loadActiveUser()
  window.addEventListener('auth-change', loadActiveUser)
  window.addEventListener('storage', loadActiveUser)
})

onUnmounted(() => {
  window.removeEventListener('auth-change', loadActiveUser)
  window.removeEventListener('storage', loadActiveUser)
})

const toggleSSO = () => {
  isSSOOpen.value = !isSSOOpen.value
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-sidebar);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  font-italic: italic;
  color: #60a5fa;
}

.logo-subtext {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-section {
  margin-bottom: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-section.active .nav-item {
  background: #312e81;
}

.dropdown-toggle {
  justify-content: space-between;
}

.submenu {
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.submenu-item {
  padding: 10px 20px 10px 52px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
  display: block;
  transition: all 0.2s;
}

.submenu-item:hover, .submenu-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.submenu-item.active {
  border-left: 3px solid #60a5fa;
  padding-left: 49px;
}

.rotate-180 {
  transform: rotate(180deg);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 12px;
  border-radius: 30px;
  color: #1e293b;
}

.avatar {
  background: #e2e8f0;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

/* Animations */
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.3s ease-out;
  max-height: 300px;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
}
</style>
