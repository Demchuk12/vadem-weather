import { ref, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'

export function useCssVars<K extends string>(names: readonly K[]): Ref<Record<K, string>> {
  const { resolvedTheme } = storeToRefs(useSettingsStore())
  const values = ref({}) as Ref<Record<K, string>>

  const read = () => {
    const styles = getComputedStyle(document.documentElement)
    values.value = Object.fromEntries(
      names.map((name) => [name, styles.getPropertyValue(`--${name}`).trim()]),
    ) as Record<K, string>
  }

  watch(resolvedTheme, read, { immediate: true, flush: 'post' })
  return values
}
