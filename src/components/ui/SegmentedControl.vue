<script setup lang="ts" generic="T extends string">
import { computed, nextTick, useTemplateRef } from 'vue'
import BaseIcon from './BaseIcon.vue'
import type { IconName } from './icons'

export interface SegmentOption<V extends string> {
  value: V
  label: string
  icon?: IconName
}

const props = defineProps<{ options: SegmentOption<T>[]; label: string }>()
const model = defineModel<T>({ required: true })
const items = useTemplateRef<HTMLButtonElement[]>('items')

const activeIndex = computed(() =>
  Math.max(
    0,
    props.options.findIndex((option) => option.value === model.value),
  ),
)

async function move(step: 1 | -1) {
  const count = props.options.length
  const index = (activeIndex.value + step + count) % count
  const next = props.options[index]
  if (!next) return
  model.value = next.value
  await nextTick()
  items.value?.[index]?.focus()
}
</script>

<template>
  <div
    class="segmented"
    role="radiogroup"
    :aria-label="label"
    :style="{ '--count': options.length, '--index': activeIndex }"
    @keydown.right.prevent="move(1)"
    @keydown.left.prevent="move(-1)"
  >
    <span class="segmented__thumb" aria-hidden="true" />
    <button
      v-for="(option, index) in options"
      ref="items"
      :key="option.value"
      type="button"
      role="radio"
      class="segmented__item"
      :class="{ 'is-active': index === activeIndex }"
      :aria-checked="index === activeIndex"
      :tabindex="index === activeIndex ? 0 : -1"
      @click="model = option.value"
    >
      <BaseIcon v-if="option.icon" :name="option.icon" :size="16" />
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(var(--count), 1fr);
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}

.segmented__thumb {
  position: absolute;
  inset: 4px auto 4px 4px;
  width: calc((100% - 8px) / var(--count));
  border-radius: var(--radius-pill);
  background: var(--surface-solid);
  box-shadow:
    var(--shadow-sm),
    0 0 0 1px var(--border);
  transform: translateX(calc(100% * var(--index)));
  transition: transform 300ms var(--ease);
}

.segmented__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding-inline: var(--space-4);
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  transition: color var(--duration) var(--ease);
}

.segmented__item.is-active,
.segmented__item:hover {
  color: var(--text);
}
</style>
