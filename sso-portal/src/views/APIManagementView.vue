<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import AppSidebar from '../components/AppSidebar.vue';
import apiClient, { postWithUser } from '../utils/api';

const isLoading = ref(false);
const showKey = ref(null);
const services = ref([]);
const selectedServiceId = ref(null);
const credentials = ref([]);
const message = ref({ text: '', type: '' });
const hideRevoked = ref(true);

const activeTab = ref('general'); // 'general' | 'scopes'

// ---- Modals State ----
const showAddApiModal = ref(false);
const showByUserModal = ref(false);
const showScopeModal = ref(false);

// Credentials forms
const showAddCredentialForm = ref(false);
const availableUsers = ref([]);
const selectedUserId = ref('');
const generatedKey = ref('');
const selectedExpiresAt = ref('');
const editingExtendCredential = ref(null);
const showExtendModal = ref(false);
const newExpiresAt = ref('');

// Scope mapping state
const editingCredential = ref(null);
const scopeEntries = ref([]);
const newScopeField = ref('');
const newScopeValue = ref('');
const compositeScopes = ref([]);
const newCompCol1 = ref('');
const newCompVal1 = ref('');
const newCompCol2 = ref('');
const queriedCombinations = ref([]);
const selectedCombinationsIdx = ref([]);
const isQueryingCombinations = ref(false);
const scopeTab = ref('standard'); // 'standard' | 'composite'

const fetchServices = async () => {
  try {
    const response = await apiClient.get('/retrieveService');
    if (response.data.status === 'success') {
      services.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }
};

const fetchCredentials = async () => {
  if (!selectedServiceId.value) return;
  isLoading.value = true;
  credentials.value = [];
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await postWithUser('/getApiCredentials', userData, {
      service_id: selectedServiceId.value
    });
    if (response.data.status === 'success') {
      credentials.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching credentials:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchUsers = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await postWithUser('/getAvailableUsers', userData);
    if (response.data.status === 'success') {
      availableUsers.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// ---- Tab API Lists ----
const generalApis = computed(() => {
  return services.value.filter(s => (s.api_enabled == 1 || s.api_enabled === true) && (s.api_type === 'public' || s.api_type === 'private' || s.api_type === 'general' || !s.api_type));
});

const scopeApis = computed(() => {
  return services.value.filter(s => (s.api_enabled == 1 || s.api_enabled === true) && s.api_type === 'scope');
});

// ---- Action: Open BY USER modal ----
const openByUser = (serviceId) => {
  selectedServiceId.value = serviceId;
  fetchCredentials();
  fetchUsers();
  showByUserModal.value = true;
  showAddCredentialForm.value = false;
};

// ---- Action: Open SCOPE modal ----
const openScopeManagement = (serviceId) => {
  selectedServiceId.value = serviceId;
  fetchCredentials();
  fetchUsers();
  showScopeModal.value = true;
  showAddCredentialForm.value = false;

  const svc = services.value.find(s => s.service_id === serviceId);
  if (svc) {
    fetchColumns(svc.api_db_name, svc.api_source_name);
  }
};

// ---- API Configuration State (ADD API Modal) ----
const apiConfigServiceId = ref('');
const apiConfigName = ref('');
const apiConfigDescription = ref('');
const isApiEnabled = ref('active'); // active | inactive
const apiType = ref('general');
const apiEndpoint = ref('');
const apiDbName = ref('');
const apiSourceType = ref('table');
const apiSourceName = ref('');
const apiRequestFields = ref([]);
const apiResponseFields = ref([]);

const availableDatabases = ref([]);
const availableTables = ref([]);
const availableColumns = ref([]);
const isLoadingMeta = ref(false);
const isSubmittingConfig = ref(false);

const openAddApiModal = () => {
  apiConfigServiceId.value = '';
  apiConfigName.value = '';
  apiConfigDescription.value = '';
  isApiEnabled.value = 'active';
  apiType.value = 'general';
  apiEndpoint.value = '';
  apiDbName.value = '';
  apiSourceName.value = '';
  apiRequestFields.value = [];
  apiResponseFields.value = [];
  showAddApiModal.value = true;
  fetchDatabases();
};

watch(apiConfigServiceId, (newId) => {
  const svc = services.value.find(s => s.service_id === newId);
  if (svc) {
    apiConfigName.value = svc.service_name || '';
    apiConfigDescription.value = svc.service_description || svc.description || '';
    apiEndpoint.value = svc.api_endpoint || '';
    apiType.value = svc.api_type || 'general';
    isApiEnabled.value = (svc.api_enabled == 1 || svc.api_enabled === true) ? 'active' : 'inactive';
    apiDbName.value = svc.api_db_name || '';
    apiSourceType.value = svc.api_source_type || 'table';
    apiSourceName.value = svc.api_source_name || '';
    try {
      apiRequestFields.value = svc.api_request_fields ? (typeof svc.api_request_fields === 'string' ? JSON.parse(svc.api_request_fields) : svc.api_request_fields) : [];
      apiResponseFields.value = svc.api_response_fields ? (typeof svc.api_response_fields === 'string' ? JSON.parse(svc.api_response_fields) : svc.api_response_fields) : [];
    } catch { apiRequestFields.value = []; apiResponseFields.value = []; }
  }
});

const fetchDatabases = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await postWithUser('/getAvailableDatabases', userData);
    if (res.data.status === 'success') availableDatabases.value = res.data.data;
  } catch (e) { console.error('DB fetch error:', e); }
};

const fetchTables = async (dbName) => {
  if (!dbName) { availableTables.value = []; return; }
  isLoadingMeta.value = true;
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await postWithUser('/getAvailableTables', userData, { db_name: dbName });
    if (res.data.status === 'success') availableTables.value = res.data.data;
  } catch (e) { console.error('Table fetch error:', e); }
  finally { isLoadingMeta.value = false; }
};

const fetchColumns = async (dbName, tableName) => {
  if (!dbName || !tableName) { availableColumns.value = []; return; }
  isLoadingMeta.value = true;
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await postWithUser('/getTableColumns', userData, { db_name: dbName, table_name: tableName });
    if (res.data.status === 'success') availableColumns.value = res.data.data;
  } catch (e) { console.error('Column fetch error:', e); }
  finally { isLoadingMeta.value = false; }
};

