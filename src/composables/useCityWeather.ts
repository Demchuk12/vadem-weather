import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useI18n } from './useI18n'
import { useWeatherStore } from '@/stores/weather.store'
import type { City } from '@/types'

export function useCityWeather(city: MaybeRefOrGetter<City | null>) {
  const store = useWeatherStore()
  const { locale } = useI18n()

  const entry = computed(() => {
    const value = toValue(city)
    return value ? store.getEntry(value.id, locale.value) : undefined
  })

  const data = computed(() => entry.value?.data ?? null)
  const isLoading = computed(() => entry.value?.status === 'loading')
  const error = computed(() => (entry.value?.status === 'error' ? entry.value.error : null))

  function refresh(force = false) {
    const value = toValue(city)
    if (value) return store.load(value, locale.value, { force })
  }

  watch([() => toValue(city)?.id, locale], () => refresh(), { immediate: true })

  return { data, isLoading, error, refresh }
}
