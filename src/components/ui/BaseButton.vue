<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    icon?: IconName
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'md', icon: undefined, type: 'button', disabled: false },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :disabled="disabled"
  >
    <BaseIcon v-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-pill);
  font-weight: 600;
  white-space: nowrap;
  transition:
    background-color var(--duration) var(--ease),
    color var(--duration) var(--ease),
    transform 120ms var(--ease),
    box-shadow var(--duration) var(--ease);
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
}

.btn--md {
  height: 44px;
  padding-inline: var(--space-5);
}

.btn--sm {
  height: 34px;
  padding-inline: var(--space-3);
  font-size: 13px;
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-contrast);
  box-shadow: 0 6px 18px -6px var(--accent);
}

.btn--primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn--secondary {
  background: var(--surface-2);
  color: var(--text);
  box-shadow: inset 0 0 0 1px var(--border);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--surface-3);
}

.btn--ghost {
  color: var(--text-muted);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--text);
  background: var(--surface-2);
}

.btn--danger {
  background: var(--danger);
  color: var(--on-danger);
}

.btn--danger:hover:not(:disabled) {
  background: var(--danger-hover);
}
</style>
