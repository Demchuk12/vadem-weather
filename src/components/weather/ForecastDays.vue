<script setup lang="ts">
import { computed } from 'vue'
import WeatherIcon from './WeatherIcon.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useI18n } from '@/composables/useI18n'
import type { DayRowModel } from '@/types'
import { MIN_VISIBLE_PRECIPITATION } from '@/constants'
import { capitalize, formatTemp, toPercent } from '@/utils/format'

const props = defineProps<{ days: DayRowModel[] }>()

const { t } = useI18n()

const bounds = computed(() => ({
  min: Math.min(...props.days.map((d) => d.min)),
  max: Math.max(...props.days.map((d) => d.max)),
}))

function rangeStyle(day: DayRowModel) {
  const span = bounds.value.max - bounds.value.min || 1
  return {
    left: `${((day.min - bounds.value.min) / span) * 100}%`,
    right: `${((bounds.value.max - day.max) / span) * 100}%`,
  }
}
</script>

<template>
  <ul class="days">
    <li
      v-for="(day, index) in days"
      :key="day.date"
      class="day"
      :class="{ 'is-today': day.isToday }"
      :style="{ '--i': index }"
    >
      <span class="day__name">
        <strong>{{ day.weekday }}</strong>
        <small>{{ day.dateLabel }}</small>
      </span>
      <span class="day__icon" :title="capitalize(day.condition.description)">
        <WeatherIcon
          :group="day.condition.group"
          :period="day.period"
          :size="36"
          :animated="false"
        />
      </span>
      <span class="day__pop tabular" :class="{ 'is-hidden': day.pop < MIN_VISIBLE_PRECIPITATION }">
        <BaseIcon name="umbrella" :size="14" />{{ toPercent(day.pop) }}%
      </span>
      <span class="day__range tabular">
        <span class="day__min">{{ formatTemp(day.min) }}</span>
        <span class="day__bar"><span class="day__fill" :style="rangeStyle(day)" /></span>
        <span class="day__max">{{ formatTemp(day.max) }}</span>
      </span>
      <span
        class="day__temp tabular"
        :title="t(day.period === 'day' ? 'weather.dayAvg' : 'weather.nightAvg')"
      >
        {{ day.temp === null ? '—' : formatTemp(day.temp) }}
      </span>
    </li>
  </ul>
</template>

<style scoped>
.days {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}

.day {
  animation: slide-in 520ms var(--ease) both;
  animation-delay: calc(var(--i) * 60ms + 100ms);
  display: grid;
  grid-template-columns: minmax(72px, 1.1fr) 40px 52px minmax(110px, 2fr) 52px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--duration) var(--ease);
}

.day:hover,
.day.is-today {
  background: var(--surface-solid);
}

.day__name {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.day__name small {
  font-size: 12px;
  color: var(--text-muted);
}

.day__pop {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--precip);
}

.day__pop.is-hidden {
  visibility: hidden;
}

.day__range {
  display: grid;
  grid-template-columns: 38px 1fr 38px;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  font-weight: 600;
}

.day__min {
  color: var(--text-muted);
  text-align: right;
}

.day__bar {
  position: relative;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
}

.day__fill {
  transform-origin: left center;
  animation: grow 800ms var(--ease) both;
  animation-delay: calc(var(--i) * 60ms + 260ms);
  transition:
    left 500ms var(--ease),
    right 500ms var(--ease);
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--temp-cold), var(--temp-warm));
}

.day__temp {
  justify-self: end;
  font-size: 17px;
  font-weight: 800;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}

@media (max-width: 480px) {
  .day {
    grid-template-columns: 70px 30px minmax(0, 1fr) 40px;
    gap: 6px;
    padding-inline: var(--space-2);
  }

  .day__name strong {
    font-size: 14px;
  }

  .day__icon :deep(svg) {
    width: 30px;
    height: 30px;
  }

  .day__temp {
    font-size: 15px;
  }

  .day__pop {
    display: none;
  }

  .day__range {
    grid-template-columns: 28px 1fr 28px;
    gap: 6px;
    font-size: 12px;
  }
}
</style>
