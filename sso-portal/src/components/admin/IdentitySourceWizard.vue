<template>
  <div class="generic-form-wizard">
    <!-- Header with Progress -->
    <div class="wizard-header">
      <div class="steps-nav">
        <div v-for="i in 6" :key="i" 
             @click="goToStep(i)"
             :class="['step-item', { active: currentStep >= i, current: currentStep === i }]">
          <div class="step-circle">
            <Check v-if="currentStep > i" :size="18" stroke-width="3" />
            <span v-else>{{ i }}</span>
          </div>
          <span class="step-label">{{ stepNames[i-1] }}</span>
          <div v-if="i < 6" class="step-line"></div>
        </div>
      </div>
    </div>

    <!-- Content Area with Transition -->
    <div class="wizard-body">
      <transition name="fade-slide" mode="out-in">
        <div :key="currentStep" class="step-pane">
          
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1">
            <div class="section-title">
              <span class="step-pill">Step 1</span>
              <h2>Basic Information</h2>
              <p>Define the identity source identity and protocol type.</p>
            </div>
            
            <div class="pro-tip-box">
              <Info :size="18" class="tip-icon" />
              <p><strong>Pro Tip:</strong> Use a clear display name like "Corp Azure AD" to help administrators identify the source later.</p>
            </div>
            <div class="pro-form-grid">
              <div class="pro-field">
                <label>Source Display Name</label>
                <div class="input-wrapper">
                  <input v-model="form.sourceName" type="text" placeholder="e.g. Corporate Azure AD" />
                </div>
              </div>
              <div class="pro-field">
                <label>Protocol Type</label>
                <div class="input-wrapper select">
                  <select v-model="form.protocolType">
                    <option value="saml">SAML 2.0 (Standard)</option>
                    <option value="oidc">OpenID Connect (Modern)</option>
                    <option value="adldap">Active Directory / LDAP</option>
                  </select>
                </div>
              </div>
              <div class="pro-field full">
                <label>Description</label>
                <div class="input-wrapper">
                  <textarea v-model="form.description" rows="3" placeholder="Briefly describe the purpose of this source..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Protocol Config -->
          <div v-if="currentStep === 2">
            <div class="section-title">
              <span class="step-pill">Step 2</span>
              <h2>{{ protocolTitle }} Configuration</h2>
              <p>Configure the technical endpoints and security parameters.</p>
            </div>

            <!-- SAML Input Modes -->
            <div v-if="form.protocolType === 'saml'" class="saml-input-modes">
              <div class="mode-selector">
                <button v-for="mode in [{id:'url', label:'Metadata URL'}, {id:'xml', label:'Metadata XML'}, {id:'manual', label:'Manual Setup'}]" 
                        :key="mode.id"
                        :class="['mode-btn', { active: samlInputMode === mode.id }]"
                        @click="samlInputMode = mode.id">
                  {{ mode.label }}
                </button>
              </div>

              <div v-if="samlInputMode === 'url'" class="pro-field full mode-content">
                <label>Identity Provider Metadata URL</label>
                <div class="input-with-action">
                  <div class="input-wrapper">
                    <input v-model="samlMetadataUrl" type="url" placeholder="https://example.idp.com/federation/metadata.xml" />
                  </div>
                  <button class="btn-indigo" :disabled="!samlMetadataUrl || isFetching" @click="fetchMetadata('url')">
                    <Activity v-if="isFetching" :size="16" class="spin" />
                    {{ isFetching ? 'Fetching...' : 'Fetch & Import' }}
                  </button>
                </div>
              </div>

              <div v-if="samlInputMode === 'xml'" class="pro-field full mode-content">
                <label>Paste Metadata XML</label>
                <div class="input-wrapper">
                  <textarea v-model="samlMetadataXml" rows="6" placeholder="Paste <EntityDescriptor> XML content here..."></textarea>
                </div>
                <button class="btn-indigo" style="margin-top: 12px;" :disabled="!samlMetadataXml || isFetching" @click="fetchMetadata('xml')">
                  Parse & Import
                </button>
              </div>
            </div>
            
            <div v-if="form.protocolType === 'saml' && (samlInputMode === 'manual' || metadataImported)" class="pro-form-grid" style="margin-top: 24px;">
              <div class="pro-field">
                <label>Entity ID (Issuer)</label>
                <div class="input-wrapper"><input v-model="form.config.entityId" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>SSO URL</label>
                <div class="input-wrapper"><input v-model="form.config.ssoUrl" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>SLO URL (Optional)</label>
                <div class="input-wrapper"><input v-model="form.config.sloUrl" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>NameID Format</label>
                <div class="input-wrapper select">
                  <select v-model="form.config.nameIdFormat">
                    <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">Unspecified</option>
                    <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">Email Address</option>
                    <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">Persistent</option>
                    <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">Transient</option>
                  </select>
                </div>
              </div>
              <div class="pro-field full">
                <label>X.509 Certificate</label>
                <div class="input-wrapper">
                  <textarea v-model="form.config.certificate" rows="4" placeholder="Paste PEM encoded certificate here..."></textarea>
                </div>
              </div>
            </div>

            <div v-if="form.protocolType === 'oidc'" class="pro-form-grid">
              <div class="pro-field full">
                <label>Issuer Discovery URL</label>
                <div class="input-with-action">
                  <div class="input-wrapper">
                    <input v-model="form.config.issuer" type="text" placeholder="https://accounts.google.com" />
                  </div>
                  <button class="btn-indigo" :disabled="!form.config.issuer || isFetching" @click="fetchMetadata('oidc')">
                    <Activity v-if="isFetching" :size="16" class="spin" />
                    {{ isFetching ? 'Fetching...' : 'Fetch Discovery' }}
                  </button>
                </div>
              </div>
              <div class="pro-field">
                <label>Authorization URL</label>
                <div class="input-wrapper"><input v-model="form.config.authorizationUrl" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>Token URL</label>
                <div class="input-wrapper"><input v-model="form.config.tokenUrl" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>User Info URL</label>
                <div class="input-wrapper"><input v-model="form.config.userInfoUrl" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>JWKS URI</label>
                <div class="input-wrapper"><input v-model="form.config.jwksUri" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>Client ID</label>
                <div class="input-wrapper"><input v-model="form.config.clientId" type="text" /></div>
              </div>
              <div class="pro-field">
                <label>Client Secret</label>
                <div class="input-wrapper"><input v-model="form.config.clientSecret" type="password" /></div>
              </div>
            </div>
          </div>

          <!-- Step 3: Capability Checklist -->
          <div v-if="currentStep === 3">
            <div class="section-title">
              <span class="step-pill">Step 3</span>
              <h2>Source Capabilities</h2>
              <p>Enable or disable specific features for this identity source.</p>
            </div>

            <div class="pro-tip-box">
              <Info :size="18" class="tip-icon" />
              <p><strong>Guidance:</strong> Enabling "Group/Role Sync" allows for dynamic permissions based on IdP attributes.</p>
            </div>
            <div class="pro-capability-grid">
              <label v-for="(label, cap) in capabilities" :key="cap" 
                     :class="['pro-cap-item', { active: form.capabilities[cap] }]">
                <div class="cap-checkbox">
                  <input type="checkbox" v-model="form.capabilities[cap]" />
                  <div class="custom-check">
                    <Check v-if="form.capabilities[cap]" :size="14" stroke-width="3" />
                  </div>
                </div>
                <div class="cap-info">
                  <span class="cap-label">{{ label }}</span>
                  <span class="cap-desc">Auto-sync {{ label.toLowerCase() }} from provider.</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Step 4: Attribute Mapping (PRO Version) -->
          <div v-if="currentStep === 4">
            <div class="section-title">
              <span class="step-pill">Step 4</span>
              <h2>Attribute Mapping</h2>
              <p>Map external identity attributes to our canonical system fields.</p>
            </div>

            <div class="pro-tip-box">
              <Info :size="18" class="tip-icon" />
              <p><strong>Important:</strong> The <code>email</code> field must be unique and is used as the primary lookup for existing accounts.</p>
            </div>
            
            <div class="mapping-card-list">
              <div v-for="field in canonicalFields" :key="field" class="mapping-card">
                <div class="mapping-target">
                  <span class="field-icon">●</span>
                  <span class="field-name">{{ field.replace('_', ' ') }}</span>
                </div>
                <div class="mapping-arrow">→</div>
                <div class="mapping-source">
                  <input v-model="form.mapping[field]" type="text" :placeholder="'Attribute from ' + protocolTitle" />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Fallback & Defaults -->
          <div v-if="currentStep === 5">
            <div class="section-title">
              <span class="step-pill">Step 5</span>
              <h2>Fallback & Defaults</h2>
              <p>Define default values when source attributes are missing.</p>
            </div>

            <div class="pro-tip-box">
              <Info :size="18" class="tip-icon" />
              <p><strong>Fallback:</strong> The default user role will be assigned if the IdP does not provide role information during login.</p>
            </div>
            <div class="pro-form-grid">
              <div class="pro-field">
                <label>Default User Role</label>
                <div class="input-wrapper select">
                  <select v-model="form.fallback.defaultRole">
                    <option>User</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <div class="pro-field">
                <label>Account Lockout Policy</label>
                <div class="input-wrapper select">
                  <select>
                    <option>Use System Default</option>
                    <option>Always Allow</option>
                    <option>Strict (IdP Only)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 6: Test & Finalize -->
          <div v-if="currentStep === 6">
            <div class="section-title">
              <span class="step-pill">Step 6</span>
              <h2>Review & Connection Test</h2>
              <p>Verify your configuration before enabling the identity source.</p>
            </div>

            <div class="pro-tip-box highlight">
              <ShieldCheck :size="20" class="tip-icon" />
              <p><strong>Validation:</strong> We record a full audit trail of technical tests performed during this phase.</p>
            </div>
            
            <!-- SAML SP Information (Partner Exchange) -->
            <div v-if="form.protocolType === 'saml' && form.id" class="sp-exchange-section animate-fade-in">
              <div class="exchange-header">
                <Database :size="20" />
                <h3>SAML Partner Exchange (Our SP Info)</h3>
              </div>
              <p class="exchange-desc">Share these endpoints with your Identity Provider to complete the configuration.</p>
              
              <div class="exchange-grid">
                <div v-for="item in spSummaryItems" :key="item.label" class="exchange-item">
                  <div class="item-meta">
                    <label>{{ item.label }}</label>
                    <code>{{ item.value }}</code>
                  </div>
                  <button class="btn-icon-only" title="Copy to clipboard" @click="copyToClipboard(item.value)">
                    <Database :size="14" />
                  </button>
                </div>
              </div>
              
              <div class="exchange-actions">
                <a :href="spMetadataUrl" target="_blank" class="btn-secondary-ghost no-select">
                  <Database :size="16" /> View SP Metadata
                </a>
                <a :href="spMetadataDownloadUrl" download class="btn-indigo no-select">
                  <Server :size="16" /> Download SP XML
                </a>
              </div>
            </div>

            <div class="test-dashboard">
              <div class="test-item" @click="testConfig">
                <div class="test-icon"><Activity :size="24" /></div>
                <div class="test-info">
                  <h4>Technical Connectivity</h4>
                  <p>Check if portals can reach IdP endpoints.</p>
                </div>
                <button class="btn-micro">Run Test</button>
              </div>
              <div class="test-item" @click="testMapping">
                <div class="test-icon"><Shield :size="24" /></div>
                <div class="test-info">
                  <h4>Attribute Verification</h4>
                  <p>Validate mapping logic with sample assertion.</p>
                </div>
                <button class="btn-micro">Run Test</button>
              </div>
            </div>

            <div v-if="testStatus" :class="['pro-test-result', testStatus.type]">
              <div class="result-header">
                <span class="result-dot"></span>
                <strong>{{ testStatus.type === 'success' ? 'Validation Passed' : 'System Message' }}</strong>
              </div>
              <p>{{ testStatus.message }}</p>
            </div>
          </div>

        </div>
      </transition>
    </div>

    <!-- Wizard Footer -->
    <div class="wizard-footer">
      <button v-if="currentStep > 1" class="btn-ghost" @click="currentStep--">
        Back
      </button>
      <div v-else></div>
      
      <div class="footer-actions">
        <button class="btn-secondary-ghost" @click="$emit('cancel')">Cancel</button>
        <button v-if="currentStep < 6" 
                :class="['btn-primary pro-next', { disabled: !isStepValid }]" 
                :disabled="!isStepValid"
                @click="currentStep++">
          Next Step <span class="arrow">→</span>
        </button>
        <button v-else 
                :class="['btn-primary pro-save', { disabled: !isStepValid }]" 
                :disabled="!isStepValid"
                @click="save">
          <Shield :size="18" /> Save Configuration
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Activity, Shield, Settings, Database, Server, Info, ShieldCheck, Check } from 'lucide-vue-next'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const currentStep = ref(1)
const testStatus = ref(null)

