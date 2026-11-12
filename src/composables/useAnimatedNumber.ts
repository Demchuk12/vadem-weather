import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { prefersReducedMotion } from '@/utils/motion'

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export function useAnimatedNumber(source: MaybeRefOrGetter<number>, duration = 700) {
  const value = ref(0)
  let frame = 0

  watch(
    () => toValue(source),
    (target) => {
      cancelAnimationFrame(frame)
      if (prefersReducedMotion()) {
        value.value = target
        return
      }
      const from = value.value
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        value.value = from + (target - from) * easeOutCubic(progress)
        if (progress < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    },
    { immediate: true },
  )

  onScopeDispose(() => cancelAnimationFrame(frame))

  return value
}
