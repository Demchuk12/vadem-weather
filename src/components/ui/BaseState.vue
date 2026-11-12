<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'

withDefaults(
  defineProps<{
    icon?: IconName
    title?: string
    text?: string
    tone?: 'accent' | 'danger'
  }>(),
  { icon: undefined, title: undefined, text: undefined, tone: 'accent' },
)
</script>

<template>
  <div class="state" :class="`state--${tone}`" :role="tone === 'danger' ? 'alert' : undefined">
    <slot name="media">
      <span v-if="icon" class="state__icon"><BaseIcon :name="icon" :size="26" /></span>
    </slot>
    <h3 v-if="title" class="state__title">{{ title }}</h3>
    <p v-if="text" class="state__text">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-4);
  text-align: center;
  color: var(--text-muted);
}

.state__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--accent-soft);
  color: var(--accent);
}

.state--danger .state__icon {
  background: var(--danger-soft);
  color: var(--danger);
}

.state__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.state__text {
  max-width: 380px;
}
</style>