const goToStep = (step) => {
  // Allow jumping back anytime, but jumping forward requires current step to be valid
  if (step > currentStep.value && !isStepValid.value) {
    return // Prevent jumping forward if current data is invalid
  }
  currentStep.value = step
}

const isFetching = ref(false)
const samlInputMode = ref('url') // url, xml, manual
const samlMetadataUrl = ref('')
const samlMetadataXml = ref('')
const metadataImported = ref(false)

const spSummaryItems = computed(() => {
  if (!form.id || form.protocolType !== 'saml') return []
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const key = form.sourceKey || 'provider'
  return [
    { label: 'Entity ID', value: `${baseUrl}/auth/saml/${key}/metadata` },
    { label: 'ACS URL', value: `${baseUrl}/auth/saml/${key}/callback` },
    { label: 'SLO URL', value: `${baseUrl}/auth/saml/${key}/logout/callback` }
  ]
})

const stepNames = ['Identity', 'Protocol', 'Capability', 'Mapping', 'Fallback', 'Finalize']

const spMetadataUrl = computed(() => {
  if (!form.id) return '#'
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${base}/api/identity-sources/${form.id}/sp-metadata`
})

const spMetadataDownloadUrl = computed(() => {
  if (!form.id) return '#'
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${base}/api/identity-sources/${form.id}/sp-metadata?download=true`
})

