<template>
  <div 
    class="user-profile-box" 
    :class="{ 'on-sidebar': variant === 'sidebar', 'clickable': variant === 'sidebar' }"
    @click="variant === 'sidebar' && goToProfile()"
  >
    <div class="avatar">
      <User :size="avatarSize" />
    </div>
    <div class="user-info" v-if="variant === 'sidebar'">
      <span class="username">{{ name }}</span>
    </div>
    
    <!-- Logout button for header variant -->
    <button v-if="variant === 'header'" @click="handleLogout" class="header-logout-btn" title="Logout">
      <LogOut :size="16" />
      <span>Logout</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { User, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  name: String,
  variant: {
    type: String,
    default: 'header' // 'header' or 'sidebar'
  }
})

const router = useRouter()
const avatarSize = computed(() => props.variant === 'sidebar' ? 20 : 24)

const handleLogout = () => {
  localStorage.removeItem('sso_user');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Use router push to handle base path correctly
  router.push('/login');
};

const goToProfile = () => {
  router.push('/profile');
};
</script>

<style scoped>
.user-profile-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.on-sidebar {
  background: white;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  color: var(--bg-sidebar);
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  filter: brightness(0.95);
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

.header-logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
}

.header-logout-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.header-logout-btn span {
  display: inline-block;
}

@media (max-width: 640px) {
  .header-logout-btn span {
    display: none;
  }
}
</style>
