import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { ApiError, openWeatherApi } from '@/api'
import { AUTOCOMPLETE_DEBOUNCE_MS } from '@/constants'
import { useCitySearch } from '@/composables/useCitySearch'
import { GEO_KYIV, GEO_LVIV } from '../fixtures/openweather'

function setup() {
  const scope = effectScope()
  const search = scope.run(useCitySearch)!
  return { ...search, stop: () => scope.stop() }
}

const flush = async () => {
  await vi.advanceTimersByTimeAsync(AUTOCOMPLETE_DEBOUNCE_MS)
}

describe('useCitySearch', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('asks for more letters until the term is long enough', () => {
    const spy = vi.spyOn(openWeatherApi, 'searchCities')
    const { status, search } = setup()
    search('K')
    expect(status.value).toBe('hint')
    expect(spy).not.toHaveBeenCalled()
  })

  it('debounces typing into a single request', async () => {
    const spy = vi.spyOn(openWeatherApi, 'searchCities').mockResolvedValue([GEO_KYIV])
    const { status, results, search } = setup()

    search('Ky')
    search('Kyi')
    search('Kyiv ')
    expect(status.value).toBe('loading')
    await flush()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('Kyiv', expect.any(Number), expect.any(AbortSignal))
    expect(status.value).toBe('results')
    expect(results.value.map((city) => city.name)).toEqual(['Kyiv'])
  })

  it('reports an empty result', async () => {
    vi.spyOn(openWeatherApi, 'searchCities').mockResolvedValue([])
    const { status, search } = setup()
    search('Atlantis')
    await flush()
    expect(status.value).toBe('empty')
  })

  it('reports a failed search', async () => {
    vi.spyOn(openWeatherApi, 'searchCities').mockRejectedValue(new ApiError('server', 'down', 500))
    const { status, search } = setup()
    search('Kyiv')
    await flush()
    expect(status.value).toBe('error')
  })

  it('aborts an outdated request so a late response is ignored', async () => {
    const signals: AbortSignal[] = []
    vi.spyOn(openWeatherApi, 'searchCities').mockImplementation((query, _limit, signal) => {
      signals.push(signal!)
      return new Promise((resolve, reject) => {
        signal!.addEventListener('abort', () => reject(new ApiError('aborted', 'aborted')))
        setTimeout(() => resolve(query === 'Kyiv' ? [GEO_KYIV] : [GEO_LVIV]), 1000)
      })
    })
    const { results, search } = setup()

    search('Kyiv')
    await flush()
    search('Lviv')
    await flush()
    await vi.advanceTimersByTimeAsync(1000)

    expect(signals[0]?.aborted).toBe(true)
    expect(results.value.map((city) => city.name)).toEqual(['Lviv'])
  })

  it('resets the state', async () => {
    vi.spyOn(openWeatherApi, 'searchCities').mockResolvedValue([GEO_KYIV])
    const { status, results, search, reset } = setup()
    search('Kyiv')
    await flush()
    reset()
    expect(results.value).toEqual([])
    expect(status.value).toBe('hint')
  })

  it('shows the hint again after the term becomes too short', async () => {
    vi.spyOn(openWeatherApi, 'searchCities').mockResolvedValue([])
    const { status, search } = setup()
    search('Atlantis')
    await flush()
    search('A')
    expect(status.value).toBe('hint')
  })
})
