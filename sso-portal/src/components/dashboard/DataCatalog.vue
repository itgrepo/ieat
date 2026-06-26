<template>
  <div class="data-catalog-section premium-card animate-fade-in">
    <div class="catalog-header">
      <div class="catalog-info">
        <h3>Data Catalog</h3>
        <div class="catalog-stats">
          <div class="stat-item">
            <Database :size="16" />
            <span class="stat-count text-blue">9</span>
            <span class="stat-label">Dataset from 10</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <Layout :size="16" />
            <span class="stat-count text-purple">10</span>
            <span class="stat-label">Dashboard from 100</span>
          </div>
        </div>
      </div>
      <div class="catalog-filters">
        <span class="filter-label">SORT BY:</span>
        <button class="filter-btn active">NEW RELEASES</button>
        <button class="filter-btn">POPULAR</button>
      </div>
    </div>

    <div class="search-container">
      <div class="search-input-wrapper">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="ค้นหาชุดข้อมูล (เช่น Maritime Transport Portal Network)"
          @keyup.enter="handleSearch"
        />
      </div>
      <button class="btn-search-green" @click="handleSearch">
        ค้นหา
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Database, Layout } from 'lucide-vue-next'

const searchQuery = ref('')

const handleSearch = () => {
  console.log(`Searching for: ${searchQuery.value}`)
}
</script>

<style scoped>
.data-catalog-section {
  padding: 30px;
  margin-bottom: 40px;
  background: white;
  border-radius: 20px;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.catalog-info h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #1e293b;
}

.catalog-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.stat-count { font-weight: 800; font-size: 16px; }
.text-blue { color: #3b82f6; }
.text-purple { color: #8b5cf6; }
.stat-divider { width: 1px; height: 16px; background: #e2e8f0; }

.catalog-filters { display: flex; align-items: center; gap: 12px; }
.filter-label { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
.filter-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #1e293b;
  color: white;
}

.search-container {
  display: flex;
  gap: 16px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
}

.search-input-wrapper input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border-radius: 14px;
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  font-size: 15px;
  transition: all 0.2s;
}

.search-input-wrapper input:focus {
  border-color: #3b82f6;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.btn-search-green {
  background: #10b981;
  color: white;
  padding: 0 40px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-search-green:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.btn-search-green:active { transform: translateY(0); }

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
