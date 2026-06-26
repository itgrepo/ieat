<template>
  <div class="auth-layout">
    <div class="auth-card premium-card">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sidebar);
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: white;
}
</style>
