<template>
  <div v-if="visible" class="flow-visualizer-overlay animate-fade-in">
    <div class="flow-visualizer-card glass">
      <div class="visualizer-header">
        <div class="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="pulse-icon">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>SSO Live Flow Tracer</h3>
        </div>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="visualizer-body">
        <div class="steps-timeline">
          <div 
            v-for="(step, idx) in steps" 
            :key="idx" 
            class="timeline-item"
            :class="{ 
              'active': idx === currentStep,
              'completed': idx < currentStep,
              'pending': idx > currentStep
            }"
          >
            <div class="timeline-indicator">
              <span class="step-num" v-if="idx >= currentStep">{{ idx + 1 }}</span>
              <span class="step-check" v-else>✓</span>
              <div v-if="idx < steps.length - 1" class="timeline-line"></div>
            </div>
            
            <div class="step-content">
              <div class="step-meta">
                <span class="phase-badge">{{ step.phase }}</span>
                <span v-if="idx === currentStep" class="live-pulse">LIVE TRACING</span>
              </div>
              <h4>{{ step.title }}</h4>
              <p class="step-desc">{{ step.description }}</p>
              
              <div v-if="idx === currentStep && activeDetails" class="step-details-box animate-slide-up">
                <div class="details-header">
                  <span class="details-dot"></span>
                  <span>Execution Log</span>
                </div>
                <div class="details-content">
                  <pre>{{ activeDetails }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="visualizer-footer">
        <p class="sso-standard-badge">SSO Portal SAML/OIDC Protocol Engine v2.0</p>
        <button @click="$emit('close')" class="btn-done">Close Trace</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  currentStep: {
    type: Number,
    default: 0
  },
  traceData: {
    type: Array,
    default: () => []
  },
  activeDetails: {
    type: String,
    default: ''
  }
});

defineEmits(['close']);

const steps = [
  {
    phase: 'Phase 1: SAML Login Initiation',
    title: 'Identity Assertion & SAML Mock Login',
    description: 'SSO Portal initiates OIDC/SAML authentication check, resolving credential/username.'
  },
  {
    phase: 'Phase 2: Check SSO DB',
    title: 'SSO Local Database Verification',
    description: 'SSO checks local database users.json to see if this user identity already exists.'
  },
  {
    phase: 'Phase 2: User Discovery',
    title: 'PMIS ValidateUser Integration',
    description: 'User not found in SSO. SSO calls PMIS endpoint to validate user existence and fetch role_id.'
  },
  {
    phase: 'Phase 2: JIT Provisioning',
    title: 'Just-in-Time User Provisioning',
    description: 'User exists in PMIS. SSO dynamically registers user locally and automatically maps PMIS roles.'
  },
  {
    phase: 'Phase 4: Token Generation',
    title: 'Issue Short-lived JWT Token',
    description: 'SSO issues a secure 5-minute single-use JWT representing user session for Deep Linking.'
  },
  {
    phase: 'Phase 5: Validate Token & Bypass',
    title: 'PMIS Token Verification & SSO Bypass',
    description: 'PMIS validates JWT token back with SSO. PMIS verifies user identity, bypasses login, and grants access.'
  }
];
</script>

<style scoped>
.flow-visualizer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.flow-visualizer-card {
  width: 100%;
  max-width: 680px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #3b82f6;
}

.pulse-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.header-title h3 {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  color: white;
}

.visualizer-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  position: relative;
  transition: all 0.3s;
}

.timeline-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 32px;
}

.step-num, .step-check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  z-index: 2;
  transition: all 0.3s;
}

.timeline-item.pending .step-num {
  background: #334155;
  color: #64748b;
  border: 1px solid #475569;
}

.timeline-item.active .step-num {
  background: #3b82f6;
  color: white;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  border: 2px solid #60a5fa;
}

.timeline-item.completed .step-check {
  background: #10b981;
  color: white;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.timeline-line {
  position: absolute;
  top: 32px;
  bottom: -24px;
  width: 2px;
  z-index: 1;
}

.timeline-item.completed .timeline-line {
  background: #10b981;
}

.timeline-item.pending .timeline-line {
  background: #334155;
}

.timeline-item.active .timeline-line {
  background: linear-gradient(to bottom, #3b82f6, #334155);
}

.step-content {
  flex: 1;
}

.step-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.phase-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.live-pulse {
  font-size: 9px;
  font-weight: 800;
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  animation: pulse-red 1s infinite alternate;
}

@keyframes pulse-red {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

.step-content h4 {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 4px 0;
  transition: color 0.3s;
}

.timeline-item.active .step-content h4 {
  color: #60a5fa;
}

.timeline-item.pending .step-content h4 {
  color: #64748b;
}

.step-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.timeline-item.pending .step-desc {
  color: #475569;
}

.step-details-box {
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.details-header {
  background: rgba(30, 41, 59, 0.8);
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.details-dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1s infinite;
}

.details-content {
  padding: 10px 12px;
}

.details-content pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #38bdf8;
  white-space: pre-wrap;
  word-break: break-all;
}

.visualizer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.3);
}

.sso-standard-badge {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.btn-done {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-done:hover {
  background: #2563eb;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
