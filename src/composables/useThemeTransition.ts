import { nextTick } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import { prefersReducedMotion } from '@/utils/motion'

export function useThemeTransition() {
  const settings = useSettingsStore()

  return async function toggleTheme(event: MouseEvent) {
    if (!document.startViewTransition || prefersReducedMotion()) {
      settings.toggleTheme()
      return
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(async () => {
      settings.toggleTheme()
      await nextTick()
    })
    await transition.ready

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 650,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }
}
