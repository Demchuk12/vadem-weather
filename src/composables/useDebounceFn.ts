import { onScopeDispose } from 'vue'

export function useDebounceFn<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = () => clearTimeout(timer)

  const debounced = (...args: Args) => {
    cancel()
    timer = setTimeout(() => fn(...args), delay)
  }

  onScopeDispose(cancel)

  return Object.assign(debounced, { cancel })
}
