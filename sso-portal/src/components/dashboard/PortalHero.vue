<template>
  <div class="portal-hero">
    <div class="hero-content">
      <div class="hero-badges">
        <span class="badge badge-success">
          <span class="dot"></span> System Live
        </span>
        <span class="badge badge-info">Production Environment</span>
      </div>
      <h1 class="hero-title">
        Smart Port <span class="gradient-text">Portal (SSO)</span>
      </h1>
      <p class="hero-subtitle">
        Access all port operations, surveillance systems, and internal resources from a single, secure gateway. Empowering Digital Maritime Excellence.
      </p>
    </div>
    <div class="hero-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
  </div>
</template>

<style scoped>
.portal-hero {
  background: white;
  padding: 48px 32px;
  border-radius: var(--radius-lg);
  border: var(--border-default);
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.hero-content { position: relative; z-index: 2; max-width: 600px; }

.hero-badges { display: flex; gap: 12px; margin-bottom: 24px; }

.hero-title { 
  font-size: 42px; 
  font-weight: 800; 
  color: var(--text-main); 
  line-height: 1.2; 
  margin-bottom: 16px; 
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle { font-size: 16px; color: var(--text-muted); line-height: 1.6; }

.badge-success { background: #d1fae5; color: #065f46; display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #059669; animation: pulse 2s infinite; }

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(5, 150, 105, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
}

.hero-decoration .circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: rgba(59, 130, 246, 0.1);
  top: -100px;
  right: -50px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: rgba(139, 92, 246, 0.1);
  bottom: -50px;
  right: -100px;
}
</style>
