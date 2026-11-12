import type { Locale } from './settings'

export interface City {
  id: string
  name: string
  localNames?: Partial<Record<Locale, string>>
  country: string
  state?: string
  lat: number
  lon: number
}

export type DayPeriod = 'day' | 'night'

export type ViewMode = 'day' | 'week'

export type ConditionGroup = 'clear' | 'partly' | 'clouds' | 'rain' | 'storm' | 'snow' | 'mist'

export interface WeatherCondition {
  id: number
  group: ConditionGroup
  description: string
}

export interface CurrentWeather {
  dt: number
  temp: number
  feelsLike: number
  tempMin: number
  tempMax: number
  humidity: number
  pressure: number
  windSpeed: number
  windDeg: number
  visibility: number | null
  condition: WeatherCondition
  period: DayPeriod
  sunrise: number
  sunset: number
}

export interface HourlyForecast {
  dt: number
  temp: number
  feelsLike: number
  pop: number
  condition: WeatherCondition
  period: DayPeriod
}

export interface PeriodStats {
  tempAvg: number
  tempMin: number
  tempMax: number
  condition: WeatherCondition
}

export interface DailyForecast {
  date: string
  dt: number
  tempAvg: number
  tempMin: number
  tempMax: number
  pop: number
  condition: WeatherCondition
  day: PeriodStats | null
  night: PeriodStats | null
  samples: number
}

export interface WeatherBundle {
  current: CurrentWeather
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  timezone: number
  fetchedAt: number
}
