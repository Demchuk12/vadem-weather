import { describe, expect, it } from 'vitest'
import { FORECAST_DAYS, MAX_BLOCKS, MAX_FAVORITES } from '@/constants'

describe('limits from the specification', () => {
  it('allows at most 5 weather blocks', () => {
    expect(MAX_BLOCKS).toBe(5)
  })

  it('allows at most 5 favorite cities', () => {
    expect(MAX_FAVORITES).toBe(5)
  })

  it('shows a 5 day forecast', () => {
    expect(FORECAST_DAYS).toBe(5)
  })
})
