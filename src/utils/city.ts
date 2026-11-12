import type { City, Locale } from '@/types'
import type { OwmGeoLocationDto } from '@/types/openweather.dto'

export function cityId(lat: number, lon: number): string {
  return `${lat.toFixed(2)}:${lon.toFixed(2)}`
}

export function cityFromGeo(dto: OwmGeoLocationDto): City {
  const localNames: City['localNames'] = {}
  if (dto.local_names?.uk) localNames.uk = dto.local_names.uk
  if (dto.local_names?.en) localNames.en = dto.local_names.en
  return {
    id: cityId(dto.lat, dto.lon),
    name: dto.name,
    localNames,
    country: dto.country,
    state: dto.state,
    lat: dto.lat,
    lon: dto.lon,
  }
}

export function cityRegion(city: City): string {
  return [city.state, city.country].filter(Boolean).join(', ')
}

export function cityName(city: City, locale: Locale): string {
  return city.localNames?.[locale] ?? city.name
}

export function uniqueCities(cities: City[]): City[] {
  const seen = new Set<string>()
  return cities.filter((city) => {
    const key = `${city.name}|${city.state ?? ''}|${city.country}`
    if (seen.has(key) || seen.has(city.id)) return false
    seen.add(key)
    seen.add(city.id)
    return true
  })
}

export function isCity(value: unknown): value is City {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.country === 'string' &&
    typeof v.lat === 'number' &&
    typeof v.lon === 'number'
  )
}

export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}
