import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { DayPeriod, ViewMode } from '@/types'

export function useForecastControls(
  currentPeriod: MaybeRefOrGetter<DayPeriod | undefined>,
  resetKey: MaybeRefOrGetter<unknown>,
) {
  const mode = ref<ViewMode>('day')
  const chosenPeriod = ref<DayPeriod | null>(null)

  const period = computed<DayPeriod>({
    get: () => chosenPeriod.value ?? toValue(currentPeriod) ?? 'day',
    set: (value) => (chosenPeriod.value = value),
  })

  watch(
    () => toValue(resetKey),
    () => (chosenPeriod.value = null),
  )

  return { mode, period }
}
