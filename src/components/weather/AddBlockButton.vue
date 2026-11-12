<script setup lang="ts">
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useI18n } from '@/composables/useI18n'

defineProps<{ count: number; max: number }>()

const { t } = useI18n()
</script>

<template>
  <button type="button" class="add" :disabled="count >= max">
    <span class="add__icon"><BaseIcon name="plus" :size="22" /></span>
    <span class="add__text">
      <strong>{{ count < max ? t('block.addBlock') : t('block.limit', { n: max }) }}</strong>
      <small class="tabular">{{ count }} / {{ max }}</small>
    </span>
  </button>
</template>

<style scoped>
.add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 84px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-xl);
  color: var(--text-muted);
  transition:
    color var(--duration) var(--ease),
    border-color var(--duration) var(--ease),
    background-color var(--duration) var(--ease);
}

.add:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.add:disabled {
  opacity: 0.6;
}

.add__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface-solid);
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px var(--border);
  transition: transform 300ms var(--ease);
}

.add:hover:not(:disabled) .add__icon {
  transform: rotate(90deg);
}

.add__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.add__text small {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-subtle);
}
</style>
