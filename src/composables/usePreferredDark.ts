import { onScopeDispose, ref } from 'vue'

export function usePreferredDark() {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const isDark = ref(query.matches)
  const update = (event: MediaQueryListEvent) => (isDark.value = event.matches)

  query.addEventListener('change', update)
  onScopeDispose(() => query.removeEventListener('change', update))

  return isDark
}
