<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <RouterLink to="/" class="logo" :aria-label="t('app.title')">
    <svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffd36a" />
          <stop offset="1" stop-color="#ff7a3d" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="var(--accent)" />
      <circle cx="25" cy="25" r="11" fill="url(#logo-sun)" />
      <path d="M22 48a9 9 0 0 1 1-18 12 12 0 0 1 22 4 7 7 0 0 1-1 14z" fill="#fff" />
    </svg>
    <span class="logo__text">
      <strong>Vadem</strong>
      <span>Weather</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-md);
}

.logo__mark {
  width: 44px;
  height: 44px;
  filter: drop-shadow(0 8px 16px color-mix(in srgb, var(--accent) 40%, transparent));
  transition: transform 400ms var(--ease);
}

.logo:hover .logo__mark {
  transform: rotate(-8deg) scale(1.05);
}

.logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.logo__text strong {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.logo__text span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
</style>
