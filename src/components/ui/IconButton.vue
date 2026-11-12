<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'

withDefaults(
  defineProps<{
    icon: IconName
    label: string
    tone?: 'default' | 'favorite' | 'danger'
    pressed?: boolean
    filled?: boolean
    spinning?: boolean
    disabled?: boolean
  }>(),
  { tone: 'default', pressed: undefined, filled: false, spinning: false, disabled: false },
)
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="[`icon-btn--${tone}`, { 'is-active': pressed, 'is-spinning': spinning }]"
    :aria-label="label"
    :title="label"
    :aria-pressed="pressed"
    :disabled="disabled"
  >
    <Transition name="icon-swap" mode="out-in">
      <BaseIcon :key="icon" :name="icon" :filled="filled" />
    </Transition>
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
  transition:
    color var(--duration) var(--ease),
    background-color var(--duration) var(--ease),
    transform 120ms var(--ease);
}

.icon-btn:hover:not(:disabled) {
  color: var(--text);
  background: var(--surface-3);
}

.icon-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.icon-btn:disabled {
  opacity: 0.4;
}

.icon-btn--favorite.is-active {
  color: var(--favorite);
  background: var(--favorite-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--favorite) 40%, transparent);
}

.icon-btn--favorite.is-active :deep(svg) {
  animation: pop 360ms var(--ease);
}

.is-spinning :deep(svg) {
  animation: spin 0.9s linear infinite;
}

.icon-btn--danger:hover:not(:disabled) {
  color: var(--danger);
  background: var(--danger-soft);
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 160ms var(--ease),
    transform 260ms var(--ease);
}

.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

@keyframes pop {
  40% {
    transform: scale(1.3) rotate(-12deg);
  }
}
</style>
