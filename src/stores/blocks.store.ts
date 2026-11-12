import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { MAX_BLOCKS, STORAGE_KEYS } from '@/constants'
import { detectUserCity } from '@/services/location.service'
import type { City } from '@/types'
import { isCity } from '@/utils/city'
import { readStorage, writeStorage } from '@/utils/storage'

export interface WeatherBlockModel {
  id: string
  city: City | null
}

const createBlock = (city: City | null = null): WeatherBlockModel => ({
  id: crypto.randomUUID(),
  city,
})

const isBlockList = (value: unknown): value is WeatherBlockModel[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      (item.city === null || isCity(item.city)),
  )

export const useBlocksStore = defineStore('blocks', () => {
  const blocks = ref<WeatherBlockModel[]>(
    (readStorage(STORAGE_KEYS.blocks, isBlockList) ?? [createBlock()]).slice(0, MAX_BLOCKS),
  )
  const isDetecting = ref(false)

  const canAdd = computed(() => blocks.value.length < MAX_BLOCKS)
  const canRemove = computed(() => blocks.value.length > 1)

  watch(blocks, (value) => writeStorage(STORAGE_KEYS.blocks, value), { deep: true })

  function add() {
    if (canAdd.value) blocks.value.push(createBlock())
  }

  function remove(id: string) {
    if (canRemove.value) blocks.value = blocks.value.filter((block) => block.id !== id)
  }

  function setCity(id: string, city: City) {
    const block = blocks.value.find((item) => item.id === id)
    if (block) block.city = city
  }

  async function detectDefaultCity() {
    const first = blocks.value[0]
    if (!first || first.city || isDetecting.value) return
    isDetecting.value = true
    try {
      const city = await detectUserCity()
      if (!first.city) setCity(first.id, city)
    } finally {
      isDetecting.value = false
    }
  }

  return { blocks, isDetecting, canAdd, canRemove, add, remove, setCity, detectDefaultCity }
})
