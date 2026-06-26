<template>
  <div class="pmis-container">
    <!-- Background Design -->
    <div class="pmis-bg-blobs">
      <div class="p-blob blob-pink"></div>
      <div class="p-blob blob-indigo"></div>
    </div>

    <!-- 1. LOADING STATE -->
    <div v-if="isValidating" class="state-card glass animate-fade-in" :class="{ 'expanded': soapRequest }">
      <div class="sso-logo-spin">
        <div class="pulse-ring"></div>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M12 22V12" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21 7L12 12L3 7" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h3>SSO Token Validation</h3>
      <p class="text-muted">PMIS is validating your secure identity assertion token with the SSO Portal. Please wait...</p>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>

      <!-- SOAP XML Live Handshake Debugger -->
      <div v-if="soapRequest || soapResponse" class="soap-debugger-panel">
        <div class="soap-debugger-header" @click="showSoapLog = !showSoapLog">
          <span>⚡ [Phase 3] PMIS Token Validation Logs</span>
          <span class="chevron-arrow">{{ showSoapLog ? '▲' : '▼' }}</span>
        </div>
        <div v-if="showSoapLog" class="soap-debugger-body animate-slide-up">
          <div class="soap-code-sec" v-if="soapRequest">
            <h6>Line 17: ValidateToken (SSO Token) -> Sent to SSO</h6>
            <pre><code>{{ soapRequest }}</code></pre>
          </div>
          <div class="soap-code-sec" v-if="soapResponse">
            <h6>Line 18: ValidateToken Response (Valid/Invalid) -> Received</h6>
            <pre><code>{{ soapResponse }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. ERROR/INVALID STATE -->
    <div v-else-if="authError" class="state-card glass border-red animate-slide-up">
      <div class="error-badge-icon">✕</div>
      <h3>Access Denied</h3>
      <p class="error-msg">{{ authError }}</p>
      <p class="text-muted">PMIS requires a valid, active Single Sign-On (SSO) assertion. Direct login is disabled for this system.</p>
      <div class="action-buttons" style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
        <router-link to="/login" class="btn-sso">Login via SSO Portal</router-link>
        <router-link to="/register?client_id=PMIS&amp;redirect_uri=http://dsp.ieat.go.th:8080/apps/pmis&amp;pmis_username=pmis_officer" class="btn-sso" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">Simulate PMIS Registration Redirect</router-link>
      </div>
    </div>

    <!-- 3. SUCCESS / MOCK PMIS DASHBOARD -->
    <div v-else class="pmis-dashboard glass animate-slide-up">
      <!-- Premium SSO Bypass Header (Phase 3) -->
      <div class="sso-bypass-banner">
        <div class="banner-icon-bg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="banner-text">
          <h5>Phase 3: SSO Access to Target System</h5>
          <p>SSO Token Validated via IdP (Line 18). Authorisation Check: Granted (Line 20). Access to PMIS System Allowed (Line 21).</p>
        </div>
        <span class="protocol-badge">Token Validated</span>
      </div>

      <!-- Main PMIS Header -->
      <div class="pmis-header">
        <div class="pmis-title">
          <div class="pmis-logo">
            <span>P</span>
          </div>
          <div>
            <h2>Personal Management Information System (PMIS)</h2>
            <p class="text-muted">Port Authority Personal & Revenue Management Panel</p>
          </div>
        </div>
        <button @click="backToSSO" class="btn-back">
          ← Back to Portal
        </button>
      </div>

      <!-- Content Grid -->
      <div class="dashboard-grid">
        <!-- User Info Card -->
        <div class="info-card">
          <div class="card-title-sec">
            <h5>Authenticated User Profile</h5>
          </div>
          <div class="profile-avatar-sec">
            <div class="avatar-circle">
              {{ initials }}
            </div>
            <div class="avatar-info">
              <h4>{{ user.fullName }}</h4>
              <p class="user-role-pill">{{ user.role || 'Officer' }}</p>
            </div>
          </div>

          <div class="user-details-list">
            <div class="detail-item">
              <span class="det-label">Username</span>
              <span class="det-val">{{ user.username }}</span>
            </div>
            <div class="detail-item">
              <span class="det-label">Email Address</span>
              <span class="det-val">{{ user.email }}</span>
            </div>
            <div class="detail-item">
              <span class="det-label">System Type</span>
              <span class="det-val uppercase">{{ user.department || 'OFFICER' }}</span>
            </div>
            <div class="detail-item">
              <span class="det-label">Auth Provider</span>
              <span class="det-val provider-highlight">SSO Portal SAML 2.0</span>
            </div>
          </div>
        </div>

        <!-- System Stats / Features -->
        <div class="pmis-features">
          <div class="card-title-sec">
            <h5>Simulated PMIS Operations</h5>
          </div>
          <div class="features-grid">
            <div class="feat-box">
              <span class="feat-icon">📊</span>
              <h6>Personal Database</h6>
              <p>Search and manage smart port employee accounts and assignments.</p>
            </div>
            <div class="feat-box">
              <span class="feat-icon">📑</span>
              <h6>Salary & Payroll</h6>
              <p>Review monthly financial logs, tax reports, and salary slips.</p>
            </div>
            <div class="feat-box">
              <span class="feat-icon">⏱</span>
              <h6>Attendance Logging</h6>
              <p>Real-time vessel and terminal operations scheduling logs.</p>
            </div>
            <div class="feat-box">
              <span class="feat-icon">🔐</span>
              <h6>Security Audit</h6>
              <p>Manage API scopes and SSO federation credentials for external tools.</p>
            </div>
          </div>
          <div class="audit-disclaimer">
            <p><strong>Security Notice:</strong> All actions under this session are signed with SSO ID: <code>{{ user.id }}</code> and logged in the Smart Port Central Audit Log repository.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isValidating = ref(true);
const authError = ref(null);
const user = ref({});

const soapRequest = ref('');
const soapResponse = ref('');
const showSoapLog = ref(true);

const initials = computed(() => {
  if (!user.value.fullName) return 'U';
  return user.value.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const validateSSOToken = async (token) => {
  isValidating.value = true;
  authError.value = null;

  // 1. Construct SOAP XML Request
  const soapXmlReq = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sso="http://sso.ieat.go.th/">
  <soapenv:Header/>
  <soapenv:Body>
    <sso:ValidateToken>
      <sso:token>${token}</sso:token>
    </sso:ValidateToken>
  </soapenv:Body>
</soapenv:Envelope>`;

  soapRequest.value = soapXmlReq;

  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/soap/sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: soapXmlReq
    });

    const xmlText = await response.text();
    soapResponse.value = xmlText;

    // 2. Parse SOAP XML Response using browser DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check if SOAP Fault exists
    const faultCode = xmlDoc.getElementsByTagName('faultcode')[0];
    const faultString = xmlDoc.getElementsByTagName('faultstring')[0];
    if (faultCode) {
      authError.value = `SOAP Fault: ${faultString?.textContent || 'Internal server error'}`;
      return;
    }

    const validNode = xmlDoc.getElementsByTagName('valid')[0];
    const isValid = validNode?.textContent === 'true';

    if (isValid) {
      const idNode = xmlDoc.getElementsByTagName('id')[0];
      const usernameNode = xmlDoc.getElementsByTagName('username')[0];
      const emailNode = xmlDoc.getElementsByTagName('email')[0];
      const fullNameNode = xmlDoc.getElementsByTagName('fullName')[0];
      const roleNode = xmlDoc.getElementsByTagName('role')[0];
      const departmentNode = xmlDoc.getElementsByTagName('department')[0];

      const userData = {
        id: idNode?.textContent || '',
        username: usernameNode?.textContent || '',
        email: emailNode?.textContent || '',
        fullName: fullNameNode?.textContent || '',
        role: roleNode?.textContent || 'User',
        department: departmentNode?.textContent || 'PMIS'
      };

      user.value = userData;
      localStorage.setItem('sso_user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      authError.value = 'Invalid or expired single sign-on token (SOAP Validation failed).';
    }
  } catch (err) {
    console.error('Error validating SOAP token:', err);
    authError.value = 'Failed to connect to the SSO identity provider SOAP endpoint.';
  } finally {
    // Artificial 2.5s delay to make the premium animation look fantastic and allow viewing logs
    setTimeout(() => {
      isValidating.value = false;
    }, 2500);
  }
};

const backToSSO = () => {
  router.push('/');
};

onMounted(() => {
  const token = route.query.token;
  if (token) {
    validateSSOToken(token);
  } else {
    // If no token, check if logged in already in local storage
    const cachedUser = localStorage.getItem('sso_user');
    if (cachedUser) {
      user.value = JSON.parse(cachedUser);
      isValidating.value = false;
    } else {
      isValidating.value = false;
      authError.value = 'No single sign-on token provided. Deep-link authentication required.';
    }
  }
});
</script>

<style scoped>
.pmis-container {
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

.blob-pink {
  width: 500px;
  height: 500px;
  background: #ec4899;
  top: -150px;
  right: -100px;
}

.blob-indigo {
  width: 450px;
  height: 450px;
  background: #4f46e5;
  bottom: -100px;
  left: -100px;
}

.glass {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.state-card {
  width: 100%;
  max-width: 460px;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  z-index: 1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.border-red {
  border-color: rgba(239, 68, 68, 0.3);
}

.sso-logo-spin {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 50%;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #ec4899;
  border-radius: 50%;
  animation: pulse-ring-anim 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

@keyframes pulse-ring-anim {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}

.state-card h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.text-muted {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 24px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #ec4899, #6366f1);
  border-radius: 2px;
  animation: load 1.5s infinite linear;
}

@keyframes load {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.error-badge-icon {
  width: 56px;
  height: 56px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 24px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-msg {
  color: #fca5a5;
  font-size: 15px;
  margin-bottom: 8px;
}

.action-buttons {
  margin-top: 28px;
}

.btn-sso {
  display: inline-block;
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  color: white;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}

.btn-sso:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

/* PMIS DASHBOARD */
.pmis-dashboard {
  width: 100%;
  max-width: 1000px;
  border-radius: 24px;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  padding: 0;
}

.sso-bypass-banner {
  background: rgba(16, 185, 129, 0.15);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  padding: 14px 28px;
  gap: 16px;
}

.banner-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  flex: 1;
  text-align: left;
}

.banner-text h5 {
  color: #34d399;
  font-weight: 700;
  font-size: 14px;
  margin: 0 0 2px 0;
}

.banner-text p {
  color: #a7f3d0;
  font-size: 12px;
  margin: 0;
}

.protocol-badge {
  background: #059669;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pmis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pmis-title {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.pmis-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  border-radius: 12px;
}

.pmis-title h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.pmis-title p {
  margin: 0;
}

.btn-back {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  padding: 28px;
  gap: 28px;
}

.info-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  text-align: left;
}

.card-title-sec {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.card-title-sec h5 {
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-avatar-sec {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.avatar-info h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.user-role-pill {
  display: inline-block;
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  margin: 0;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.user-details-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.det-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.det-val {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 500;
}

.provider-highlight {
  color: #818cf8;
  font-weight: 600;
}

.pmis-features {
  background: rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  flex: 1;
}

.feat-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  transition: all 0.2s;
}

.feat-box:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(236, 72, 153, 0.2);
  transform: translateY(-2px);
}

.feat-icon {
  font-size: 24px;
  display: inline-block;
  margin-bottom: 12px;
}

.feat-box h6 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #f1f5f9;
}

.feat-box p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.audit-disclaimer {
  margin-top: 24px;
  background: rgba(15, 23, 42, 0.5);
  border-left: 3px solid #6366f1;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  font-size: 11px;
  color: #94a3b8;
}

.audit-disclaimer code {
  color: #a5b4fc;
}

.uppercase {
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* SOAP Debugger UI */
.soap-debugger-panel {
  margin-top: 24px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 8px;
  overflow: hidden;
  text-align: left;
}

.soap-debugger-header {
  background: rgba(30, 41, 59, 0.8);
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #f472b6;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid rgba(236, 72, 153, 0.1);
}

.chevron-arrow {
  color: #94a3b8;
}

.soap-debugger-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 250px;
  overflow-y: auto;
}

.soap-code-sec h6 {
  font-size: 11px;
  color: #94a3b8;
  margin: 0 0 6px 0;
  text-transform: uppercase;
}

.soap-code-sec pre {
  margin: 0;
  background: rgba(10, 15, 26, 0.8);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
}

.soap-code-sec pre code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #38bdf8;
  white-space: pre;
}

.state-card.expanded {
  max-width: 780px;
  transition: max-width 0.3s ease-in-out;
}
</style>
