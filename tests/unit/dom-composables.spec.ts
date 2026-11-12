import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, effectScope, h, nextTick, ref, shallowRef } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import { useDocumentSettings } from '@/composables/useDocumentSettings'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useScrollLock } from '@/composables/useScrollLock'
import { useSettingsStore } from '@/stores/settings.store'

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('useScrollLock', () => {
  it('locks body scroll while active and unlocks on dispose', async () => {
    const locked = ref(true)
    const scope = effectScope()
    scope.run(() => useScrollLock(locked))
    expect(document.body.style.overflow).toBe('hidden')

    locked.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('')

    locked.value = true
    await nextTick()
    scope.stop()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('useFocusTrap', () => {
  function setup() {
    document.body.innerHTML = `
      <button id="opener">open</button>
      <div id="dialog"><button id="first">a</button><button id="auto" data-autofocus>b</button><button id="last">c</button></div>`
    const container = shallowRef(document.getElementById('dialog'))
    const active = ref(false)
    const scope = effectScope()
    const trap = scope.run(() => useFocusTrap(container, active))!
    return { active, trap, byId: (id: string) => document.getElementById(id)! }
  }

  it('focuses the autofocus element and restores focus on close', async () => {
    const { active, byId } = setup()
    byId('opener').focus()

    active.value = true
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(byId('auto'))

    active.value = false
    await nextTick()
    expect(document.activeElement).toBe(byId('opener'))
  })

  it('cycles focus with Tab and Shift+Tab', () => {
    const { trap, byId } = setup()
    const press = (shiftKey: boolean) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true })
      trap.onKeydown(event)
      return event.defaultPrevented
    }

    byId('last').focus()
    expect(press(false)).toBe(true)
    expect(document.activeElement).toBe(byId('first'))

    expect(press(true)).toBe(true)
    expect(document.activeElement).toBe(byId('last'))
  })
})

describe('useClickOutside', () => {
  it('calls the handler only for clicks outside the element', () => {
    const handler = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(
      defineComponent({
        setup() {
          const target = ref<HTMLElement | null>(null)
          useClickOutside(target, handler)
          return () => h('div', { ref: target, id: 'inside' })
        },
      }),
    )
    app.mount(host)

    document
      .getElementById('inside')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(handler).not.toHaveBeenCalled()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)

    app.unmount()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

describe('useDocumentSettings', () => {
  it('syncs language, theme and title with the settings', async () => {
    const settings = useSettingsStore()
    settings.setLocale('uk')
    effectScope().run(useDocumentSettings)

    expect(document.documentElement.lang).toBe('uk')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.title).toBe('Vadem Weather — Прогноз для місць, які вам важливі')

    settings.setLocale('en')
    settings.toggleTheme()
    await nextTick()
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.title).toContain('Forecast for the places you care about')
  })
})
