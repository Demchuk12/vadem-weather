import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { usePreferredDark } from '@/composables/usePreferredDark'
import { STORAGE_KEYS } from '@/constants'
import { detectBrowserLocale, SUPPORTED_LOCALES } from '@/i18n'
import type { Locale, ResolvedTheme, ThemePreference } from '@/types'
import { readStorageString, writeStorageString } from '@/utils/storage'

const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system']

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<Locale>(
    readStorageString(STORAGE_KEYS.locale, SUPPORTED_LOCALES) ?? detectBrowserLocale(),
  )
  const theme = ref<ThemePreference>(readStorageString(STORAGE_KEYS.theme, THEMES) ?? 'system')
  const systemPrefersDark = usePreferredDark()

  const resolvedTheme = computed<ResolvedTheme>(() =>
    theme.value === 'system' ? (systemPrefersDark.value ? 'dark' : 'light') : theme.value,
  )

  watch(locale, (value) => writeStorageString(STORAGE_KEYS.locale, value))

  function setLocale(value: Locale) {
    locale.value = value
  }

  function toggleTheme() {
    theme.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
    writeStorageString(STORAGE_KEYS.theme, theme.value)
  }

  return { locale, theme, resolvedTheme, setLocale, toggleTheme }
})
