<template>
  <div class="login-container">
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="login-card glass">
      <div class="login-header">
        <div class="logo-container">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 22V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 7L12 12L3 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h1>SSO Portal</h1>
        <p class="subtitle">Secure access to Smart Port services</p>
      </div>

      <div class="login-body">


        <div class="local-login-form animate-fade-in">
          <p class="select-hint">Enter Admin Credentials</p>
          <div class="demo-credentials-hint" style="margin-top: -12px; margin-bottom: 8px; font-size: 13px; color: #94a3b8; background: rgba(255, 255, 255, 0.03); padding: 8px 12px; border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.15); display: flex; justify-content: center; gap: 8px;">
            <span>รหัสตัวอย่าง:</span>
            <span>ID: <strong style="color: #60a5fa;">admin</strong></span>
            <span style="color: rgba(255, 255, 255, 0.2)">|</span>
            <span>Password: <strong style="color: #60a5fa;">admin</strong></span>
          </div>
          <div class="input-group">
            <input 
              v-model="adminCredentials.username" 
              type="text" 
              placeholder="Username"
              class="login-input"
            />
          </div>
          <div class="input-group">
            <input 
              v-model="adminCredentials.password" 
              type="password" 
              placeholder="Password"
              class="login-input"
            />
          </div>
          <p v-if="loginError" class="login-error-msg">{{ loginError }}</p>
          <button @click="handleLocalLogin" class="btn-primary-login">Login as Admin</button>
        </div>


      </div>

      <div class="registration-area">
        <span class="registration-text">ลงทะเบียน</span>
        <button class="btn-disabled" disabled>ลงทะเบียนเข้าใช้งาน</button>
      </div>

      <div class="login-footer">
        <p>© 2026 Smart Port Authority. All rights reserved.</p>
        <div class="links">
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Help Center</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const identitySources = ref([]);
const loading = ref(true);
const error = ref(null);
const adminMode = ref(false);
const adminCredentials = ref({ username: '', password: '' });
const loginError = ref('');
const router = useRouter();



const handleLocalLogin = async () => {
  loginError.value = '';
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/auth/saml/local/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials.value)
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('sso_user', JSON.stringify(data.user));
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } else {
      loginError.value = data.error || 'Invalid credentials';
    }
  } catch (err) {
    loginError.value = 'Server error. Please try again.';
  }
};


</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: #0f172a;
}

.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.blob {
  position: absolute;
  filter: blur(80px);
  opacity: 0.4;
  border-radius: 50%;
  animation: move 20s infinite alternate;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -100px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #a855f7;
  bottom: -50px;
  right: -50px;
  animation-duration: 25s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: #0ea5e9;
  top: 40%;
  right: 20%;
  animation-duration: 18s;
}

@keyframes move {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(50px, 50px) scale(1.1); }
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 48px;
  z-index: 1;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header h1 {
  color: white;
  font-size: 32px;
  font-weight: 800;
  margin: 16px 0 8px;
  letter-spacing: -0.025em;
}

.logo-container {
  display: inline-flex;
  padding: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
  border-radius: 16px;
  color: white;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 16px;
  margin-bottom: 24px;
}

.mode-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 32px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.local-login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  text-align: left;
}

.login-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  transition: all 0.2s;
}

.login-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: rgba(255, 255, 255, 0.08);
}

.btn-primary-login {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: white;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 8px;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}

.btn-primary-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.login-error-msg {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  margin-top: -8px;
}

.login-body {
  margin-bottom: 24px;
}

.registration-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 24px 24px;
}

.registration-text {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}

.btn-disabled {
  background: #475569;
  color: #94a3b8;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.8;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.select-hint {
  color: #64748b;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 20px;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.provider-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.provider-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.provider-name {
  flex: 1;
  text-align: left;
}

.arrow-icon {
  opacity: 0.5;
  transition: transform 0.2s;
}

.provider-btn:hover .arrow-icon {
  opacity: 1;
  transform: translateX(4px);
}

.loading-state {
  padding: 40px 0;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  padding: 32px 20px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 16px;
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-icon {
  width: 40px;
  height: 40px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-weight: 600;
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.2);
}

.login-footer {
  color: #64748b;
  font-size: 13px;
}

.login-footer p {
  margin-bottom: 8px;
}

.links {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.links a {
  color: #94a3b8;
  transition: color 0.2s;
}

.links a:hover {
  color: white;
}

.empty-state {
  padding: 40px 0;
  color: #94a3b8;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 0;
    max-width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
