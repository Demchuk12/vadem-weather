import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'

export function useScrollLock(locked: MaybeRefOrGetter<boolean>) {
  const apply = (value: boolean) => (document.body.style.overflow = value ? 'hidden' : '')

  watch(() => toValue(locked), apply, { immediate: true })
  onScopeDispose(() => apply(false))
}
