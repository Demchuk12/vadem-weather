<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="container footer">
    <span>© {{ year }} Vadem Weather</span>
    <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">
      OpenWeatherMap
    </a>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-6) var(--space-8);
  font-size: 13px;
  color: var(--text-subtle);
}

.footer a:hover {
  color: var(--accent);
}
</style>
