<script setup lang="ts">
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 22, label: undefined })
</script>

<template>
  <span class="spinner" role="status" :style="{ '--size': `${size}px` }">
    <span v-if="label" class="visually-hidden">{{ label }}</span>
  </span>
</template>

<style scoped>
.spinner {
  display: inline-block;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  border: 2.5px solid color-mix(in srgb, currentColor 22%, transparent);
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}
</style>
