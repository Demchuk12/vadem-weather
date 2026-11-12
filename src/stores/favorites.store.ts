import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { MAX_FAVORITES, STORAGE_KEYS } from '@/constants'
import type { City } from '@/types'
import { isCity } from '@/utils/city'
import { readStorage, writeStorage } from '@/utils/storage'

const isCityList = (value: unknown): value is City[] => Array.isArray(value) && value.every(isCity)

export const useFavoritesStore = defineStore('favorites', () => {
  const cities = ref<City[]>(
    (readStorage(STORAGE_KEYS.favorites, isCityList) ?? []).slice(0, MAX_FAVORITES),
  )
  const pendingCity = ref<City | null>(null)

  const count = computed(() => cities.value.length)
  const isFull = computed(() => cities.value.length >= MAX_FAVORITES)

  watch(cities, (value) => writeStorage(STORAGE_KEYS.favorites, value), { deep: true })

  function isFavorite(cityId: string): boolean {
    return cities.value.some((city) => city.id === cityId)
  }

  function add(city: City): boolean {
    if (isFavorite(city.id)) return true
    if (isFull.value) return false
    cities.value.push(city)
    return true
  }

  function remove(cityId: string) {
    cities.value = cities.value.filter((city) => city.id !== cityId)
  }

  function toggle(city: City) {
    if (isFavorite(city.id)) remove(city.id)
    else if (!add(city)) pendingCity.value = city
  }

  function replaceWithPending(cityId: string) {
    remove(cityId)
    if (pendingCity.value) add(pendingCity.value)
    pendingCity.value = null
  }

  function cancelPending() {
    pendingCity.value = null
  }

  return {
    cities,
    pendingCity,
    count,
    isFull,
    isFavorite,
    add,
    remove,
    toggle,
    replaceWithPending,
    cancelPending,
  }
})
