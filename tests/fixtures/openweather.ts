import type {
  OwmCurrentWeatherDto,
  OwmForecastDto,
  OwmForecastItemDto,
  OwmGeoLocationDto,
} from '../../src/types/openweather.dto'

export const KYIV_TZ = 2 * 3600
const STEP = 3 * 3600

interface ForecastOptions {
  now?: number
  timezone?: number
  count?: number
  conditionId?: number
  temp?: (localHour: number, index: number) => number
}

const localHour = (dt: number, tz: number) => new Date((dt + tz) * 1000).getUTCHours()

export function forecastItem(
  dt: number,
  temp: number,
  tz = KYIV_TZ,
  conditionId = 800,
): OwmForecastItemDto {
  const hour = localHour(dt, tz)
  const pod = hour >= 6 && hour < 18 ? 'd' : 'n'
  return {
    dt,
    main: {
      temp,
      feels_like: temp - 2,
      temp_min: temp - 1,
      temp_max: temp + 1,
      pressure: 1012,
      humidity: 70,
    },
    weather: [{ id: conditionId, main: 'Clear', description: 'clear sky', icon: `01${pod}` }],
    clouds: { all: 0 },
    wind: { speed: 4, deg: 200 },
    visibility: 10000,
    pop: 0.4,
    sys: { pod },
    dt_txt: '',
  }
}

export function forecastDto({
  now = Math.floor(Date.now() / 1000),
  timezone = KYIV_TZ,
  count = 40,
  conditionId = 800,
  temp = (hour) => 5 + 6 * Math.sin(((hour - 9) / 24) * 2 * Math.PI),
}: ForecastOptions = {}): OwmForecastDto {
  const first = Math.floor(now / STEP) * STEP + STEP
  return {
    cod: '200',
    cnt: count,
    city: {
      id: 703448,
      name: 'Kyiv',
      coord: { lat: 50.45, lon: 30.52 },
      country: 'UA',
      timezone,
      sunrise: now - 6 * 3600,
      sunset: now + 3 * 3600,
    },
    list: Array.from({ length: count }, (_, index) => {
      const dt = first + index * STEP
      return forecastItem(dt, temp(localHour(dt, timezone), index), timezone, conditionId)
    }),
  }
}

export function currentDto(
  overrides: {
    now?: number
    temp?: number
    conditionId?: number
    description?: string
    pod?: 'd' | 'n'
  } = {},
): OwmCurrentWeatherDto {
  const now = overrides.now ?? Math.floor(Date.now() / 1000)
  const pod = overrides.pod ?? 'd'
  return {
    coord: { lat: 50.45, lon: 30.52 },
    weather: [
      {
        id: overrides.conditionId ?? 801,
        main: 'Clouds',
        description: overrides.description ?? 'few clouds',
        icon: `02${pod}`,
      },
    ],
    main: {
      temp: overrides.temp ?? 8.4,
      feels_like: 6.1,
      temp_min: 7,
      temp_max: 10,
      pressure: 1014,
      humidity: 64,
    },
    visibility: 10000,
    wind: { speed: 3.6, deg: 220 },
    clouds: { all: 20 },
    dt: now,
    sys: { country: 'UA', sunrise: now - 6 * 3600, sunset: now + 3 * 3600 },
    timezone: KYIV_TZ,
    id: 703448,
    name: 'Kyiv',
  }
}

export const GEO_KYIV: OwmGeoLocationDto = {
  name: 'Kyiv',
  local_names: { uk: 'Київ', en: 'Kyiv' },
  lat: 50.4501,
  lon: 30.5234,
  country: 'UA',
}

export const GEO_LVIV: OwmGeoLocationDto = {
  name: 'Lviv',
  local_names: { uk: 'Львів', en: 'Lviv' },
  lat: 49.8397,
  lon: 24.0297,
  country: 'UA',
  state: 'Lviv Oblast',
}

export const GEO_ODESA: OwmGeoLocationDto = {
  name: 'Odesa',
  local_names: { uk: 'Одеса', en: 'Odesa' },
  lat: 46.4825,
  lon: 30.7233,
  country: 'UA',
}
