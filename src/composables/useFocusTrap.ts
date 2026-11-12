import { nextTick, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

const FOCUSABLE = 'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(
  container: Readonly<Ref<HTMLElement | null>>,
  active: MaybeRefOrGetter<boolean>,
) {
  let returnFocusTo: HTMLElement | null = null

  watch(
    () => toValue(active),
    async (isActive) => {
      if (!isActive) {
        returnFocusTo?.focus()
        returnFocusTo = null
        return
      }
      returnFocusTo = document.activeElement as HTMLElement | null
      await nextTick()
      const root = container.value
      const target =
        root?.querySelector<HTMLElement>('[data-autofocus]') ??
        root?.querySelector<HTMLElement>(FOCUSABLE)
      target?.focus()
    },
  )

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !container.value) return
    const items = [...container.value.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const last = items.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return { onKeydown }
}
