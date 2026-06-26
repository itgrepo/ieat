<template>
  <div class="sidebar-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-text">Digital</span>
          <span class="logo-subtext">Smart Port</span>
        </div>
      </div>

      <nav class="sidebar-nav" ref="sidebarNavRef">
        <!-- Main Nav Sections -->
        <div class="nav-section" v-for="section in menuItems" :key="section.label" :class="{ 'active': isSectionActive(section) }">
          <div class="nav-item" :class="{ 'dropdown-toggle': section.children }" @click="handleItemClick(section)">
            <component :is="section.icon" :size="20" />
            <span>{{ section.label }}</span>
            <ChevronDown v-if="section.children" :size="16" :class="{ 'rotate-180': openSections.includes(section.label) }" />
          </div>
          
          <transition name="slide">
            <div v-if="section.children && openSections.includes(section.label)" class="submenu">
              <router-link 
                v-for="child in section.children" 
                :key="child.path" 
                :to="child.path" 
                class="submenu-item" 
                exact-active-class="active"
              >
                {{ child.label }}
              </router-link>
            </div>
          </transition>
        </div>
      </nav>

      <div class="sidebar-footer">
        <UserProfileBox :name="displayName" variant="sidebar" />
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="18" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  BarChart3, 
  Globe, 
  Settings, 
  ChevronDown,
  LogOut,
  Database,
  Star,
  Wrench,
  FolderTree
} from 'lucide-vue-next'
import UserProfileBox from './common/UserProfileBox.vue'

const route = useRoute()
const router = useRouter()
const sidebarNavRef = ref(null)
const openSections = ref(['Smart Port Portal (SSO)', 'SSO Settings', 'Dataset Management Tools'])
const displayName = ref('User')
const isAdmin = ref(false)

const loadUserInfo = () => {
  const ssoUserStr = localStorage.getItem('sso_user')
  let activeUser = null
  if (ssoUserStr) {
    try {
      const ssoUser = JSON.parse(ssoUserStr)
      activeUser = ssoUser
      if (ssoUser.fullName) {
        displayName.value = ssoUser.fullName
      } else if (ssoUser.username) {
        displayName.value = ssoUser.username
      } else if (ssoUser.provider) {
        displayName.value = `User (${ssoUser.provider})`
      }
    } catch (e) {}
  } else {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        activeUser = user
        if (user.firstname) {
          displayName.value = `${user.firstname} ${user.lastname || ''}`
        } else if (user.username) {
          displayName.value = user.username
        }
      } catch (e) {}
    }
  }

  if (activeUser) {
    isAdmin.value = activeUser.role === 'Admin' || activeUser.department === 'Administrator'
  }
}

onMounted(() => {
  loadUserInfo()
  window.addEventListener('auth-change', loadUserInfo)
  window.addEventListener('storage', loadUserInfo)

  // Auto scroll to active menu item
  setTimeout(() => {
    if (sidebarNavRef.value) {
      const activeElement = sidebarNavRef.value.querySelector('.active')
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, 150)
})

onUnmounted(() => {
  window.removeEventListener('auth-change', loadUserInfo)
  window.removeEventListener('storage', loadUserInfo)
})

const handleLogout = () => {
  localStorage.removeItem('sso_user');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth-change'));
  // Use router.push to respect the base path /sso-portal/
  router.push('/login');
};

const menuItems = computed(() => {
  const baseItems = [
    { label: 'Dataset', icon: Database, path: '/' },
    { label: 'Favorites', icon: Star, path: '/favorites' },
    { 
      label: 'Smart Port Portal (SSO)', 
      icon: Globe, 
      children: [
        { label: 'System Dashboard', path: '/sso-portal' }
      ]
    }
  ]

  if (!isAdmin.value) {
    return baseItems
  }

  return [
    ...baseItems,
    { 
      label: 'SSO Settings', 
      icon: Settings,
      children: [
        { label: 'User Management', path: '/admin/users' },
        { label: 'Applications Management', path: '/admin/applications' },
        { label: 'Logs', path: '/admin/logs' }
      ]
    },
    {
      label: 'Dataset Management Tools',
      icon: FolderTree,
      children: [
        { label: 'API Management', path: '/api-management' },
        { label: 'API Monitor', path: '/api-monitor' },
        { label: 'Permission Monitoring', path: '/dataset-permission-monitor' },
        { label: 'Permission Management', path: '/permission-management' },
        { label: 'Group User Management', path: '/group-user-management' },
        { label: 'Dataset Management', path: '/dataset-management' },
        { label: 'Organization Management', path: '/organization-management' },
        { label: 'Category Management', path: '/category-management' },
        { label: 'Group Dataset Management', path: '/group-dataset-management' },
        { label: 'Dataset Configuration', path: '/dataset-config' }
      ]
    }
  ]
})

const isSectionActive = (section) => {
  if (section.path === route.path) return true
  if (section.children) {
    return section.children.some(child => child.path === route.path)
  }
  return false
}

const handleItemClick = (section) => {
  if (section.children) {
    const index = openSections.value.indexOf(section.label)
    if (index > -1) {
      openSections.value.splice(index, 1)
    } else {
      openSections.value.push(section.label)
    }
  } else if (section.path) {
    router.push(section.path)
  }
}
</script>

<style scoped>
.sidebar-container {
  width: var(--sidebar-width);
  flex-shrink: 0;
}

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

.logo { display: flex; flex-direction: column; }
.logo-text { font-size: 24px; font-weight: 800; color: var(--accent-blue); font-style: italic; }
.logo-subtext { font-size: 18px; font-weight: 600; color: var(--text-white); }

.sidebar-nav { 
  flex: 1; 
  padding: 20px 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.nav-section { margin-bottom: 10px; }
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

.nav-item:hover { background: rgba(255, 255, 255, 0.05); }
.nav-section.active .nav-item { background: #312e81; }
.dropdown-toggle { justify-content: space-between; }

.submenu { background: rgba(0, 0, 0, 0.2); overflow: hidden; }
.submenu-item {
  padding: 10px 20px 10px 52px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
  display: block;
  transition: all 0.2s;
}

.submenu-item:hover, .submenu-item.active { color: white; background: rgba(255, 255, 255, 0.05); }
.submenu-item.active { border-left: 3px solid var(--accent-blue); padding-left: 49px; }

.rotate-180 { transform: rotate(180deg); transition: transform 0.2s; }
.sidebar-footer { padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; gap: 16px; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Animations */
.slide-enter-active, .slide-leave-active { transition: max-height 0.3s ease-out; max-height: 400px; }
.slide-enter-from, .slide-leave-to { max-height: 0; }
</style>