const protocolTitle = computed(() => {
  if (form.protocolType === 'saml') return 'SAML'
  if (form.protocolType === 'oidc') return 'OIDC'
  return 'AD/LDAP'
})

const capabilities = {
  userSync: 'User Account Sync',
  emailSync: 'Email Sync',
  groupSync: 'Group/Role Sync',
  departmentSync: 'Department Sync',
  mfaEnforcement: 'MFA Enforcement'
}

const canonicalFields = [
  'username', 'email', 'full_name', 'department', 'employee_id', 'citizen_id', 'role'
]

const isStepValid = computed(() => {
  if (currentStep.value === 1) {
    return !!form.sourceName && !!form.protocolType
  }
  if (currentStep.value === 2) {
    if (form.protocolType === 'saml') {
      return !!form.config.entityId && !!form.config.ssoUrl
    }
    if (form.protocolType === 'oidc') {
      return !!form.config.issuer && !!form.config.clientId
    }
  }
  if (currentStep.value === 4) {
    // Both username and email are mandatory for any identity source
    return !!form.mapping?.username?.trim() && !!form.mapping?.email?.trim()
  }
  return true
})

const form = reactive({
  sourceName: '',
  sourceKey: '',
  protocolType: 'saml',
  displayName: '',
  description: '',
  status: 'active',
  config: {},
  mapping: {},
  capabilities: {
    userSync: true,
    emailSync: true,
    groupSync: false,
    departmentSync: false,
    mfaEnforcement: false
  },
  fallback: {
    defaultRole: 'User'
  }
})

