<script setup lang="ts">
import SkeletonBox from '@/components/ui/SkeletonBox.vue'
</script>

<template>
  <div class="skeleton-layout" aria-hidden="true">
    <div class="skeleton-layout__row">
      <SkeletonBox height="260px" radius="var(--radius-lg)" />
      <div class="skeleton-layout__grid">
        <SkeletonBox v-for="n in 6" :key="n" height="76px" radius="var(--radius-md)" />
      </div>
    </div>
    <SkeletonBox height="320px" radius="var(--radius-lg)" />
  </div>
</template>

<style scoped>
.skeleton-layout {
  display: grid;
  gap: var(--space-4);
}

.skeleton-layout__row {
  display: grid;
  gap: var(--space-4);
}

.skeleton-layout__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

@media (min-width: 900px) {
  .skeleton-layout__row {
    grid-template-columns: 1.1fr 1fr;
  }
}
</style>
