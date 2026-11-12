import { getJson } from './http'

export interface IpLocation {
  lat: number
  lon: number
  city?: string
  country?: string
}

interface GeoJsDto {
  latitude?: string
  longitude?: string
  city?: string
  country_code?: string
}

interface IpApiCoDto {
  latitude?: number
  longitude?: number
  city?: string
  country_code?: string
  error?: boolean
}

type Provider = (signal?: AbortSignal) => Promise<IpLocation>

const providers: Provider[] = [
  async (signal) => {
    const dto = await getJson<GeoJsDto>('https://get.geojs.io/v1/ip/geo.json', { signal })
    const lat = Number(dto.latitude)
    const lon = Number(dto.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('geojs: no coordinates')
    return { lat, lon, city: dto.city, country: dto.country_code }
  },
  async (signal) => {
    const dto = await getJson<IpApiCoDto>('https://ipapi.co/json/', { signal })
    if (dto.error || dto.latitude == null || dto.longitude == null) {
      throw new Error('ipapi.co: no coordinates')
    }
    return { lat: dto.latitude, lon: dto.longitude, city: dto.city, country: dto.country_code }
  },
]

export const ipLocationApi = {
  async detect(signal?: AbortSignal): Promise<IpLocation> {
    let lastError: unknown
    for (const provider of providers) {
      try {
        return await provider(signal)
      } catch (error) {
        lastError = error
      }
    }
    throw lastError instanceof Error ? lastError : new Error('IP location is unavailable')
  },
}
