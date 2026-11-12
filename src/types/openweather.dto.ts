export interface OwmWeatherConditionDto {
  id: number
  main: string
  description: string
  icon: string
}

export interface OwmMainDto {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface OwmWindDto {
  speed: number
  deg: number
  gust?: number
}

export interface OwmCurrentWeatherDto {
  coord: { lat: number; lon: number }
  weather: OwmWeatherConditionDto[]
  main: OwmMainDto
  visibility?: number
  wind: OwmWindDto
  clouds: { all: number }
  dt: number
  sys: { country?: string; sunrise: number; sunset: number }
  timezone: number
  id: number
  name: string
}

export interface OwmForecastItemDto {
  dt: number
  main: OwmMainDto
  weather: OwmWeatherConditionDto[]
  clouds: { all: number }
  wind: OwmWindDto
  visibility?: number
  pop: number
  sys: { pod: 'd' | 'n' }
  dt_txt: string
}

export interface OwmForecastDto {
  cod: string
  cnt: number
  list: OwmForecastItemDto[]
  city: {
    id: number
    name: string
    coord: { lat: number; lon: number }
    country: string
    timezone: number
    sunrise: number
    sunset: number
  }
}

export interface OwmGeoLocationDto {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}
