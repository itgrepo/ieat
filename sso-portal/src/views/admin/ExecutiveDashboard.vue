<template>
  <AdminLayout adminTitle="Digital Smart Port">
    <div class="stats-container">
      <!-- Top Banner Section -->
      <div class="banner-card animate-slide-down">
        <div class="banner-content">
          <h1>Executive Dashboard</h1>
          <p class="subtitle">Data Visualization & Analytics</p>
          <div class="pill-group">
            <span class="pill-badge purple">ภาคผนวก ก 2.2 (Dashboard)</span>
            <span class="pill-badge purple">ภาคผนวก ก 2.6 (10 Reports)</span>
            <span class="pill-badge purple">ภาคผนวก ก 2.1, 2.9 (20 Datasets)</span>
          </div>
        </div>
      </div>

      <!-- Key Metrics Row -->
      <div class="metrics-grid animate-fade-in">
        <div class="metric-card">
          <div class="card-label">รายได้สะสม (PMIS)</div>
          <div class="card-value highlight">฿145M</div>
        </div>
        <div class="metric-card">
          <div class="card-label">เรือเข้า-ออก (VTMS)</div>
          <div class="card-value">1,240</div>
        </div>
        <div class="metric-card">
          <div class="card-label">สินค้าผ่านท่า (Ton)</div>
          <div class="card-value">5.2M</div>
        </div>
        <div class="metric-card">
          <div class="card-label">Satisfaction</div>
          <div class="card-value">4.8/5</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row animate-fade-in">
        <!-- Bar Chart Card -->
        <div class="chart-card bar-chart-container">
          <div class="chart-header">
            <h3>Revenue vs Vessel Traffic Analysis</h3>
            <span class="pill-badge purple-soft">ภาคผนวก ก 2.2 (Analytics)</span>
          </div>
          <div class="bar-chart">
            <div class="bar-group" v-for="(h, i) in [40, 60, 100, 120, 150, 140, 160]" :key="i">
              <div class="bar-line"></div>
              <div class="bar-fill" :style="{ height: h + 'px' }"></div>
            </div>
          </div>
        </div>

        <!-- Donut Chart Card -->
        <div class="chart-card donut-chart-container">
          <div class="donut-wrapper">
            <div class="donut-hole"></div>
            <div class="donut-segment s1"></div>
            <div class="donut-segment s2"></div>
            <div class="donut-segment s3"></div>
          </div>
          <div class="donut-legend">
            <div class="legend-item">
              <span class="label">เรือเข้าออก</span>
              <span class="val">1,240</span>
            </div>
            <div class="legend-item">
              <span class="label">รายได้สะสม</span>
              <span class="val purple-text">฿145M</span>
            </div>
            <div class="legend-item">
              <span class="label">สินค้าผ่านท่า</span>
              <span class="val">5.2M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '../../layouts/AdminLayout.vue'
</script>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
}

/* Banner Section */
.banner-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 32px 40px;
}

.banner-content h1 { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.banner-content .subtitle { color: #6b7280; font-size: 16px; margin-bottom: 20px; }

.pill-group { display: flex; flex-wrap: wrap; gap: 12px; }
.pill-badge { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.pill-badge.purple { background: #efeefd; color: #6366f1; }
.pill-badge.purple-soft { background: #f5f3ff; color: #8b5cf6; }

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
}

.card-label { color: #64748b; font-size: 15px; font-weight: 700; margin-bottom: 12px; }
.card-value { font-size: 32px; font-weight: 800; color: #6366f1; }
.card-value.highlight { color: #5c4df3; }

/* Charts Layout */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.chart-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
}

/* Bar Chart Styling */
.bar-chart-container .chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.chart-header h3 { font-size: 20px; font-weight: 800; color: #1e293b; }

.bar-chart {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 20px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 32px;
}

.bar-line { width: 1px; height: 100px; background: #e2e8f0; margin-bottom: -100px; z-index: 1; }
.bar-fill {
  width: 24px;
  background: #6366f1;
  border-radius: 12px;
  z-index: 2;
  transition: height 0.8s ease-out;
}

/* Donut Chart Styling */
.donut-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.donut-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f5f9;
}

.donut-segment { position: absolute; top:0; left:0; width:100%; height:100%; }
.donut-segment.s1 { background: conic-gradient(#8b5cf6 0% 40%, transparent 40% 100%); }
.donut-segment.s2 { background: conic-gradient(transparent 0% 40%, #c084fc 40% 75%, transparent 75% 100%); }
.donut-segment.s3 { background: conic-gradient(transparent 0% 75%, #ddd6fe 75% 100%); }

.donut-hole {
  position: absolute;
  top: 30px; left: 30px;
  width: 120px; height: 120px;
  background: white;
  border-radius: 50%;
  z-index: 10;
}

.donut-legend { width: 100%; display: flex; flex-direction: column; gap: 12px; }
.legend-item { display: flex; flex-direction: column; align-items: center; }
.legend-item .label { font-size: 13px; font-weight: 700; color: #1e293b; }
.legend-item .val { font-size: 14px; font-weight: 800; color: #6366f1; }
.legend-item .purple-text { color: #5c4df3; }

.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }

@keyframes slideDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
</style>
