<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useFavoritesStore } from '@/stores/favorites.store'

const { t } = useI18n()
const { count } = storeToRefs(useFavoritesStore())
</script>

<template>
  <nav class="tabs" :aria-label="t('app.title')">
    <RouterLink to="/" class="tabs__item" active-class="" exact-active-class="is-active">
      <BaseIcon name="home" :size="18" />
      {{ t('nav.home') }}
    </RouterLink>
    <RouterLink to="/favorites" class="tabs__item" active-class="is-active">
      <BaseIcon name="star" :size="18" />
      {{ t('nav.favorites') }}
      <span v-if="count" class="tabs__badge tabular">{{ count }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  gap: var(--space-1);
  padding: 5px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  backdrop-filter: blur(16px);
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px var(--border);
}

.tabs__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding-inline: var(--space-5);
  border-radius: var(--radius-pill);
  font-weight: 700;
  color: var(--text-muted);
  transition:
    color var(--duration) var(--ease),
    background-color var(--duration) var(--ease);
}

.tabs__item:hover {
  color: var(--text);
}

.tabs__item.is-active {
  color: var(--accent-contrast);
  background: var(--accent);
  box-shadow: 0 6px 16px -6px var(--accent);
}

.tabs__badge {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 6px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  background: var(--favorite);
  color: var(--on-favorite);
}
</style>