watch(apiDbName, (val) => {
  if(!val) return;
  fetchTables(val);
});

watch(apiSourceName, (val) => {
  if (val && apiDbName.value) {
    const t = availableTables.value.find(t => t.name === val);
    if (t) apiSourceType.value = t.type;
    fetchColumns(apiDbName.value, val);
  }
});

const toggleRequestField = (name) => {
  const idx = apiRequestFields.value.indexOf(name);
  if (idx >= 0) apiRequestFields.value.splice(idx, 1);
  else apiRequestFields.value.push(name);
};
const toggleResponseField = (name) => {
  const idx = apiResponseFields.value.indexOf(name);
  if (idx >= 0) apiResponseFields.value.splice(idx, 1);
  else apiResponseFields.value.push(name);
};

const handleApiConfigSubmit = async () => {
  if (!apiConfigServiceId.value) {
    alert('กรุณาเลือก Report ID');
    return;
  }
  if (!apiEndpoint.value || !apiEndpoint.value.trim()) {
    alert('กรุณากรอก API SERVICES (เช่น api_sc033)');
    return;
  }
  if (!apiType.value) {
    alert('กรุณาเลือก API Type');
    return;
  }
  if (!isApiEnabled.value) {
    alert('กรุณาเลือก Status');
    return;
  }
  if (!apiDbName.value) {
    alert('กรุณาเลือก Database');
    return;
  }
  if (!apiSourceName.value) {
    alert('กรุณาเลือก Table / View');
    return;
  }
  if (!apiResponseFields.value || apiResponseFields.value.length === 0) {
    alert('กรุณาเลือกฟิลด์สำหรับ Response อย่างน้อย 1 ฟิลด์');
    return;
  }

  isSubmittingConfig.value = true;
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await postWithUser('/saveApiConfig', userData, {
      service_id: apiConfigServiceId.value,
      api_enabled: isApiEnabled.value === 'active',
      api_type: apiType.value,
      api_endpoint: apiEndpoint.value,
      api_db_name: apiDbName.value,
      api_source_type: apiSourceType.value,
      api_source_name: apiSourceName.value,
      api_request_fields: apiRequestFields.value,
      api_response_fields: apiResponseFields.value,
      description: apiConfigDescription.value
    });
    if (res.data.status === 'success') {
      message.value = { text: 'บันทึกการตั้งค่า API เรียบร้อยแล้ว', type: 'success' };
      showAddApiModal.value = false;
      fetchServices();
    } else {
      message.value = { text: res.data.status || 'เกิดข้อผิดพลาด', type: 'error' };
    }
  } catch(e) {
    message.value = { text: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' };
  } finally {
    isSubmittingConfig.value = false;
  }
};

// ---- Credentials Logic ----
const generateKey = () => {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  generatedKey.value = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
};

const addCredential = async () => {
  if (!selectedServiceId.value || !selectedUserId.value) {
    message.value = { text: 'กรุณาเลือกผู้ใช้', type: 'error' };
    return;
  }
  if (!generatedKey.value) generateKey();

  isLoading.value = true;
  message.value = { text: '', type: '' };
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    let finalDate = selectedExpiresAt.value;
    if (finalDate && finalDate.length === 16) {
        finalDate = finalDate + ':00';
    }
    const response = await postWithUser('/addApiCredential', userData, {
      service_id: selectedServiceId.value,
      target_user_id: selectedUserId.value,
      secret_key: generatedKey.value,
      expires_at: finalDate || null
    });
    if (response.data.status === 'success') {
      message.value = { text: 'สร้าง API Key สำเร็จ!', type: 'success' };
      showAddCredentialForm.value = false;
      selectedUserId.value = '';
      generatedKey.value = '';
      selectedExpiresAt.value = '';
      fetchCredentials();
    } else {
      message.value = { text: response.data.status, type: 'error' };
    }
  } catch (error) {
    message.value = { text: 'เกิดข้อผิดพลาด', type: 'error' };
  } finally {
    isLoading.value = false;
  }
};

