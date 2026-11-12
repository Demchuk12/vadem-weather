<script setup lang="ts">
import { Chart } from 'chart.js'
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import {
  CHART_CSS_VARS,
  createTemperatureChartConfig,
  type TemperatureChartConfig,
} from '@/charts/temperature-chart.config'
import { useCssVars } from '@/composables/useCssVars'
import type { ChartModel } from '@/types'

const props = defineProps<{ model: ChartModel }>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const chart = shallowRef<Chart<'line' | 'bar', (number | null)[], string> | null>(null)
const palette = useCssVars(CHART_CSS_VARS)

const buildConfig = (): TemperatureChartConfig =>
  createTemperatureChartConfig(props.model, palette.value)

function update() {
  const instance = chart.value
  if (!instance) return
  const { data, options } = buildConfig()
  instance.data = data
  instance.options = options ?? {}
  instance.update()
}

onMounted(() => {
  if (canvas.value) chart.value = new Chart(canvas.value, buildConfig())
})
watch([() => props.model, palette], update, { deep: true })
onBeforeUnmount(() => chart.value?.destroy())
</script>

<template>
  <figure class="chart">
    <figcaption class="chart__title">{{ model.title }}</figcaption>
    <div class="chart__canvas">
      <canvas ref="canvas" role="img" :aria-label="model.title" />
    </div>
  </figure>
</template>

<style scoped>
.chart {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}

.chart__title {
  margin-bottom: var(--space-3);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted);
}

.chart__canvas {
  position: relative;
  height: 260px;
}

@media (max-width: 480px) {
  .chart {
    padding: var(--space-4) var(--space-2);
  }

  .chart__title {
    padding-inline: var(--space-2);
  }

  .chart__canvas {
    height: 220px;
  }
}
</style>
