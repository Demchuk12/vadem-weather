import { describe, expect, it } from 'vitest'
import { ApiError, buildUrl, getJson, isAbortError } from '@/api'
import { jsonResponse, mockFetch } from './helpers'

describe('buildUrl', () => {
  it('adds params and skips undefined ones', () => {
    expect(buildUrl('https://api.test/path', { a: 1, b: 'x y', c: undefined, d: false })).toBe(
      'https://api.test/path?a=1&b=x+y&d=false',
    )
  })
})

describe('getJson', () => {
  it('returns parsed JSON', async () => {
    mockFetch(() => jsonResponse({ ok: true }))
    await expect(getJson('https://api.test')).resolves.toEqual({ ok: true })
  })

  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not_found'],
    [429, 'rate_limit'],
    [500, 'server'],
  ] as const)('maps HTTP %i to the "%s" code', async (status, code) => {
    mockFetch(() => jsonResponse({ message: 'boom' }, status))
    await expect(getJson('https://api.test')).rejects.toMatchObject({
      name: 'ApiError',
      code,
      status,
      message: 'boom',
    })
  })

  it('uses the status text when the error body is not JSON', async () => {
    mockFetch(() => new Response('oops', { status: 500, statusText: 'Internal Server Error' }))
    await expect(getJson('https://api.test')).rejects.toMatchObject({
      code: 'server',
      message: 'Internal Server Error',
    })
  })

  it('normalises network failures', async () => {
    mockFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    await expect(getJson('https://api.test')).rejects.toMatchObject({ code: 'network' })
  })

  it('normalises aborted requests', async () => {
    mockFetch(() => {
      throw new DOMException('Aborted', 'AbortError')
    })
    const error = await getJson('https://api.test').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(isAbortError(error)).toBe(true)
  })
})
