import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useForecastControls } from '@/composables/useForecastControls'
import type { DayPeriod } from '@/types'

describe('useForecastControls', () => {
  it('starts in day mode with the current period of the city', () => {
    const { mode, period } = useForecastControls(() => 'night', 'kyiv')
    expect(mode.value).toBe('day')
    expect(period.value).toBe('night')
  })

  it('defaults to day while weather is unknown', () => {
    expect(useForecastControls(() => undefined, 'kyiv').period.value).toBe('day')
  })

  it('follows the city until the user chooses a period', () => {
    const current = ref<DayPeriod>('day')
    const { period } = useForecastControls(current, 'kyiv')

    current.value = 'night'
    expect(period.value).toBe('night')

    period.value = 'day'
    current.value = 'night'
    expect(period.value).toBe('day')
  })

  it('resets the manual choice when the city changes', async () => {
    const city = ref('kyiv')
    const { period } = useForecastControls(() => 'night', city)
    period.value = 'day'

    city.value = 'lviv'
    await nextTick()
    expect(period.value).toBe('night')
  })
})
