<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <div class="user-edit-container">
      <!-- Header Section -->
      <div class="edit-header-card animate-slide-down">
        <div class="header-left">
          <h2>User Management</h2>
          <div class="breadcrumb-strip">
            <span class="root">SSO Settings</span>
            <ArrowRight :size="16" class="arrow" />
            <span class="node">User</span>
            <ArrowRight :size="16" class="arrow" />
            <div class="active-pill">{{ isEdit ? 'Edit User' : 'Add User' }}</div>
          </div>
        </div>
        <button class="btn-go-back" @click="goBack">
          <ArrowLeft :size="16" />
          <span>Go Back</span>
        </button>
      </div>

      <!-- Form Section -->
      <div class="form-container animate-fade-in">
        <div class="form-grid">
          <!-- Username -->
          <div class="form-group">
            <label>Username</label>
            <input type="text" v-model="form.username" placeholder="e.g..eak" :disabled="isEdit" />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" placeholder="eak@example.com" :disabled="isEdit" />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label>Password (for add)</label>
            <input type="password" v-model="form.password" placeholder="*************" :disabled="isEdit" />
          </div>

          <!-- Status -->
          <div class="form-group">
            <label>Status</label>
            <div class="select-wrapper">
              <select v-model="form.status">
                <option value="active">active</option>
                <option value="locked">locked</option>
              </select>
            </div>
          </div>

          <!-- Roles (multi-select) -->
          <div class="form-group full-width">
            <label>Roles (multi-select)</label>
            <div class="multi-select-box" @click="toggleRoles">
              <div class="selected-pills">
                <span v-for="role in form.roles" :key="role" class="pill blue">
                  {{ role }}
                </span>
              </div>
              <ChevronDown :size="18" class="chevron" />
            </div>
            <div v-if="showRolesDropdown" class="dropdown-list">
              <div v-for="role in availableRoles" :key="role" class="dropdown-item">
                <input 
                  type="checkbox" 
                  :id="role" 
                  :value="role" 
                  v-model="form.roles" 
                />
                <label :for="role">{{ role }}</label>
              </div>
            </div>
          </div>

          <!-- Groups (multi-select) -->
          <div class="form-group full-width">
            <label>Groups (multi-select)</label>
            <div class="multi-select-box" @click="toggleGroups">
              <div class="selected-pills">
                <span v-for="group in form.groups" :key="group" class="pill blue">
                  {{ group }}
                </span>
              </div>
              <ChevronDown :size="18" class="chevron" />
            </div>
            <div v-if="showGroupsDropdown" class="dropdown-list">
              <div v-for="group in availableGroups" :key="group" class="dropdown-item">
                <input 
                  type="checkbox" 
                  :id="group" 
                  :value="group" 
                  v-model="form.groups" 
                />
                <label :for="group">{{ group }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="error-banner animate-fade-in">
          {{ errorMsg }}
        </div>

        <!-- Footer Buttons -->
        <div class="form-footer">
          <button class="btn-cancel" @click="goBack" :disabled="isSaving">Cancel</button>
          <button class="btn-save" @click="handleSave" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { postWithUser } from '../../utils/api'

const router = useRouter()
const route = useRoute()
const showRolesDropdown = ref(true) // Open by default as in screenshot
const showGroupsDropdown = ref(false)

const availableRoles = ['admin', 'manager', 'analyst', 'User', 'auditor']
const availableGroups = ['finance', 'hr', 'it', 'operations']

const isEdit = computed(() => !!route.params.id)
const userId = computed(() => route.params.id)

const form = reactive({
  username: '',
  email: '',
  password: '',
  status: 'active',
  roles: ['admin', 'manager'],
  groups: ['finance', 'hr']
})

const toggleRoles = () => showRolesDropdown.value = !showRolesDropdown.value
const toggleGroups = () => showGroupsDropdown.value = !showGroupsDropdown.value

const goBack = () => router.push('/admin/users')

const loadUserData = async () => {
  if (!isEdit.value) return
  try {
    const response = await postWithUser('/getUsers', {})
    if (response.data && response.data.status === 'success') {
      const u = response.data.data.find(user => String(user.id) === String(userId.value))
      if (u) {
        form.username = u.username || ''
        form.email = u.email || ''
        form.status = u.status || 'active'
        form.password = '*************'
        
        // Map backend role to frontend checkboxes
        const roleLower = (u.role || '').toLowerCase()
        if (roleLower === 'admin' || roleLower === 'rootadmin') {
          form.roles = ['admin']
        } else if (roleLower === 'user') {
          form.roles = ['User']
        } else {
          const matched = availableRoles.find(r => r.toLowerCase() === roleLower)
          if (matched) {
            form.roles = [matched]
          } else {
            form.roles = [u.role || 'User']
          }
        }
        
        // Map department to groups
        const dept = u.groups || u.department || 'general'
        const matchedGroup = availableGroups.find(g => g.toLowerCase() === dept.toLowerCase())
        if (matchedGroup) {
          form.groups = [matchedGroup]
        } else {
          form.groups = [dept]
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

onMounted(() => {
  loadUserData()
})

const isSaving = ref(false)
const errorMsg = ref('')

const handleSave = async () => {
  errorMsg.value = ''
  if (isEdit.value) {
    try {
      isSaving.value = true
      // Map roles back to previlage_id
      let previlage_id = '3' // Default to User
      if (form.roles.some(r => r.toLowerCase() === 'rootadmin')) {
        previlage_id = '1'
      } else if (form.roles.some(r => r.toLowerCase() === 'admin')) {
        previlage_id = '2'
      } else {
        previlage_id = '3'
      }

      const userStored = JSON.parse(localStorage.getItem('sso_user') || localStorage.getItem('user') || '{}');
      const response = await postWithUser('/mgmt/updateUserById', userStored, {
        target_user_id: userId.value,
        previlage_id: previlage_id
      })

      if (response.data && response.data.status === 'success') {
        alert('User updated successfully')
        goBack()
      } else {
        alert('Failed to update user: ' + (response.data?.message || 'unknown error'))
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error updating user role')
    } finally {
      isSaving.value = false
    }
  } else {
    // ADD USER
    if (!form.username.trim()) {
      errorMsg.value = 'กรุณากรอก Username'
      return
    }
    if (!form.email.trim()) {
      errorMsg.value = 'กรุณากรอก Email'
      return
    }
    if (!form.password.trim()) {
      errorMsg.value = 'กรุณากรอก Password'
      return
    }

    try {
      isSaving.value = true
      const userStored = JSON.parse(localStorage.getItem('sso_user') || localStorage.getItem('user') || '{}')
      const response = await postWithUser('/mgmt/createUser', userStored, {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        status: form.status,
        roles: form.roles,
        groups: form.groups
      })

      if (response.data && response.data.status === 'success') {
        alert(`เพิ่มผู้ใช้ "${form.username}" สำเร็จ!`)
        goBack()
      } else {
        errorMsg.value = response.data?.message || 'ไม่สามารถเพิ่มผู้ใช้ได้'
      }
    } catch (error) {
      console.error('Error creating user:', error)
      const msg = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่'
      errorMsg.value = msg
    } finally {
      isSaving.value = false
    }
  }
}

</script>

<style scoped>
.user-edit-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header Section */
.edit-header-card {
  background: white;
  border-radius: 24px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.header-left h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #1a202c;
}

.breadcrumb-strip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.breadcrumb-strip span { font-size: 14px; font-weight: 700; color: #5c6ac4; }
.breadcrumb-strip .arrow { color: #a0aec0; }

.active-pill {
  background: #5c6ac4;
  color: white;
  padding: 6px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.btn-go-back {
  background: #2b4194;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
}

/* Form Container */
.form-container {
  background: #111827;
  border-radius: 40px;
  padding: 60px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group.full-width { grid-column: span 1; } /* Matching screenshot's narrow columns */

.form-group label {
  color: #e5e7eb;
  font-size: 16px;
  font-weight: 600;
}

.form-group input, .select-wrapper select, .multi-select-box {
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 12px;
  padding: 14px 20px;
  color: #f3f4f6;
  font-size: 15px;
  transition: all 0.2s;
}

.form-group input::placeholder { color: #6b7280; }

.form-group input:disabled {
  background: #1f2937 !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-wrapper select { width: 100%; appearance: none; }

.multi-select-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.selected-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill.blue {
  background: #3b82f6;
  color: white;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.dropdown-list {
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 12px;
  margin-top: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e5e7eb;
}

.dropdown-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  cursor: pointer;
}

/* Footer */
.form-footer {
  margin-top: 60px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.btn-cancel, .btn-save {
  padding: 10px 40px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
}

.btn-cancel { background: #3b82f6; color: white; border: none; cursor: pointer; transition: background 0.2s; }
.btn-save { background: #3b82f6; color: white; border: none; cursor: pointer; transition: background 0.2s; }

.btn-cancel:hover, .btn-save:hover { background: #2563eb; }

.btn-cancel:disabled, .btn-save:disabled {
  background: #4b5563;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-banner {
  margin-top: 30px;
  background: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }

@keyframes slideDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
</style>
