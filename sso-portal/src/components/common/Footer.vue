<template>
  <footer class="footer">
    <div class="footer-content">
      <p>&copy; 2026 Digital Smart Port. All rights reserved.</p>
      <div class="footer-links">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 24px 30px;
  background: white;
  border-top: var(--border-default);
  color: var(--text-muted);
  font-size: 13px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 20px;
}
</style>
