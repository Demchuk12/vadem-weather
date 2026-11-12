import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounceFn } from '@/composables/useDebounceFn'

describe('useDebounceFn', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls the function once with the last arguments', () => {
    const fn = vi.fn()
    const debounced = useDebounceFn(fn, 100)
    debounced(1)
    debounced(2)
    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledExactlyOnceWith(2)
  })

  it('can be cancelled', () => {
    const fn = vi.fn()
    const debounced = useDebounceFn(fn, 100)
    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })
})
