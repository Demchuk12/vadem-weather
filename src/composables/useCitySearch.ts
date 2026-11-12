import { computed, onScopeDispose, ref, shallowRef } from 'vue'
import { isAbortError, openWeatherApi } from '@/api'
import { AUTOCOMPLETE_DEBOUNCE_MS, AUTOCOMPLETE_LIMIT, AUTOCOMPLETE_MIN_CHARS } from '@/constants'
import type { City } from '@/types'
import { cityFromGeo, uniqueCities } from '@/utils/city'
import { useDebounceFn } from './useDebounceFn'

export type CitySearchStatus = 'hint' | 'loading' | 'error' | 'empty' | 'results'

export function useCitySearch() {
  const results = shallowRef<City[]>([])
  const term = ref('')
  const isLoading = ref(false)
  const hasError = ref(false)
  let controller: AbortController | null = null

  const status = computed<CitySearchStatus>(() => {
    if (term.value.length < AUTOCOMPLETE_MIN_CHARS) return 'hint'
    if (isLoading.value) return 'loading'
    if (hasError.value) return 'error'
    return results.value.length ? 'results' : 'empty'
  })

  async function run(text: string) {
    controller?.abort()
    controller = new AbortController()
    try {
      const found = await openWeatherApi.searchCities(text, AUTOCOMPLETE_LIMIT, controller.signal)
      results.value = uniqueCities(found.map(cityFromGeo))
      hasError.value = false
      isLoading.value = false
    } catch (error) {
      if (isAbortError(error)) return
      results.value = []
      hasError.value = true
      isLoading.value = false
    }
  }

  const debouncedRun = useDebounceFn(run, AUTOCOMPLETE_DEBOUNCE_MS)

  function search(text: string) {
    const value = text.trim()
    if (value.length < AUTOCOMPLETE_MIN_CHARS) return reset()
    term.value = value
    isLoading.value = true
    debouncedRun(term.value)
  }

  function reset() {
    term.value = ''
    debouncedRun.cancel()
    controller?.abort()
    results.value = []
    isLoading.value = false
    hasError.value = false
  }

  onScopeDispose(() => controller?.abort())

  return { results, status, isLoading, search, reset }
}
