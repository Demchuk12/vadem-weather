import { storeToRefs } from 'pinia'
import { translate, type MessageKey, type MessageParams } from '@/i18n'
import { useSettingsStore } from '@/stores/settings.store'

export function useI18n() {
  const { locale } = storeToRefs(useSettingsStore())
  const t = (key: MessageKey, params?: MessageParams) => translate(locale.value, key, params)
  return { t, locale }
}