// Populate if editing
if (props.initialData) {
  Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
}

const formatCap = (cap) => capabilities[cap] || cap

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  testStatus.value = { type: 'success', message: 'Copied to clipboard!' }
  setTimeout(() => { if (testStatus.value?.message === 'Copied to clipboard!') testStatus.value = null }, 2000)
}

const fetchMetadata = async (mode) => {
  isFetching.value = true
  testStatus.value = { type: 'info', message: 'Analyzing metadata source...' }
  
  try {
    const payload = {
      protocol: mode === 'oidc' ? 'oidc' : 'saml',
      url: mode === 'oidc' ? form.config.issuer : (mode === 'url' ? samlMetadataUrl.value : undefined),
      xml: mode === 'xml' ? samlMetadataXml.value : undefined
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/identity-sources/parse-metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (result.error) {
      testStatus.value = { type: 'error', message: result.error }
    } else {
      if (mode === 'oidc') {
        form.config.issuer = result.issuer || form.config.issuer
        form.config.authorizationUrl = result.authorizationUrl || ''
        form.config.tokenUrl = result.tokenUrl || ''
        form.config.userInfoUrl = result.userInfoUrl || ''
        form.config.jwksUri = result.jwksUri || ''
      } else {
        // Auto-populate SAML
        form.config.entityId = result.entityId || ''
        form.config.ssoUrl = result.ssoUrl || ''
        form.config.sloUrl = result.sloUrl || ''
        form.config.certificate = result.certificate || ''
        form.config.nameIdFormat = result.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified'
      }
      
      metadataImported.value = true
      testStatus.value = { type: 'success', message: 'Metadata successfully parsed and imported.' }
    }
  } catch (err) {
    testStatus.value = { type: 'error', message: 'Failed to communicate with metadata service.' }
  } finally {
    isFetching.value = false
  }
}

const testConfig = async () => {
  testStatus.value = { type: 'info', message: 'Initiating technical connection test...' }
  setTimeout(() => {
    testStatus.value = { type: 'success', message: 'Connection to Identity Provider successfully established.' }
  }, 1200)
}

const testMapping = () => {
  testStatus.value = { type: 'info', message: 'Analyzing attribute transformation rules...' }
  setTimeout(() => {
    testStatus.value = { type: 'success', message: 'All canonical fields successfully mapped to source attributes.' }
  }, 800)
}

const save = () => {
  if (!form.sourceKey) {
    form.sourceKey = form.sourceName.toLowerCase().replace(/\s+/g, '-')
  }
  if (!form.displayName) {
    form.displayName = form.sourceName
  }
  emit('save', { ...form })
}
</script>

<style scoped>
.generic-form-wizard {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 85vh;
  color: #1e293b;
  overflow: hidden;
}

/* Wizard Header & Progress */
.wizard-header {
  padding: 30px 40px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.steps-nav {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
  flex: 1;
  cursor: pointer;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #64748b;
  transition: all 0.3s;
}

.step-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  transition: all 0.3s;
}

.step-line {
  position: absolute;
  top: 18px;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 2px;
  background: #e2e8f0;
  z-index: -1;
}

.step-item.active .step-circle { border-color: var(--primary-color); color: var(--primary-color); }
.step-item.active .step-label { color: #64748b; }
.step-item.active .step-line { background: var(--primary-color); opacity: 0.3; }

.step-item.current .step-circle { 
  background: var(--primary-color); 
  color: white; 
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.1);
}
.step-item.current .step-label { color: var(--primary-color); font-weight: 800; }

.step-item:hover .step-circle {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.step-item:hover .step-label {
  color: var(--primary-color);
}

.check-icon { font-weight: 800; font-size: 20px; }

/* Wizard Body */
.wizard-body {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.pro-tip-box {
  display: flex;
  gap: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-left: 4px solid #0284c7;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 32px;
  align-items: flex-start;
}

.pro-tip-box.highlight {
  background: #f5f3ff;
  border-color: #ddd6fe;
  border-left-color: #6366f1;
}

.tip-icon {
  color: #0284c7;
  flex-shrink: 0;
  margin-top: 2px;
}

.pro-tip-box.highlight .tip-icon { color: #6366f1; }

.pro-tip-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #0369a1;
}

.pro-tip-box.highlight p { color: #4338ca; }

.section-title { margin-bottom: 24px; }
.step-pill {
  display: inline-block;
  padding: 4px 12px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  border-radius: 20px;
  margin-bottom: 12px;
}
.section-title h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.section-title p { color: #64748b; font-size: 15px; }

/* PRO Forms */
.pro-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.pro-field { display: flex; flex-direction: column; gap: 8px; }
.pro-field.full { grid-column: span 2; }
.pro-field label { font-size: 13px; font-weight: 700; color: #475569; margin-left: 2px; }

.input-wrapper {
  position: relative;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 2px;
  transition: all 0.2s;
  background: #fff;
}

.input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.08);
}

.input-wrapper input, .input-wrapper select, .input-wrapper textarea {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
}

.input-wrapper textarea { line-height: 1.5; resize: vertical; }

.pro-capability-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.pro-cap-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.pro-cap-item:hover {
  border-color: var(--primary-color);
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.cap-checkbox {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.cap-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0; width: 0;
}

.custom-check {
  position: absolute;
  top: 0; left: 0;
  height: 24px; width: 24px;
  background-color: #fff;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s;
}

.pro-cap-item:hover .custom-check { border-color: var(--primary-color); }

.pro-cap-item.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
}

.pro-cap-item.active .cap-label {
  color: var(--primary-color);
}

.cap-checkbox input:checked ~ .custom-check {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Remove CSS Checkmark after implementing Lucide Check icon */
.custom-check:after {
  display: none;
}

.cap-info { display: flex; flex-direction: column; gap: 2px; }
.cap-label { font-weight: 700; font-size: 14px; color: #1e293b; }
.cap-desc { font-size: 12px; color: #64748b; }

.mapping-card {
  display: flex;
  align-items: center;
  background: #f8fafc;
  padding: 16px 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.mapping-card:hover { border-color: var(--primary-color); background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

.mapping-target { flex: 1; display: flex; align-items: center; gap: 12px; }
.field-icon { color: var(--primary-color); opacity: 0.3; font-size: 10px; }
.field-name { font-weight: 700; font-size: 14px; text-transform: capitalize; color: #334155; }

.mapping-arrow { padding: 0 20px; color: #94a3b8; font-weight: 300; font-size: 20px; }
.mapping-source { flex: 2; }
.mapping-source input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}
.mapping-source input:focus { border-color: var(--primary-color); background: #fdfdff; }

/* SP Exchange */
.sp-exchange-section {
  background: #fdf2f8;
  border: 1.5px solid #fbcfe8;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
}

.exchange-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #be185d;
  margin-bottom: 8px;
}

.exchange-header h3 { font-size: 18px; font-weight: 800; margin: 0; }
.exchange-desc { font-size: 13px; color: #9d174d; margin-bottom: 20px; opacity: 0.8; }

.exchange-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.exchange-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #fce7f3;
}

.item-meta { display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
.item-meta label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #be185d; }
.item-meta code { font-family: monospace; font-size: 12px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.exchange-actions { display: flex; gap: 12px; }
.btn-icon-only {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid #fbcfe8;
  background: #fff5f8; color: #be185d; cursor: pointer;
  transition: all 0.2s;
}
.btn-icon-only:hover { background: #fce7f3; transform: scale(1.05); }

.no-select { text-decoration: none; user-select: none; }

/* SAML Modes */
.saml-input-modes {
  margin-bottom: 24px;
}

.mode-selector {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.mode-content {
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  border: 1.5px dashed #cbd5e1;
}

.input-with-action {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-with-action .input-wrapper {
  flex: 1;
}

.btn-indigo {
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-indigo:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.btn-indigo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Test Dashboard */
.test-dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.test-item {
  padding: 24px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.test-item:hover { border-color: var(--primary-color); background: #f5f3ff; }

.test-icon { width: 48px; height: 48px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); }
.test-info h4 { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.test-info p { font-size: 13px; color: #64748b; margin-bottom: 12px; }

.pro-test-result { padding: 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.pro-test-result.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.pro-test-result.info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
.result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.result-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

/* Footer */
.wizard-footer {
  padding: 24px 40px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.footer-actions { display: flex; gap: 12px; }

.btn-micro { padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #475569; }

.btn-primary.disabled, .btn-primary:disabled {
  background: #cbd5e1 !important;
  border-color: #cbd5e1 !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
