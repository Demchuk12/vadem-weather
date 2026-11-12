<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import type { IconName } from '@/components/ui/icons'
import { useI18n } from '@/composables/useI18n'
import type { CurrentWeather } from '@/types'
import { compassPoint, round } from '@/utils/format'
import { formatTime } from '@/utils/time'

const props = defineProps<{ current: CurrentWeather; timezone: number }>()

const { t, locale } = useI18n()

interface Metric {
  key: string
  icon: IconName
  label: string
  value: string
  unit?: string
}

const metrics = computed<Metric[]>(() => {
  const c = props.current
  return [
    {
      key: 'humidity',
      icon: 'droplet',
      label: t('weather.humidity'),
      value: `${c.humidity}`,
      unit: '%',
    },
    {
      key: 'wind',
      icon: 'wind',
      label: t('weather.wind'),
      value: `${Math.round(c.windSpeed)}`,
      unit: `${t('weather.units.ms')} · ${t(`wind.${compassPoint(c.windDeg)}`)}`,
    },
    {
      key: 'pressure',
      icon: 'gauge',
      label: t('weather.pressure'),
      value: `${c.pressure}`,
      unit: t('weather.units.hpa'),
    },
    {
      key: 'visibility',
      icon: 'eye',
      label: t('weather.visibility'),
      value: c.visibility === null ? '—' : `${round(c.visibility / 1000)}`,
      unit: c.visibility === null ? undefined : t('weather.units.km'),
    },
    {
      key: 'sunrise',
      icon: 'sunrise',
      label: t('weather.sunrise'),
      value: formatTime(c.sunrise, props.timezone, locale.value),
    },
    {
      key: 'sunset',
      icon: 'sunset',
      label: t('weather.sunset'),
      value: formatTime(c.sunset, props.timezone, locale.value),
    },
  ]
})
</script>

<template>
  <ul class="details">
    <li
      v-for="(metric, index) in metrics"
      :key="metric.key"
      class="details__item"
      :style="{ '--i': index }"
    >
      <span class="details__icon"><BaseIcon :name="metric.icon" :size="18" /></span>
      <span class="details__label">{{ metric.label }}</span>
      <span class="details__value tabular">
        {{ metric.value }}<small v-if="metric.unit"> {{ metric.unit }}</small>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.details__item {
  animation: rise 520ms var(--ease) both;
  animation-delay: calc(var(--i) * 55ms + 120ms);
  transition:
    transform var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease);
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: var(--space-3);
  align-items: center;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}

.details__item:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px var(--border-strong),
    var(--shadow-md);
}

.details__item:hover .details__icon {
  transform: scale(1.08) rotate(-6deg);
}

.details__icon {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  color: var(--accent);
}

.details__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.details__value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.details__value small {
  font-size: 13px;
  white-space: nowrap;
  font-weight: 600;
  color: var(--text-muted);
}
</style>
