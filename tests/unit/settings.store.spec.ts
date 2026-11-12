import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import { useSettingsStore } from '@/stores/settings.store'

describe('settings store', () => {
  it('uses the browser language by default', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
    expect(useSettingsStore().locale).toBe('en')
  })

  it('restores and persists the locale', async () => {
    localStorage.setItem(STORAGE_KEYS.locale, 'en')
    const store = useSettingsStore()
    expect(store.locale).toBe('en')

    store.setLocale('uk')
    await nextTick()
    expect(localStorage.getItem(STORAGE_KEYS.locale)).toBe('uk')
  })

  it('follows the system theme until the user picks one', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('system')
    expect(store.resolvedTheme).toBe('light')
  })

  it('toggles and persists the theme', () => {
    const store = useSettingsStore()
    store.toggleTheme()
    expect(store.resolvedTheme).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark')
    store.toggleTheme()
    expect(store.resolvedTheme).toBe('light')
  })

  it('ignores an invalid saved theme', () => {
    localStorage.setItem(STORAGE_KEYS.theme, 'neon')
    expect(useSettingsStore().theme).toBe('system')
  })
})
