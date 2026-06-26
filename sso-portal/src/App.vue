<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Sync sso_user and user in localStorage
const syncUserLocalStorage = () => {
  try {
    const ssoUser = localStorage.getItem('sso_user');
    const user = localStorage.getItem('user');
    if (ssoUser && !user) {
      localStorage.setItem('user', ssoUser);
    } else if (user && !ssoUser) {
      localStorage.setItem('sso_user', user);
    }
  } catch (e) {
    console.error('Error syncing localStorage:', e);
  }
};
syncUserLocalStorage();

onMounted(() => {
  // Check for successful auth redirect from backend
  if (route.query.auth === 'success') {
    const provider = route.query.provider;
    
    // Mock user details based on the provider for now
    // In production, this would be a JWT or an actual user fetch from backend
    const mockUser = {
      id: `user_${Date.now()}`,
      provider: provider,
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem('sso_user', JSON.stringify(mockUser));
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Clean up the URL and redirect to dashboard
    router.replace({ path: '/', query: {} });
  }
});
</script>

<style>
/* Any global App level styles if needed */
</style>