const toggleCredentialStatus = async (cred) => {
  if (cred.status === 'active') {
    if (!confirm('ต้องการระงับการใช้งาน API Key นี้ (Pause) ?')) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      await postWithUser('/revokeApiCredential', userData, { credential_id: cred.credential_id });
      fetchCredentials();
    } catch (error) { console.error(error); }
  } else {
    if (!confirm('ต้องการยกเลิกการเพิกถอนและเปิดใช้งาน API Key นี้อีกครั้ง (Resume) ?')) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      await postWithUser('/resumeApiCredential', userData, { credential_id: cred.credential_id });
      fetchCredentials();
    } catch (error) { console.error(error); }
  }
};

const deleteCredential = async (credentialId) => {
  if (!confirm('ต้องการลบ API Key นี้ถาวร? การลบจะไม่สามารถกู้คืนได้')) return;
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await postWithUser('/deleteApiCredential', userData, { credential_id: credentialId });
    if (response.data.status === 'success') fetchCredentials();
  } catch (error) { console.error(error); }
};

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

const openExtendModal = (cred) => {
  editingExtendCredential.value = cred;
  if (cred.expires_at) {
    newExpiresAt.value = cred.expires_at.replace(' ', 'T').slice(0, 16);
  } else {
    newExpiresAt.value = '';
  }
  showExtendModal.value = true;
};

const saveExtension = async () => {
  if (!editingExtendCredential.value) return;
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    let finalDate = newExpiresAt.value;
    if (finalDate && finalDate.length === 16) finalDate = finalDate + ':00';
    else if (!finalDate) finalDate = null;
    await postWithUser('/extendApiCredential', userData, { 
      credential_id: editingExtendCredential.value.credential_id,
      expires_at: finalDate
    });
    showExtendModal.value = false;
    fetchCredentials();
  } catch (error) { console.error(error); }
};

const startEditScope = (cred) => {
  editingCredential.value = cred;
  const scopeObj = cred.scope_json || {};
  scopeEntries.value = Object.entries(scopeObj)
    .filter(([field]) => field !== 'composite')
    .map(([field, values]) => ({
      field,
      values: Array.isArray(values) ? values : [values]
    }));
  compositeScopes.value = Array.isArray(scopeObj.composite) ? [...scopeObj.composite] : [];

  newCompCol1.value = '';
  newCompVal1.value = '';
  newCompCol2.value = '';
  queriedCombinations.value = [];
  selectedCombinationsIdx.value = [];
  scopeTab.value = 'standard';
};

const saveScopeChanges = async () => {
  if (!editingCredential.value) return;
  const scopeObj = {};
  scopeEntries.value.forEach(entry => {
    if (entry.field !== 'composite') {
      scopeObj[entry.field] = entry.values;
    }
  });
  if (compositeScopes.value.length > 0) {
    scopeObj.composite = compositeScopes.value;
  }

  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    await postWithUser('/updateApiScope', userData, {
      credential_id: editingCredential.value.credential_id,
      scope_json: scopeObj
    });
    editingCredential.value = null;
    fetchCredentials();
  } catch (error) { console.error(error); }
};

const addScopeEntry = () => {
  if (!newScopeField.value || !newScopeValue.value) return;
  const existing = scopeEntries.value.find(e => e.field === newScopeField.value);
  if (existing) {
    if (!existing.values.includes(newScopeValue.value)) {
      existing.values.push(newScopeValue.value);
    }
  } else {
    scopeEntries.value.push({ field: newScopeField.value, values: [newScopeValue.value] });
  }
  newScopeValue.value = '';
};

const removeScopeValue = (fieldIdx, valIdx) => {
  scopeEntries.value[fieldIdx].values.splice(valIdx, 1);
  if (scopeEntries.value[fieldIdx].values.length === 0) {
    scopeEntries.value.splice(fieldIdx, 1);
  }
};

const removeCompositeScope = (idx) => {
  compositeScopes.value.splice(idx, 1);
};

