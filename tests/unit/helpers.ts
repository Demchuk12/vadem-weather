import { vi } from 'vitest'
import type { City } from '@/types'
import { cityFromGeo } from '@/utils/city'
import { GEO_KYIV, GEO_LVIV, GEO_ODESA } from '../fixtures/openweather'

export const KYIV: City = cityFromGeo(GEO_KYIV)
export const LVIV: City = cityFromGeo(GEO_LVIV)
export const ODESA: City = cityFromGeo(GEO_ODESA)

export const makeCity = (n: number): City => ({
  id: `${n}:${n}`,
  name: `City ${n}`,
  country: 'PL',
  lat: n,
  lon: n,
})

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function mockFetch(handler: (url: URL) => Response | Promise<Response>) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input) =>
      handler(new URL(input instanceof Request ? input.url : String(input))),
    )
}

export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
