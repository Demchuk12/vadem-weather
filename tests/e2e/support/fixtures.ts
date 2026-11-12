import { test as base, expect, type Page, type Route } from '@playwright/test'
import type { OwmGeoLocationDto } from '../../../src/types/openweather.dto'
import { currentDto, forecastDto, GEO_KYIV, GEO_LVIV, GEO_ODESA } from '../../fixtures/openweather'

const CORS = { 'access-control-allow-origin': '*' }

const TEMP_BY_CITY: Record<string, number> = { Kyiv: 8, Lviv: 4, Odesa: 12 }

export class MockApi {
  readonly requests: URL[] = []
  status = 200
  cities: OwmGeoLocationDto[] = [GEO_KYIV, GEO_LVIV, GEO_ODESA]

  constructor(private readonly page: Page) {}

  async install() {
    await this.page.route('https://fonts.googleapis.com/**', (route) => route.abort())
    await this.page.route('https://fonts.gstatic.com/**', (route) => route.abort())
    await this.page.route('https://get.geojs.io/**', (route) =>
      route.fulfill({
        headers: CORS,
        json: { latitude: '50.45', longitude: '30.52', city: 'Kyiv', country_code: 'UA' },
      }),
    )
    await this.page.route('https://ipapi.co/**', (route) =>
      route.fulfill({ status: 500, headers: CORS, json: {} }),
    )
    await this.page.route('https://api.openweathermap.org/**', (route) => this.handle(route))
  }

  requestsTo(path: string) {
    return this.requests.filter((url) => url.pathname === path)
  }

  private cityAt(lat: number) {
    return this.cities.find((city) => Math.abs(city.lat - lat) < 0.01) ?? GEO_KYIV
  }

  private handle(route: Route) {
    const url = new URL(route.request().url())
    this.requests.push(url)

    if (this.status !== 200) {
      return route.fulfill({
        status: this.status,
        headers: CORS,
        json: { cod: this.status, message: 'Invalid API key' },
      })
    }

    const lat = Number(url.searchParams.get('lat'))
    const json = (() => {
      switch (url.pathname) {
        case '/geo/1.0/direct': {
          const q = (url.searchParams.get('q') ?? '').toLowerCase()
          return this.cities.filter((city) =>
            [city.name, ...Object.values(city.local_names ?? {})].some((name) =>
              name.toLowerCase().startsWith(q),
            ),
          )
        }
        case '/geo/1.0/reverse':
          return [this.cityAt(lat)]
        case '/data/2.5/weather':
          return currentDto({ temp: TEMP_BY_CITY[this.cityAt(lat).name] ?? 8 })
        case '/data/2.5/forecast':
          return forecastDto()
        default:
          return {}
      }
    })()

    return route.fulfill({ headers: CORS, json })
  }
}

export const test = base.extend<{ api: MockApi }>({
  api: [
    async ({ page }, use) => {
      const api = new MockApi(page)
      await api.install()
      await use(api)
    },
    { auto: true },
  ],
})

export { expect }
