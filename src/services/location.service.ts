import { ipLocationApi, openWeatherApi } from '@/api'
import type { City } from '@/types'
import { cityFromGeo, cityId } from '@/utils/city'

const FALLBACK_CITY: City = {
  id: cityId(50.45, 30.52),
  name: 'Kyiv',
  localNames: { uk: 'Київ', en: 'Kyiv' },
  country: 'UA',
  lat: 50.4501,
  lon: 30.5234,
}

export async function detectUserCity(signal?: AbortSignal): Promise<City> {
  try {
    const location = await ipLocationApi.detect(signal)
    try {
      const [place] = await openWeatherApi.reverseGeocode(location.lat, location.lon, signal)
      if (place) return cityFromGeo(place)
    } catch {}
    return {
      id: cityId(location.lat, location.lon),
      name: location.city ?? 'My location',
      country: location.country ?? '',
      lat: location.lat,
      lon: location.lon,
    }
  } catch {
    return FALLBACK_CITY
  }
}
