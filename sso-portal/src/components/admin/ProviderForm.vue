<template>
  <form class="dynamic-form" @submit.prevent="$emit('submit', formData)">
    <div class="form-group">
      <label>Provider Type</label>
      <select v-model="formData.type">
        <option value="SAML">SAML 2.0</option>
        <option value="OIDC">OIDC (OpenID Connect)</option>
        <option value="LDAP">AD / LDAP</option>
      </select>
    </div>

    <div class="form-group">
      <label>Provider Name</label>
      <input type="text" v-model="formData.name" placeholder="e.g. Google Workspace" required />
    </div>

    <!-- SAML Specific Fields -->
    <template v-if="formData.type === 'SAML'">
      <div class="form-group">
        <label>Entity ID</label>
        <input type="text" v-model="formData.entityId" placeholder="https://example.com/saml/metadata" />
      </div>
      <div class="form-group">
        <label>SSO URL</label>
        <input type="text" v-model="formData.ssoUrl" placeholder="https://example.com/saml/sso" />
      </div>
    </template>

    <!-- OIDC Specific Fields -->
    <template v-if="formData.type === 'OIDC'">
      <div class="form-group">
        <label>Client ID</label>
        <input type="text" v-model="formData.clientId" placeholder="your-client-id" />
      </div>
      <div class="form-group">
        <label>Client Secret</label>
        <input type="password" v-model="formData.clientSecret" placeholder="••••••••" />
      </div>
      <div class="form-group">
        <label>Issuer URL</label>
        <input type="text" v-model="formData.issuerUrl" placeholder="https://accounts.google.com" />
      </div>
    </template>

    <!-- LDAP Specific Fields -->
    <template v-if="formData.type === 'LDAP'">
      <div class="form-group">
        <label>Server URL</label>
        <input type="text" v-model="formData.serverUrl" placeholder="ldap://corp.example.com:389" />
      </div>
      <div class="form-group">
        <label>Base DN</label>
        <input type="text" v-model="formData.baseDn" placeholder="dc=example,dc=com" />
      </div>
    </template>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary">Save Provider</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initialData: Object
})

const formData = reactive({
  type: 'OIDC',
  name: '',
  entityId: '',
  ssoUrl: '',
  clientId: '',
  clientSecret: '',
  issuerUrl: '',
  serverUrl: '',
  baseDn: '',
  ...props.initialData
})

const emit = defineEmits(['submit', 'cancel'])
</script>

<style scoped>
.dynamic-form { padding: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-muted); }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: var(--border-default); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
</style>
