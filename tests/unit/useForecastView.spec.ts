import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useForecastView } from '@/composables/useForecastView'
import { HOURLY_SAMPLES } from '@/constants'
import { fetchWeatherBundle } from '@/services/weather.service'
import { useSettingsStore } from '@/stores/settings.store'
import type { DayPeriod, ViewMode, WeatherBundle } from '@/types'
import { currentDto, forecastDto } from '../fixtures/openweather'
import { jsonResponse, mockFetch } from './helpers'

const NOON_IN_KYIV = Date.UTC(2026, 10, 12, 10, 0, 0) / 1000

async function loadBundle(): Promise<WeatherBundle> {
  mockFetch((url) =>
    jsonResponse(
      url.pathname.endsWith('/forecast')
        ? forecastDto({ now: NOON_IN_KYIV })
        : currentDto({ now: NOON_IN_KYIV, temp: 9, pod: 'd' }),
    ),
  )
  return fetchWeatherBundle({ lat: 50.45, lon: 30.52 }, 'uk')
}

describe('useForecastView', () => {
  let bundle: WeatherBundle

  beforeEach(async () => {
    useSettingsStore().setLocale('uk')
    bundle = await loadBundle()
  })

  function setup(mode: ViewMode = 'day', period: DayPeriod = 'day') {
    const modeRef = ref(mode)
    const periodRef = ref(period)
    return { ...useForecastView(ref(bundle), modeRef, periodRef), modeRef, periodRef }
  }

  it('returns nothing without data', () => {
    const view = useForecastView(ref(null), ref('day'), ref('day'))
    expect(view.hero.value).toBeNull()
    expect(view.chart.value).toBeNull()
    expect(view.days.value).toEqual([])
  })

  it('shows the current weather when the period matches the city time', () => {
    const { hero } = setup('day', 'day')
    expect(hero.value).toMatchObject({ label: 'Зараз', temp: 9, period: 'day' })
    expect(hero.value?.dateLabel).toMatch(/^Четвер/)
  })

  it('summarises the upcoming night when night is selected during the day', () => {
    const { hero } = setup('day', 'night')
    expect(hero.value?.label).toBe('Сьогодні вночі')
    expect(hero.value?.period).toBe('night')
    expect(hero.value?.feelsLike).not.toBeNull()
  })

  it('builds the hourly chart with "now" and highlighted period points', () => {
    const { chart } = setup('day', 'night')
    expect(chart.value?.labels).toHaveLength(HOURLY_SAMPLES)
    expect(chart.value?.labels[0]).toBe('Зараз')
    expect(chart.value?.emphasis?.[0]).toBe(false)
    expect(chart.value?.emphasis).toContain(true)
    expect(chart.value?.precipitation?.values.every((v) => v >= 0 && v <= 100)).toBe(true)
  })

  it('builds the 5 day chart with averages for the selected period', () => {
    const { chart, periodRef } = setup('week', 'day')
    expect(chart.value?.labels[0]).toBe('Сьогодні')
    expect(chart.value?.primary.values).toEqual(bundle.daily.map((d) => d.tempAvg))
    expect(chart.value?.secondary?.label).toBe('Вдень, сер.')

    periodRef.value = 'night'
    expect(chart.value?.secondary?.label).toBe('Вночі, сер.')
  })

  it('builds day rows with the temperature of the selected period', () => {
    const { days } = setup('week', 'night')
    expect(days.value).toHaveLength(bundle.daily.length)
    expect(days.value[0]).toMatchObject({ weekday: 'Сьогодні', isToday: true, period: 'night' })
    expect(days.value[1]?.temp).toBe(bundle.daily[1]?.night?.tempAvg)
  })

  it('reacts to the language', () => {
    const { hero } = setup()
    useSettingsStore().setLocale('en')
    expect(hero.value?.label).toBe('Now')
  })
})
