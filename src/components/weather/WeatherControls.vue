<script setup lang="ts">
import { computed } from 'vue'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import { useI18n } from '@/composables/useI18n'
import type { DayPeriod, ViewMode } from '@/types'

defineProps<{ caption?: string }>()
const mode = defineModel<ViewMode>('mode', { required: true })
const period = defineModel<DayPeriod>('period', { required: true })

const { t } = useI18n()

const modeOptions = computed<SegmentOption<ViewMode>[]>(() => [
  { value: 'day', label: t('view.day') },
  { value: 'week', label: t('view.week') },
])

const periodOptions = computed<SegmentOption<DayPeriod>[]>(() => [
  { value: 'day', label: t('view.periodDay'), icon: 'sun' },
  { value: 'night', label: t('view.periodNight'), icon: 'moon' },
])
</script>

<template>
  <div class="controls">
    <SegmentedControl v-model="mode" :options="modeOptions" :label="t('view.modeLabel')" />
    <SegmentedControl v-model="period" :options="periodOptions" :label="t('view.periodLabel')" />
    <span v-if="caption" class="controls__caption">{{ caption }}</span>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.controls__caption {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-subtle);
}

@media (max-width: 600px) {
  .controls :deep(.segmented) {
    flex: 1;
  }

  .controls__caption {
    flex-basis: 100%;
    margin-left: 0;
  }
}
</style>
