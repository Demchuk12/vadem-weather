<script setup lang="ts">
import { computed } from 'vue'
import CityAutocomplete from './CityAutocomplete.vue'
import ForecastDays from './ForecastDays.vue'
import TemperatureChart from './TemperatureChart.vue'
import WeatherBlockSkeleton from './WeatherBlockSkeleton.vue'
import WeatherControls from './WeatherControls.vue'
import WeatherDetails from './WeatherDetails.vue'
import WeatherHero from './WeatherHero.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseState from '@/components/ui/BaseState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { useCityWeather } from '@/composables/useCityWeather'
import { useForecastControls } from '@/composables/useForecastControls'
import { useForecastView } from '@/composables/useForecastView'
import { useI18n } from '@/composables/useI18n'
import { useFavoritesStore } from '@/stores/favorites.store'
import type { City } from '@/types'
import { cityName, cityRegion, countryFlag } from '@/utils/city'
import { formatLocalTime } from '@/utils/time'

const props = withDefaults(
  defineProps<{
    city: City | null
    selectable?: boolean
    removable?: boolean
    detecting?: boolean
  }>(),
  { selectable: true, removable: false, detecting: false },
)

const emit = defineEmits<{ select: [city: City]; remove: [] }>()

const { t, locale } = useI18n()
const favorites = useFavoritesStore()

const { data, isLoading, error, refresh } = useCityWeather(() => props.city)
const { mode, period } = useForecastControls(
  () => data.value?.current.period,
  () => props.city?.id,
)
const { hero, days, chart } = useForecastView(data, mode, period)

const isFavorite = computed(() => !!props.city && favorites.isFavorite(props.city.id))

const updatedAt = computed(() =>
  data.value
    ? t('weather.updated', { time: formatLocalTime(data.value.fetchedAt, locale.value) })
    : '',
)

function toggleFavorite() {
  if (props.city) favorites.toggle(props.city)
}
</script>

<template>
  <article class="block" :class="{ 'is-favorite': isFavorite }">
    <header class="block__header">
      <div class="block__city" :class="{ 'block__city--search': selectable }">
        <CityAutocomplete v-if="selectable" :city="city" @select="emit('select', $event)" />
        <h2 v-else-if="city" class="block__title">
          <span aria-hidden="true">{{ countryFlag(city.country) }}</span>
          {{ cityName(city, locale) }}
          <small>{{ cityRegion(city) }}</small>
        </h2>
      </div>
      <div class="block__actions">
        <template v-if="city">
          <IconButton
            icon="refresh"
            :label="t('weather.refresh')"
            :spinning="isLoading"
            :disabled="isLoading"
            @click="refresh(true)"
          />
          <IconButton
            icon="star"
            tone="favorite"
            :filled="isFavorite"
            :pressed="isFavorite"
            :label="isFavorite ? t('favorites.remove') : t('favorites.add')"
            @click="toggleFavorite"
          />
        </template>
        <IconButton
          v-if="removable"
          icon="trash"
          tone="danger"
          :label="t('block.remove')"
          @click="emit('remove')"
        />
      </div>
    </header>

    <WeatherControls v-if="city" v-model:mode="mode" v-model:period="period" :caption="updatedAt" />

    <BaseState v-if="!city && detecting" :text="t('block.detecting')">
      <template #media><AppSpinner :size="28" /></template>
    </BaseState>

    <BaseState v-else-if="!city" icon="pin" :text="t('block.pickCity')" />

    <WeatherBlockSkeleton v-else-if="!data && isLoading" />

    <BaseState
      v-else-if="!data && error"
      icon="alert"
      tone="danger"
      :title="t('errors.title')"
      :text="t(`errors.${error}`)"
    >
      <BaseButton icon="refresh" :disabled="isLoading" @click="refresh(true)">
        {{ t('errors.retry') }}
      </BaseButton>
    </BaseState>

    <div v-else-if="data" class="block__content" :class="{ 'is-refreshing': isLoading }">
      <div class="block__row">
        <WeatherHero v-if="hero" :model="hero" />
        <BaseState v-else class="block__no-data" :text="t('weather.noPeriodData')" />
        <Transition name="swap" mode="out-in">
          <WeatherDetails
            v-if="mode === 'day'"
            key="details"
            :current="data.current"
            :timezone="data.timezone"
          />
          <ForecastDays v-else key="days" :days="days" />
        </Transition>
      </div>
      <TemperatureChart v-if="chart" :model="chart" />
    </div>
  </article>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: var(--surface);
  backdrop-filter: blur(20px) saturate(1.2);
  box-shadow:
    var(--shadow-md),
    0 0 0 1px var(--border);
  transition: box-shadow var(--duration) var(--ease);
}

.block.is-favorite {
  box-shadow:
    var(--shadow-md),
    0 0 0 2px color-mix(in srgb, var(--favorite) 70%, transparent);
}

.block__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.block__city {
  flex: 1;
  min-width: 0;
  max-width: 440px;
}

.block__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.block__title small {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.block__actions {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}

.block__content {
  display: grid;
  gap: var(--space-4);
  transition: opacity var(--duration) var(--ease);
}

.block__content.is-refreshing {
  opacity: 0.6;
}

.block__row {
  display: grid;
  gap: var(--space-4);
}

.block__no-data {
  border-radius: var(--radius-lg);
  background: var(--surface-2);
}

@media (min-width: 900px) {
  .block__row {
    grid-template-columns: 1.1fr 1fr;
  }
}

@media (max-width: 600px) {
  .block {
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
  }

  .block__header {
    flex-wrap: wrap;
  }

  .block__city--search {
    flex-basis: 100%;
    max-width: none;
    order: 2;
  }
}
</style>
