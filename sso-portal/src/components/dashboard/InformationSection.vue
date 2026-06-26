<template>
  <div class="info-section animate-fade-in">
    <div class="section-grid">
      <!-- Announcements -->
      <div class="info-card purple">
        <div class="card-header">
          <div class="icon-box">
            <Megaphone :size="24" />
          </div>
          <div class="header-text">
            <h3>📢 ประกาศ</h3>
            <p>Announcements</p>
          </div>
        </div>
        <div class="card-body">
          <p class="excerpt">อัปเดตประกาศสำคัญเกี่ยวกับระบบงานและระเบียบการใช้งานท่าเรือล่าสุด...</p>
          <button class="btn-more">อ่านเพิ่มเติม ></button>
        </div>
      </div>

      <!-- News -->
      <div class="info-card blue">
        <div class="card-header">
          <div class="icon-box">
            <Newspaper :size="24" />
          </div>
          <div class="header-text">
            <h3>📰 ข่าวสาร</h3>
            <p>News & Updates</p>
          </div>
        </div>
        <div class="card-body">
          <p class="excerpt">ติดตามข่าวสารกิจกรรมและโครงการพัฒนาต่างๆ ของ Smart Port ในรอบสัปดาห์...</p>
          <button class="btn-more">อ่านเพิ่มเติม ></button>
        </div>
      </div>

      <!-- Manuals -->
      <div class="info-card green">
        <div class="card-header">
          <div class="icon-box">
            <BookOpen :size="24" />
          </div>
          <div class="header-text">
            <h3>📚 คู่มือ</h3>
            <p>User Manuals</p>
          </div>
        </div>
        <div class="card-body">
          <p class="excerpt">รวบรวมคู่มือการใช้งานระบบและแนวทางปฏิบัติสำหรับผู้ประกอบการและบุคลากร...</p>
          <button class="btn-more">อ่านเพิ่มเติม ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Megaphone, Newspaper, BookOpen } from 'lucide-vue-next'
</script>

<style scoped>
.info-section { margin-top: 40px; margin-bottom: 60px; }
.section-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #f1f5f9;
  min-height: 240px;
}

.info-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); }

/* Category Colors */
.info-card.purple { border-top: 6px solid #8b5cf6; }
.info-card.blue { border-top: 6px solid #3b82f6; }
.info-card.green { border-top: 6px solid #10b981; }

.card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.purple .icon-box { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.blue .icon-box { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.green .icon-box { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.header-text h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }
.header-text p { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 2px 0 0; }

.card-body .excerpt { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }

.btn-more {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.purple .btn-more { color: #8b5cf6; }
.blue .btn-more { color: #3b82f6; }
.green .btn-more { color: #10b981; }

.btn-more:hover { text-decoration: underline; opacity: 0.8; }

@media (max-width: 1024px) {
  .section-grid { grid-template-columns: 1fr; }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
