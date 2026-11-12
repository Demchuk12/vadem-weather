export const MAX_BLOCKS = 5
export const MAX_FAVORITES = 5

export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000

export const HOURLY_SAMPLES = 9

export const FORECAST_DAYS = 5

export const LOCAL_NOON_HOUR = 12

export const MIN_VISIBLE_PRECIPITATION = 0.2

export const AUTOCOMPLETE_DEBOUNCE_MS = 300
export const AUTOCOMPLETE_MIN_CHARS = 2
export const AUTOCOMPLETE_LIMIT = 5

export const STORAGE_KEYS = {
  theme: 'vw:theme',
  locale: 'vw:locale',
  favorites: 'vw:favorites',
  blocks: 'vw:blocks',
} as const

export const OWM_BASE_URL = 'https://api.openweathermap.org'
