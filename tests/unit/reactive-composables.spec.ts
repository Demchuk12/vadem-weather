import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { useCityWeather } from '@/composables/useCityWeather'
import { usePreferredDark } from '@/composables/usePreferredDark'
import { fetchWeatherBundle } from '@/services/weather.service'
import { useSettingsStore } from '@/stores/settings.store'
import type { City, WeatherBundle } from '@/types'
import { seededRandom } from '@/utils/random'
import { KYIV, LVIV } from './helpers'

vi.mock('@/services/weather.service', () => ({ fetchWeatherBundle: vi.fn() }))

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>()
  vi.spyOn(window, 'matchMedia').mockImplementation(
    () =>
      ({
        matches,
        addEventListener: (_: string, fn: (event: { matches: boolean }) => void) =>
          listeners.add(fn),
        removeEventListener: (_: string, fn: (event: { matches: boolean }) => void) =>
          listeners.delete(fn),
      }) as unknown as MediaQueryList,
  )
  return { emit: (value: boolean) => listeners.forEach((fn) => fn({ matches: value })), listeners }
}

describe('useCityWeather', () => {
  beforeEach(() => {
    vi.mocked(fetchWeatherBundle).mockReset()
    vi.mocked(fetchWeatherBundle).mockImplementation(
      async () => ({ fetchedAt: Date.now() }) as WeatherBundle,
    )
  })

  it('loads weather for the city and reloads on city or language change', async () => {
    const city = ref<City | null>(KYIV)
    const settings = useSettingsStore()
    settings.setLocale('uk')
    const { data } = effectScope().run(() => useCityWeather(city))!

    await vi.waitFor(() => expect(data.value).not.toBeNull())
    expect(fetchWeatherBundle).toHaveBeenLastCalledWith(KYIV, 'uk')

    city.value = LVIV
    await nextTick()
    expect(fetchWeatherBundle).toHaveBeenLastCalledWith(LVIV, 'uk')

    settings.setLocale('en')
    await nextTick()
    expect(fetchWeatherBundle).toHaveBeenLastCalledWith(LVIV, 'en')
  })

  it('does nothing without a city and refreshes on demand', async () => {
    const city = ref<City | null>(null)
    const { refresh, isLoading, data } = effectScope().run(() => useCityWeather(city))!
    expect(fetchWeatherBundle).not.toHaveBeenCalled()
    expect(isLoading.value).toBe(false)

    city.value = KYIV
    await vi.waitFor(() => expect(data.value).not.toBeNull())
    await refresh()
    expect(fetchWeatherBundle).toHaveBeenCalledTimes(1)
    await refresh(true)
    expect(fetchWeatherBundle).toHaveBeenCalledTimes(2)
  })

  it('exposes the error code', async () => {
    vi.mocked(fetchWeatherBundle).mockRejectedValue(new Error('offline'))
    const { error } = effectScope().run(() => useCityWeather(ref(KYIV)))!
    await vi.waitFor(() => expect(error.value).toBe('network'))
  })
})

describe('usePreferredDark', () => {
  afterEach(() => vi.restoreAllMocks())

  it('tracks the system color scheme and cleans up', () => {
    const media = mockMatchMedia(false)
    const scope = effectScope()
    const isDark = scope.run(usePreferredDark)!
    expect(isDark.value).toBe(false)

    media.emit(true)
    expect(isDark.value).toBe(true)

    scope.stop()
    expect(media.listeners.size).toBe(0)
  })
})

describe('useAnimatedNumber', () => {
  afterEach(() => vi.useRealTimers())

  it('animates towards the target', async () => {
    mockMatchMedia(false)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    const target = ref(10)
    const value = effectScope().run(() => useAnimatedNumber(target, 100))!

    vi.advanceTimersByTime(50)
    expect(value.value).toBeGreaterThan(0)
    expect(value.value).toBeLessThan(10)
    vi.advanceTimersByTime(100)
    expect(value.value).toBe(10)

    target.value = -5
    await nextTick()
    vi.advanceTimersByTime(200)
    expect(value.value).toBe(-5)
  })

  it('jumps to the value when reduced motion is preferred', () => {
    mockMatchMedia(true)
    const value = effectScope().run(() => useAnimatedNumber(ref(7)))!
    expect(value.value).toBe(7)
  })
})

describe('seededRandom', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = seededRandom(1)
    const b = seededRandom(1)
    const values = Array.from({ length: 50 }, () => a())
    expect(values).toEqual(Array.from({ length: 50 }, () => b()))
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true)
  })
})
