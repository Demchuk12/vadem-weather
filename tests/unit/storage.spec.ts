import { afterEach, describe, expect, it, vi } from 'vitest'
import { readStorage, readStorageString, writeStorage, writeStorageString } from '@/utils/storage'

const isNumberList = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number')

describe('storage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('writes and reads validated JSON', () => {
    writeStorage('key', [1, 2])
    expect(readStorage('key', isNumberList)).toEqual([1, 2])
  })

  it('returns null for missing, invalid or malformed values', () => {
    expect(readStorage('missing', isNumberList)).toBeNull()
    localStorage.setItem('wrong', JSON.stringify(['a']))
    expect(readStorage('wrong', isNumberList)).toBeNull()
    localStorage.setItem('broken', '{not json')
    expect(readStorage('broken', isNumberList)).toBeNull()
  })

  it('reads only allowed string values', () => {
    writeStorageString('theme', 'dark')
    expect(readStorageString('theme', ['light', 'dark'])).toBe('dark')
    writeStorageString('theme', 'neon')
    expect(readStorageString('theme', ['light', 'dark'])).toBeNull()
  })

  it('never throws when storage is unavailable', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => writeStorage('key', 1)).not.toThrow()
    expect(() => writeStorageString('key', 'x')).not.toThrow()
    expect(readStorage('key', isNumberList)).toBeNull()
    expect(readStorageString('key', ['x'])).toBeNull()
  })
})
