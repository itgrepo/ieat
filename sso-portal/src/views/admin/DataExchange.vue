<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <div class="data-exchange-container">
      <!-- Top Banner Section -->
      <div class="banner-card animate-slide-down">
        <div class="banner-content">
          <h1>Data Exchange & API Gateway</h1>
          <p class="subtitle">ศูนย์กลางแลกเปลี่ยนข้อมูลและจัดการ API (OpenAPI)</p>
          <div class="pill-group">
            <span class="pill purple">ข้อ 3.6.3 (API Gateway)</span>
            <span class="pill purple">ข้อ 4.3.6 (Ship API)</span>
            <span class="pill purple">ข้อ 4.11 (Data Link)</span>
            <span class="pill purple">ภาคผนวก ก 2.1 (Integration)</span>
          </div>
        </div>
      </div>

      <!-- API Catalog Section -->
      <div class="catalog-section animate-fade-in">
        <div class="section-header">
          <h2>API Catalog (RESTful services)</h2>
          <div class="pill-group">
            <span class="pill soft-purple">ข้อ 3.6.3.1 (JSON/REST)</span>
            <span class="pill soft-purple">ข้อ 3.6.3.3 (OpenAPI 3.0)</span>
          </div>
        </div>

        <div class="api-list">
          <!-- API Item 1 -->
          <div class="api-card">
            <div class="method-tag get">GET</div>
            <div class="api-info">
              <h3>Vessel Schedule API</h3>
              <code>/api/smartport/vessel</code>
            </div>
            <div class="api-ref-pill">ข้อ 3.6.2 (Vessel Info)</div>
          </div>

          <!-- API Item 2 -->
          <div class="api-card">
            <div class="method-tag post">POST</div>
            <div class="api-info">
              <h3>Ship Registration API</h3>
              <code>/api/smartport/ship</code>
            </div>
            <div class="api-ref-pill">ข้อ 4.3.6 (Ship DB)</div>
          </div>

          <!-- API Item 3 -->
          <div class="api-card">
            <div class="method-tag get">GET</div>
            <div class="api-info">
              <h3>Weather Data API</h3>
              <code>/api/smartport/weather</code>
            </div>
            <div class="api-ref-pill">ภาคผนวก ก 5.1 (Weather)</div>
          </div>

          <!-- API Item 4 -->
          <div class="api-card">
            <div class="method-tag post">POST</div>
            <div class="api-info">
              <h3>Billing Calculation</h3>
              <code>/api/smartport/billing</code>
            </div>
            <div class="api-ref-pill">ข้อ 3.6.3 (Service)</div>
          </div>
        </div>
      </div>

      <!-- Code Runner Section -->
      <div class="code-section animate-fade-in">
        <div class="code-header">
          <div class="header-right">
            <button class="pill white">ข้อ 3.6.3.4 (Editor)</button>
            <button class="pill white">ข้อ 3.6.3.5 (Auto Code Gen)</button>
          </div>
        </div>
        <div class="code-content">
          <pre><code><span class="comment">// Generated Golang Code</span>
<span class="keyword">func</span> <span class="func">GetVesselSchedule</span>(w http.ResponseWriter, r *http.Request) {
  <span class="comment">// Connect to Data Lake (TOR 4.11)</span>
  <span class="keyword">return</span> json.NewEncoder(w).Encode(schedule)
}</code></pre>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '../../layouts/AdminLayout.vue'
</script>

<style scoped>
.data-exchange-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
}

/* Banner Section */
.banner-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.banner-content h1 {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.banner-content .subtitle {
  color: #6b7280;
  font-size: 18px;
  margin-bottom: 24px;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.pill.purple { background: #efeefd; color: #6366f1; }
.pill.soft-purple { background: #f5f3ff; color: #8b5cf6; }
.pill.white { background: white; color: #1e1b4b; border: none; cursor: pointer; }

/* Catalog Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  transition: all 0.2s;
}

.api-card:hover { border-color: #6366f1; transform: translateX(4px); }

.method-tag {
  width: 70px;
  padding: 8px 0;
  border-radius: 6px;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  color: white;
}

.method-tag.get { background: #06b6d4; }
.method-tag.post { background: #f97316; }

.api-info h3 { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 2px; }
.api-info code { color: #6b7280; font-size: 14px; }

.api-ref-pill {
  margin-left: auto;
  background: #f5f3ff;
  color: #8b5cf6;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* Code Runner Section */
.code-section {
  background: #231b8d;
  border-radius: 24px;
  padding: 30px;
  color: white;
  min-height: 250px;
}

.code-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.header-right { display: flex; gap: 12px; }

.code-content pre { margin: 0; font-family: 'Fira Code', monospace; line-height: 1.6; }
.code-content code { font-size: 15px; }

.comment { color: #06b6d4; }
.keyword { color: #ec4899; }
.func { color: #fbbf24; }

.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }

@keyframes slideDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
</style>
