import { describe, expect, it } from 'vitest'
import { detectUserCity } from '@/services/location.service'
import { GEO_LVIV } from '../fixtures/openweather'
import { jsonResponse, mockFetch } from './helpers'

const IP_LVIV = { latitude: '49.84', longitude: '24.03', city: 'Lviv', country_code: 'UA' }

describe('detectUserCity', () => {
  it('returns the reverse geocoded city with local names', async () => {
    mockFetch((url) => jsonResponse(url.host === 'get.geojs.io' ? IP_LVIV : [GEO_LVIV]))
    await expect(detectUserCity()).resolves.toMatchObject({
      name: 'Lviv',
      localNames: { uk: 'Львів', en: 'Lviv' },
      state: 'Lviv Oblast',
    })
  })

  it('builds the city from IP data when reverse geocoding fails', async () => {
    mockFetch((url) =>
      url.host === 'get.geojs.io' ? jsonResponse(IP_LVIV) : jsonResponse({}, 401),
    )
    await expect(detectUserCity()).resolves.toMatchObject({
      id: '49.84:24.03',
      name: 'Lviv',
      country: 'UA',
    })
  })

  it('falls back to Kyiv when the location cannot be detected', async () => {
    mockFetch(() => jsonResponse({}, 500))
    await expect(detectUserCity()).resolves.toMatchObject({ name: 'Kyiv', country: 'UA' })
  })
})
