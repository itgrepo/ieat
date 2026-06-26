<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <div class="user-mgmt-container">
      <!-- Header / Breadcrumb Section -->
      <div class="mgmt-header-card animate-slide-down">
        <div class="header-left">
          <h2>User Management</h2>
          <div class="breadcrumb">
            <span class="root">SSO Settings</span>
            <ArrowRight :size="16" class="arrow" />
            <span class="current">User</span>
          </div>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-row animate-fade-in">
        <div class="search-box">
          <input type="text" placeholder="Search users" v-model="searchQuery" />
          <Search :size="20" class="search-icon" />
        </div>
        <div class="action-btns" v-if="isAdmin">
          <button class="btn-add" @click="router.push('/admin/users/add')">
            <UserPlus :size="18" />
            <span>Add User</span>
          </button>
          <button class="btn-import">
            <Download :size="18" />
            <span>Import</span>
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container animate-fade-in">
        <table class="dark-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Groups</th>
              <th>Status</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.groups }}</td>
              <td>
                <span :class="['status-text', user.status]">
                  {{ user.status }}
                </span>
              </td>
              <td class="actions-cell" v-if="isAdmin">
                <button class="btn-edit-action" @click="router.push(`/admin/users/edit/${user.id}`)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Search, UserPlus, Download } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { postWithUser } from '../../utils/api'

const router = useRouter()
const searchQuery = ref('')
const users = ref([])

const userStr = localStorage.getItem('sso_user') || localStorage.getItem('user');
const activeUser = userStr ? JSON.parse(userStr) : null;
const isAdmin = activeUser?.role === 'Admin' || activeUser?.department === 'Administrator';

onMounted(async () => {
  if (!isAdmin) {
    router.push('/');
    return;
  }

  try {
    const response = await postWithUser('/getUsers', {});
    if (response.data && response.data.status === 'success') {
      users.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.username.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
.user-mgmt-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Card */
.mgmt-header-card {
  background: white;
  border-radius: 24px;
  padding: 24px 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-left h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb span {
  font-size: 13px;
  font-weight: 700;
}

.breadcrumb .root { color: #667eea; cursor: pointer; }
.breadcrumb .arrow { color: #555; }
.breadcrumb .current {
  background: #667eea;
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
}

/* Controls */
.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 12px 20px 12px 48px;
  border-radius: 30px;
  border: 2px solid #cbd5e0;
  background: #f7fafc;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.btn-add, .btn-import {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(45, 66, 178, 0.2);
}

.btn-add { background: #3f51b5; }
.btn-import { background: #3f51b5; }

.btn-add:hover, .btn-import:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 6px 12px rgba(45, 66, 178, 0.3);
}

/* Table Section */
.table-container {
  background: #1a202c;
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.dark-table {
  width: 100%;
  border-collapse: collapse;
  color: #e2e8f0;
}

.dark-table th {
  text-align: left;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #a0aec0;
  border-bottom: 1px solid #2d3748;
}

.dark-table td {
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #2d3748;
}

.dark-table tr:last-child td { border-bottom: none; }

.dark-table tr:hover { background: rgba(255, 255, 255, 0.03); }

/* Status Styles */
.status-text {
  font-weight: 700;
  font-size: 13px;
}

.status-text.active { color: #48bb78; }
.status-text.locked { color: #f6ad55; }

/* Actions */
.btn-edit-action {
  background: #4a5568;
  color: white;
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-edit-action:hover {
  background: #667eea;
}

/* Animations */
.animate-slide-down {
  animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