const queryScopeCombinations = async () => {
  if (!selectedServiceId.value || !newCompCol1.value || !newCompVal1.value || !newCompCol2.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนดึงข้อมูล');
    return;
  }
  isQueryingCombinations.value = true;
  queriedCombinations.value = [];
  selectedCombinationsIdx.value = [];
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await postWithUser('/getScopeCombinations', userData, {
      service_id: selectedServiceId.value,
      column1: newCompCol1.value,
      value1: newCompVal1.value,
      column2: newCompCol2.value
    });
    if (res.data.status === 'success') {
      queriedCombinations.value = res.data.data;
    } else {
      alert(res.data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  } catch (e) {
    console.error('Error querying combinations:', e);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  } finally {
    isQueryingCombinations.value = false;
  }
};

const addSelectedCombinations = () => {
  selectedCombinationsIdx.value.forEach(idx => {
    const item = queriedCombinations.value[idx];
    if (item) {
      const exists = compositeScopes.value.some(c => 
        c.col1 === newCompCol1.value && 
        c.val1 === String(item.val1) && 
        c.col2 === newCompCol2.value && 
        c.val2 === String(item.val2)
      );
      if (!exists) {
        compositeScopes.value.push({
          col1: newCompCol1.value,
          val1: String(item.val1),
          col2: newCompCol2.value,
          val2: String(item.val2)
        });
      }
    }
  });
  selectedCombinationsIdx.value = [];
  queriedCombinations.value = [];
};

const toggleKey = (id) => {
  showKey.value = showKey.value === id ? null : id;
};

const requestFieldOptions = computed(() => {
  const svc = services.value.find(s => s.service_id === selectedServiceId.value);
  if (!svc?.api_request_fields) return [];
  try {
    const fields = typeof svc.api_request_fields === 'string' ? JSON.parse(svc.api_request_fields) : svc.api_request_fields;
    return Array.isArray(fields) ? fields : [];
  } catch { return []; }
});

const dbColumnOptions = computed(() => {
  return availableColumns.value.map(c => c.name);
});

const filteredCredentials = computed(() => {
  if (!hideRevoked.value) return credentials.value;
  return credentials.value.filter(cred => cred.status === 'active');
});

const dropdownServices = computed(() => {
  return services.value.filter(s => s.service_id && !s.service_id.includes('_'));
});

onMounted(() => {
  fetchServices();
});
</script>

<template>
  <div class="api-layout">
    <AppSidebar />
    
    <main class="api-content">
      <header class="content-header" style="align-items:flex-start;">
        <div class="header-titles">
          <h1>API Management</h1>
          <p>จัดการการเชื่อมต่อและการเข้าถึงข้อมูล</p>
        </div>
      </header>

      <div v-if="message.text" :class="['alert-message', message.type]">
        {{ message.text }}
      </div>

      <!-- Main API Management Layout -->
      <div class="card" style="padding:0; overflow:hidden;">
        <!-- Tabs -->
        <div class="tabs-row">
          <button :class="['tab-btn', activeTab === 'general' ? 'active' : '']" @click="activeTab = 'general'">
            API GENERAL
          </button>
          <button :class="['tab-btn', activeTab === 'scopes' ? 'active' : '']" @click="activeTab = 'scopes'">
            API SCOPES
          </button>
        </div>

        <!-- Add API Button -->
        <div class="table-toolbar">
          <button @click="openAddApiModal" class="btn-primary" style="display:flex; align-items:center; gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            ADD API
          </button>
        </div>

        <!-- API List Table -->
        <div class="table-responsive">
          <table class="api-table">
            <thead>
              <tr>
                <th>API Service Name</th>
                <th>API Endpoint</th>
                <th>API Description</th>
                <th>Status</th>
                <th class="text-center">Select</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activeTab === 'general' && generalApis.length === 0">
                <td colspan="5" class="text-center" style="padding:32px;color:#94a3b8;">No general APIs available.</td>
              </tr>
              <tr v-for="api in generalApis" :key="api.service_id" v-if="activeTab === 'general'">
                <td><strong>{{ api.service_name }}</strong></td>
                <td>{{ api.api_endpoint }}</td>
                <td>{{ api.service_description || api.description || '-' }}</td>
                <td>
                  <span class="status-badge active">Active</span>
                </td>
                <td class="text-center">
                  <button @click="openByUser(api.service_id)" class="btn-select">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    BY USER
                  </button>
                </td>
              </tr>

              <tr v-if="activeTab === 'scopes' && scopeApis.length === 0">
                <td colspan="5" class="text-center" style="padding:32px;color:#94a3b8;">No scope APIs available.</td>
              </tr>
              <tr v-for="api in scopeApis" :key="api.service_id" v-if="activeTab === 'scopes'">
                <td><strong>{{ api.service_name }}</strong></td>
                <td>{{ api.api_endpoint }}</td>
                <td>{{ api.service_description || api.description || '-' }}</td>
                <td>
                  <span class="status-badge active">Active</span>
                </td>
                <td class="text-center">
                  <button @click="openScopeManagement(api.service_id)" class="btn-select">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    SCOPE
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal: ADD API (Configuration) -->
    <div v-if="showAddApiModal" class="modal-overlay" @click.self="showAddApiModal = false">
      <div class="modal-content" style="max-width:800px;">
        <div class="modal-header-psu">
          <h3>ADD API</h3>
          <button @click="showAddApiModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body-psu">
          <div class="psu-form-grid">
            <div class="psu-field">
              <label>Report ID<span class="req">*</span></label>
              <select v-model="apiConfigServiceId">
                <option value="">-- Select Report ID --</option>
                <option v-for="svc in dropdownServices" :key="svc.service_id" :value="svc.service_id">
                  {{ svc.dataset_id || svc.service_id }} - {{ svc.service_name }}
                </option>
              </select>
            </div>
            <div class="psu-field">
              <label>API Name<span class="req">*</span></label>
              <input type="text" v-model="apiConfigName" readonly style="background:#f1f5f9;">
            </div>
            <div class="psu-field">
              <label>API SERVICES<span class="req">*</span></label>
              <input type="text" v-model="apiEndpoint" placeholder="e.g. api_sc033">
            </div>
            <div class="psu-field">
              <label>API Description</label>
              <input type="text" v-model="apiConfigDescription" placeholder="API Description">
            </div>
            <div class="psu-field">
              <label>API Type<span class="req">*</span></label>
              <select v-model="apiType">
                <option value="general">general</option>
                <option value="scope">scope</option>
              </select>
            </div>
            <div class="psu-field">
              <label>Status<span class="req">*</span></label>
              <select v-model="isApiEnabled">
                <option value="active">Active = Enable</option>
                <option value="inactive">Inactive = Disable</option>
              </select>
            </div>
            <div class="psu-field">
              <label>Database<span class="req">*</span></label>
              <select v-model="apiDbName">
                <option value="">-- Select Database --</option>
                <option v-for="db in availableDatabases" :key="db" :value="db">{{ db }}</option>
              </select>
            </div>
            <div class="psu-field">
              <label>Table / View<span class="req">*</span></label>
              <select v-model="apiSourceName" :disabled="!apiDbName || isLoadingMeta">
                <option value="">{{ isLoadingMeta ? 'Loading...' : '-- Select Table/View --' }}</option>
                <option v-for="t in availableTables" :key="t.name" :value="t.name">
                  {{ t.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="psu-fields-row" v-if="availableColumns.length > 0">
            <div class="psu-col">
              <label>Please select for Request<span class="req">*</span></label>
              <div class="psu-checkbox-list">
                <label v-for="col in availableColumns" :key="'req_'+col.name">
                  <input type="checkbox" :checked="apiRequestFields.includes(col.name)" @change="toggleRequestField(col.name)">
                  {{ col.name }}
                </label>
              </div>
            </div>
            <div class="psu-col">
              <label>Please select for Response<span class="req">*</span></label>
              <div class="psu-checkbox-list">
                <label v-for="col in availableColumns" :key="'res_'+col.name">
                  <input type="checkbox" :checked="apiResponseFields.includes(col.name)" @change="toggleResponseField(col.name)">
                  {{ col.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="psu-actions">
            <button class="btn-psu-save" @click="handleApiConfigSubmit" :disabled="isSubmittingConfig">
              {{ isSubmittingConfig ? 'SAVING...' : 'SAVE' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: BY USER Management -->
    <div v-if="showByUserModal" class="modal-overlay" @click.self="showByUserModal = false">
      <div class="modal-content" style="max-width:900px;">
        <div class="modal-header-psu">
          <h3>Manage API Access</h3>
          <button @click="showByUserModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn-psu-add" @click="showAddCredentialForm = !showAddCredentialForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              ADD USER
            </button>
          </div>

          <!-- Add User Form -->
          <div v-if="showAddCredentialForm" class="psu-add-user-box">
            <div class="psu-field">
              <label>User<span class="req">*</span></label>
              <select v-model="selectedUserId">
                <option value="">-- Select User --</option>
                <option v-for="u in availableUsers" :key="u.user_id" :value="u.user_id">
                  {{ u.username }} ({{ u.firstname }} {{ u.lastname }})
                </option>
              </select>
            </div>
            <div class="psu-actions" style="margin-top:16px;justify-content:flex-start;">
              <button class="btn-psu-save" @click="addCredential" :disabled="isLoading">SAVE</button>
            </div>
          </div>

          <!-- Users Table -->
          <table class="api-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>API KEY</th>
                <th>Secret Key</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="credentials.length === 0">
                <td colspan="5" class="text-center" style="color:#94a3b8;">No users assigned.</td>
              </tr>
              <tr v-for="cred in credentials" :key="cred.credential_id">
                <td>{{ cred.username }}</td>
                <td>{{ cred.api_key || '-' }}</td>
                <td class="key-cell">
                  <code>{{ showKey === cred.credential_id ? cred.secret_key : '••••••••••••••••' }}</code>
                  <button class="toggle-btn" @click="toggleKey(cred.credential_id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
                <td>
                  <span :class="['status-badge', cred.status]">{{ cred.status }}</span>
                </td>
                <td>
                  <button class="icon-action-btn delete" @click="deleteCredential(cred.credential_id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: SCOPES Management -->
    <div v-if="showScopeModal" class="modal-overlay" @click.self="showScopeModal = false">
      <div class="modal-content" style="max-width:900px;">
        <div class="modal-header-psu">
          <h3>Scopes : {{ services.find(s=>s.service_id===selectedServiceId)?.api_endpoint }}</h3>
          <button @click="showScopeModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;justify-content:flex-end;margin-bottom:16px;" v-if="!editingCredential">
            <button class="btn-psu-add" @click="showAddCredentialForm = !showAddCredentialForm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              ADD SCOPES
            </button>
          </div>

          <!-- Add User for Scope Form -->
          <div v-if="showAddCredentialForm && !editingCredential" class="psu-add-user-box">
            <h4 style="margin-bottom:16px;">Add API Scopes : {{ services.find(s=>s.service_id===selectedServiceId)?.api_endpoint }}</h4>
            <div class="psu-field">
              <label>User<span class="req">*</span></label>
              <select v-model="selectedUserId">
                <option value="">-- Select User --</option>
                <option v-for="u in availableUsers" :key="u.user_id" :value="u.user_id">
                  {{ u.username }} ({{ u.firstname }} {{ u.lastname }})
                </option>
              </select>
            </div>
            <div class="psu-actions" style="margin-top:16px;justify-content:flex-start;">
              <button class="btn-psu-save" @click="addCredential" :disabled="isLoading">SAVE</button>
            </div>
            <p style="color:#64748b; font-size:0.875rem; margin-top:8px;">* After adding the user, please click the Edit icon below to specify the Field Scopes.</p>
          </div>

          <!-- Edit Scope Form (Where Clauses) -->
          <div v-if="editingCredential" class="psu-add-user-box">
            <h4 style="margin-bottom:16px;">Edit Field Scopes : {{ editingCredential.username }}</h4>
            <div style="margin-bottom: 24px;">
              <h5 style="color:#64748b; margin-bottom:12px;">Specify Field Scopes<span class="req">*</span></h5>
              
              <div v-for="(entry, idx) in scopeEntries" :key="idx" class="psu-scope-block">
                <div class="psu-scope-label">{{ entry.field }}</div>
                <div class="psu-scope-inputs">
                  <div v-for="(val, vidx) in entry.values" :key="vidx" class="psu-scope-input-row">
                    <input type="text" :value="val" readonly class="psu-scope-val">
                    <button @click="removeScopeValue(idx, vidx)" class="btn-scope-del">&times;</button>
                  </div>
                </div>
              </div>

              <!-- Composite Scopes List -->
              <div v-if="compositeScopes.length > 0" class="psu-scope-block" style="border-left: 4px solid #8b5cf6; padding-left: 12px; margin-top: 16px;">
                <div class="psu-scope-label" style="color:#8b5cf6; font-weight:700;">Composite Scope (ข้อมูลพ่วง)</div>
                <div class="psu-scope-inputs">
                  <div v-for="(c, idx) in compositeScopes" :key="idx" class="psu-scope-input-row" style="margin-bottom: 6px;">
                    <span style="font-size:0.9rem; color:#334155; font-weight:500; background:#f5f3ff; border:1px solid #ddd6fe; padding:4px 8px; border-radius:4px;">
                      [{{ c.col1 }} = {{ c.val1 }}] &amp; [{{ c.col2 }} = {{ c.val2 }}]
                    </span>
                    <button @click="removeCompositeScope(idx)" class="btn-scope-del">&times;</button>
                  </div>
                </div>
              </div>

              <!-- Tab Selector for adding scope -->
              <div class="tabs-row" style="margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 16px;">
                <button type="button" @click="scopeTab = 'standard'" :style="{ padding: '8px 16px', border: 'none', background: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', color: scopeTab === 'standard' ? 'var(--primary)' : '#94a3b8', borderBottom: scopeTab === 'standard' ? '2px solid var(--primary)' : '2px solid transparent' }">
                  Standard Scope
                </button>
                <button type="button" @click="scopeTab = 'composite'" :style="{ padding: '8px 16px', border: 'none', background: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', color: scopeTab === 'composite' ? 'var(--primary)' : '#94a3b8', borderBottom: scopeTab === 'composite' ? '2px solid var(--primary)' : '2px solid transparent' }">
                  Composite Scope (ข้อมูลพ่วง)
                </button>
              </div>

              <!-- Standard Add Row -->
              <div v-if="scopeTab === 'standard'" class="psu-scope-add-row" style="display:flex; gap:12px;">
                <select v-model="newScopeField" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px; flex:1;">
                  <option value="">-- Select Field --</option>
                  <option v-for="f in requestFieldOptions" :key="f" :value="f">{{ f }}</option>
                </select>
                <input type="text" v-model="newScopeValue" placeholder="Value" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px; flex:1;">
                <button @click="addScopeEntry" class="btn-psu-save" style="padding:8px 16px;">Add</button>
              </div>

              <!-- Composite Add Row -->
              <div v-if="scopeTab === 'composite'" style="display:flex; flex-direction:column; gap:12px; background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:4px;">
                <div style="display:flex; gap:12px; align-items:center;">
                  <div style="flex:1;">
                    <label style="display:block; font-size:0.75rem; font-weight:600; color:#475569; margin-bottom:4px;">Column 1 (Where กรอง)</label>
                    <select v-model="newCompCol1" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px; width:100%;">
                      <option value="">-- Select Column 1 --</option>
                      <option v-for="c in dbColumnOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                  <div style="flex:1;">
                    <label style="display:block; font-size:0.75rem; font-weight:600; color:#475569; margin-bottom:4px;">Filter Value 1 (เช่น Female)</label>
                    <input type="text" v-model="newCompVal1" placeholder="e.g. Female" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px; width:100%;">
                  </div>
                  <div style="flex:1;">
                    <label style="display:block; font-size:0.75rem; font-weight:600; color:#475569; margin-bottom:4px;">Column 2 (ข้อมูลพ่วง)</label>
                    <select v-model="newCompCol2" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:4px; width:100%;">
                      <option value="">-- Select Column 2 --</option>
                      <option v-for="c in dbColumnOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                  <button type="button" @click="queryScopeCombinations" class="btn-psu-add" style="margin-top:20px; padding:10px 16px; border-radius:4px;" :disabled="isQueryingCombinations">
                    {{ isQueryingCombinations ? 'Loading...' : 'Query' }}
                  </button>
                </div>

                <!-- Query Results Checklist -->
                <div v-if="queriedCombinations.length > 0" style="margin-top: 12px;">
                  <label style="display:block; font-size:0.8125rem; font-weight:600; color:#475569; margin-bottom:6px;">Select combinations to add:</label>
                  <div style="max-height: 150px; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px; background: white; display: flex; flex-direction: column; gap: 6px;">
                    <div v-for="(item, idx) in queriedCombinations" :key="idx" style="display: flex; align-items: center; gap: 8px;">
                      <input type="checkbox" :id="'comb_' + idx" :value="idx" v-model="selectedCombinationsIdx">
                      <label :for="'comb_' + idx" style="font-size: 0.875rem; color: #1e293b; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <span>{{ item.val1 }}</span>
                        <span style="color:#64748b;">,</span>
                        <strong style="color:var(--primary);">{{ item.val2 }}</strong>
                      </label>
                    </div>
                  </div>
                  <button type="button" @click="addSelectedCombinations" class="btn-psu-save" style="margin-top: 12px; padding: 6px 16px; font-size: 0.8125rem;">
                    Add Selected Combinations
                  </button>
                </div>
                <div v-else-if="newCompCol1 && newCompCol2 && !isQueryingCombinations" style="color:#94a3b8; font-size:0.8125rem; text-align:center; padding:8px;">
                  No combinations queried yet.
                </div>
              </div>
            </div>
            <div class="psu-actions" style="justify-content:space-between;">
              <button class="btn-cancel-sm" @click="editingCredential = null">CANCEL</button>
              <button class="btn-psu-save" @click="saveScopeChanges">SAVE</button>
            </div>
          </div>

          <!-- Users Table -->
          <table class="api-table" v-show="!editingCredential">
            <thead>
              <tr>
                <th>Username</th>
                <th>API KEY</th>
                <th>Secret Key</th>
                <th>API Name</th>
                <th>Scopes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="credentials.length === 0">
                <td colspan="6" class="text-center" style="color:#94a3b8;">No scopes assigned.</td>
              </tr>
              <tr v-for="cred in credentials" :key="cred.credential_id">
                <td>{{ cred.username }}</td>
                <td>
                  <code>{{ cred.api_key || '-' }}</code>
                </td>
                <td>
                  <code>{{ cred.secret_key }}</code>
                </td>
                <td>{{ services.find(s=>s.service_id===selectedServiceId)?.api_endpoint }}</td>
                <td>
                  <code>{{ JSON.stringify(cred.scope_json || {}) }}</code>
                </td>
                <td>
                  <div style="display:flex;gap:8px;align-items:center;">
                    <button class="icon-action-btn edit" @click="startEditScope(cred)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button class="icon-action-btn delete" @click="deleteCredential(cred.credential_id)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-layout { display: flex; background-color: #f8fafc; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.api-content { flex: 1; padding: 40px; }
.content-header { margin-bottom: 32px; }
.header-titles h1 { font-size: 1.875rem; font-weight: 700; color: var(--primary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;}
.header-titles p { color: #64748b; font-size: 0.9375rem; }

.alert-message { padding: 14px 20px; border-radius: 4px; margin-bottom: 20px; font-weight: 600; }
.alert-message.success { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.alert-message.error { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }

.tabs-row { display: flex; border-bottom: 2px solid #e2e8f0; }
.tab-btn { flex: 1; padding: 16px; background: none; border: none; font-weight: 700; color: #94a3b8; cursor: pointer; text-transform: uppercase; transition: all 0.2s; font-size: 1rem; border-bottom: 4px solid transparent; }
.tab-btn:hover { color: var(--primary); background: #f8fafc; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: #f8fafc; }

.table-toolbar { padding: 16px 24px; display: flex; justify-content: flex-end; background: white; }

.btn-primary { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: var(--primary-hover); }

.api-table { width: 100%; border-collapse: collapse; }
.api-table th { text-align: left; padding: 16px 24px; font-size: 0.8125rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.api-table td { padding: 16px 24px; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; vertical-align: middle; color: #1e293b; word-break: break-all; }
.api-table code { word-break: break-all; white-space: pre-wrap; font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; font-size: 0.8125rem; }
.text-center { text-align: center; }

.btn-select { background: white; color: var(--primary); border: 1px solid var(--primary); padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s; text-transform: uppercase; }
.btn-select:hover { background: #f8fafc; }

.status-badge { padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: lowercase; }
.status-badge.active { background: #f8fafc; color: #1e293b; }
.status-badge.revoked { background: #fee2e2; color: #ef4444; }

/* Modals */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; z-index: 1000; padding-top: 5vh; }
.modal-content { background: white; border-radius: 4px; width: 90%; max-height: 90vh; overflow: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-header-psu { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: var(--primary); color: white; }
.modal-header-psu h3 { font-size: 1.125rem; font-weight: 600; margin: 0; text-transform: uppercase; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: white; cursor: pointer; opacity: 0.8; }
.modal-close:hover { opacity: 1; }
.modal-body { padding: 24px; }
.modal-body .api-table th,
.modal-body .api-table td { padding: 12px 16px; }
.modal-body-psu { padding: 32px; max-width: 600px; margin: 0 auto; }

.psu-form-grid { display: flex; flex-direction: column; gap: 20px; }
.psu-field { display: grid; grid-template-columns: 140px 1fr; align-items: center; gap: 16px; }
.psu-field label { font-size: 0.8125rem; font-weight: 600; color: #475569; text-align: right; }
.psu-field .req { color: #ef4444; margin-left: 2px; }
.psu-field select, .psu-field input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.875rem; outline: none; width: 100%; box-sizing: border-box; }
.psu-field select:focus, .psu-field input:focus { border-color: var(--primary); }

.psu-fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; padding-left: 156px; }
.psu-col label { display: block; font-size: 0.8125rem; font-weight: 600; color: #475569; margin-bottom: 12px; }
.psu-checkbox-list { display: flex; flex-direction: column; gap: 8px; }
.psu-checkbox-list label { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #1e293b; cursor: pointer; }

.psu-actions { display: flex; justify-content: flex-end; margin-top: 40px; }
.btn-psu-save { background: var(--primary); color: white; border: none; padding: 10px 32px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.2s; text-transform: uppercase; font-size: 0.875rem; }
.btn-psu-save:hover { background: var(--primary-hover); }
.btn-psu-save:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-psu-add { background: white; color: var(--primary); border: 1px solid var(--primary); padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.875rem; }
.btn-psu-add:hover { background: #f8fafc; }

.psu-add-user-box { border: 1px solid #e2e8f0; padding: 24px; border-radius: 4px; margin-bottom: 24px; background: #f8fafc; }

.icon-action-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; color: #94a3b8; transition: all 0.2s; }
.icon-action-btn.edit:hover { color: var(--primary); background: #f8fafc; }
.icon-action-btn.delete:hover { color: #ef4444; background: #fee2e2; }

.key-cell { display: flex; align-items: center; gap: 8px; }
.key-cell code { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #475569; font-size: 0.8125rem; }
.toggle-btn { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; }
.toggle-btn:hover { background: #e2e8f0; color: #475569; }

.btn-cancel-sm { background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
.btn-cancel-sm:hover { background: #f1f5f9; }

.psu-scope-block { margin-bottom: 12px; }
.psu-scope-label { font-size: 0.8125rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
.psu-scope-inputs { display: flex; flex-direction: column; gap: 8px; }
.psu-scope-input-row { display: flex; align-items: center; gap: 8px; }
.psu-scope-val { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc; font-size: 0.875rem; flex: 1; color: #475569; }
.btn-scope-del { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.25rem; padding: 0 4px; }
.btn-scope-del:hover { color: #ef4444; }
</style>
