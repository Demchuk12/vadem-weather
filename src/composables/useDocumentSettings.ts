import { storeToRefs } from 'pinia'
import { watchEffect } from 'vue'
import { useI18n } from './useI18n'
import { useSettingsStore } from '@/stores/settings.store'

export function useDocumentSettings() {
  const { resolvedTheme } = storeToRefs(useSettingsStore())
  const { t, locale } = useI18n()

  watchEffect(() => {
    const root = document.documentElement
    root.lang = locale.value
    root.dataset.theme = resolvedTheme.value
    document.title = `${t('app.title')} — ${t('app.tagline')}`
  })
}
