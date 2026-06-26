<template>
  <div class="register-container">
    <div class="pmis-bg-blobs">
      <div class="p-blob blob-blue"></div>
      <div class="p-blob blob-purple"></div>
    </div>

    <div class="register-card glass animate-slide-up">
      <div class="sso-logo-header">
        <div class="logo-box">SSO</div>
        <h2>Account Registration</h2>
        <p class="text-muted" v-if="clientId">Registering for access to <strong>{{ clientId }}</strong></p>
        <p class="text-muted" v-else>Register a new Digital Smart Port identity</p>
      </div>

      <div v-if="success" class="success-alert">
        ✅ Registration successful! Redirecting back to application...
      </div>

      <form @submit.prevent="handleRegister" class="register-form" v-else>
        <!-- Identity Assertion Info -->
        <div class="info-alert" v-if="pmisUsername">
          <span class="icon">ℹ️</span>
          <div>
            <strong>Identity Assertion Received</strong>
            <p>Your username was provided by the external system.</p>
          </div>
        </div>

        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="form.username" :disabled="!!pmisUsername" required class="input-field" />
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input type="text" v-model="form.fullName" required class="input-field" placeholder="John Doe" />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input type="email" v-model="form.email" required class="input-field" placeholder="john@example.com" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="form.password" required class="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading">Registering...</span>
          <span v-else>Complete Registration</span>
        </button>
      </form>

      <div class="form-footer" v-if="!success">
        <p>Already have an account? <router-link to="/login">Login here</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const clientId = ref('');
const pmisUsername = ref('');
const redirectUri = ref('');

const form = ref({
  username: '',
  fullName: '',
  email: '',
  password: ''
});

const isLoading = ref(false);
const success = ref(false);

onMounted(() => {
  if (route.query.client_id) clientId.value = route.query.client_id;
  if (route.query.redirect_uri) redirectUri.value = route.query.redirect_uri;
  if (route.query.pmis_username) {
    pmisUsername.value = route.query.pmis_username;
    form.value.username = route.query.pmis_username;
  }
});

const handleRegister = () => {
  isLoading.value = true;
  
  // Simulate API Call
  setTimeout(() => {
    isLoading.value = false;
    success.value = true;
    
    // Auto redirect after 2 seconds
    setTimeout(() => {
      if (redirectUri.value) {
        // Send a fake JWT token back to the requesting app
        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_registration_token";
        window.location.href = `${redirectUri.value}?token=${fakeToken}`;
      } else {
        router.push('/login');
      }
    }, 2000);
  }, 1500);
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background-color: #0b0f19;
  font-family: 'Inter', sans-serif;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.pmis-bg-blobs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.p-blob {
  position: absolute;
  filter: blur(100px);
  opacity: 0.35;
  border-radius: 50%;
}

.blob-blue {
  width: 500px;
  height: 500px;
  background: #3b82f6;
  top: -150px;
  right: -100px;
}

.blob-purple {
  width: 450px;
  height: 450px;
  background: #8b5cf6;
  bottom: -100px;
  left: -100px;
}

.glass {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.register-card {
  width: 100%;
  max-width: 460px;
  padding: 40px;
  border-radius: 20px;
  z-index: 1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.sso-logo-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-box {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  border-radius: 16px;
  margin: 0 auto 16px;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.5);
}

.sso-logo-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.text-muted {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.info-alert {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.info-alert .icon {
  font-size: 20px;
}

.info-alert strong {
  display: block;
  font-size: 13px;
  color: #60a5fa;
  margin-bottom: 4px;
}

.info-alert p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.input-field:disabled {
  background: rgba(15, 23, 42, 0.3);
  color: #64748b;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: wait;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #94a3b8;
}

.form-footer a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
