import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { MAX_FAVORITES, STORAGE_KEYS } from '@/constants'
import { useFavoritesStore } from '@/stores/favorites.store'
import { KYIV, LVIV, makeCity } from './helpers'

const fillFavorites = () => {
  const store = useFavoritesStore()
  for (let i = 1; i <= MAX_FAVORITES; i++) store.add(makeCity(i))
  return store
}

describe('favorites store', () => {
  it('adds, checks and removes cities', () => {
    const store = useFavoritesStore()
    expect(store.add(KYIV)).toBe(true)
    expect(store.isFavorite(KYIV.id)).toBe(true)
    store.remove(KYIV.id)
    expect(store.isFavorite(KYIV.id)).toBe(false)
  })

  it('does not duplicate a city', () => {
    const store = useFavoritesStore()
    store.add(KYIV)
    store.add(KYIV)
    expect(store.count).toBe(1)
  })

  it('persists to localStorage', async () => {
    useFavoritesStore().add(LVIV)
    await nextTick()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)!)).toEqual([LVIV])
  })

  it('restores saved cities', () => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([KYIV, LVIV]))
    expect(useFavoritesStore().cities).toEqual([KYIV, LVIV])
  })

  it('ignores broken saved data', () => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([KYIV, { name: 'broken' }]))
    expect(useFavoritesStore().cities).toEqual([])
  })

  it(`keeps at most ${MAX_FAVORITES} saved cities`, () => {
    const saved = Array.from({ length: MAX_FAVORITES + 2 }, (_, i) => makeCity(i))
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(saved))
    expect(useFavoritesStore().count).toBe(MAX_FAVORITES)
  })

  it(`refuses to add more than ${MAX_FAVORITES} cities`, () => {
    const store = fillFavorites()
    expect(store.isFull).toBe(true)
    expect(store.add(KYIV)).toBe(false)
    expect(store.count).toBe(MAX_FAVORITES)
  })

  it('toggles a city', () => {
    const store = useFavoritesStore()
    store.toggle(KYIV)
    expect(store.isFavorite(KYIV.id)).toBe(true)
    store.toggle(KYIV)
    expect(store.isFavorite(KYIV.id)).toBe(false)
  })

  it('keeps the city as pending when the limit is reached', () => {
    const store = fillFavorites()
    store.toggle(KYIV)
    expect(store.pendingCity).toEqual(KYIV)
    expect(store.isFavorite(KYIV.id)).toBe(false)
  })

  it('replaces a chosen city with the pending one', () => {
    const store = fillFavorites()
    store.toggle(KYIV)
    store.replaceWithPending(makeCity(2).id)

    expect(store.pendingCity).toBeNull()
    expect(store.isFavorite(KYIV.id)).toBe(true)
    expect(store.isFavorite(makeCity(2).id)).toBe(false)
    expect(store.count).toBe(MAX_FAVORITES)
  })

  it('cancels the pending city', () => {
    const store = fillFavorites()
    store.toggle(KYIV)
    store.cancelPending()
    expect(store.pendingCity).toBeNull()
    expect(store.isFavorite(KYIV.id)).toBe(false)
  })
})
