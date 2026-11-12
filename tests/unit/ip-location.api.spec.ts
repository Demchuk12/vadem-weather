import { describe, expect, it } from 'vitest'
import { ipLocationApi } from '@/api'
import { jsonResponse, mockFetch } from './helpers'

describe('ipLocationApi.detect', () => {
  it('uses the first provider when it succeeds', async () => {
    const fetchMock = mockFetch(() =>
      jsonResponse({ latitude: '49.55', longitude: '25.59', city: 'Ternopil', country_code: 'UA' }),
    )
    await expect(ipLocationApi.detect()).resolves.toEqual({
      lat: 49.55,
      lon: 25.59,
      city: 'Ternopil',
      country: 'UA',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to the next provider', async () => {
    mockFetch((url) =>
      url.host === 'get.geojs.io'
        ? jsonResponse({}, 503)
        : jsonResponse({ latitude: 49.84, longitude: 24.03, city: 'Lviv', country_code: 'UA' }),
    )
    await expect(ipLocationApi.detect()).resolves.toMatchObject({ city: 'Lviv', lat: 49.84 })
  })

  it('rejects when every provider fails', async () => {
    mockFetch((url) =>
      url.host === 'get.geojs.io'
        ? jsonResponse({ latitude: 'n/a' })
        : jsonResponse({ error: true }),
    )
    await expect(ipLocationApi.detect()).rejects.toThrow()
  })
})
