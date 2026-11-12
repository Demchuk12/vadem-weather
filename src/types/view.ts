import type { DayPeriod, WeatherCondition } from './weather'

export interface HeroModel {
  label: string
  dateLabel: string
  temp: number
  feelsLike: number | null
  min: number
  max: number
  condition: WeatherCondition
  period: DayPeriod
}

export interface ChartModel {
  title: string
  labels: string[]
  primary: { label: string; values: number[] }
  secondary?: { label: string; values: (number | null)[] }
  emphasis?: boolean[]
  precipitation?: { label: string; values: number[] }
}

export interface DayRowModel {
  date: string
  weekday: string
  dateLabel: string
  temp: number | null
  min: number
  max: number
  pop: number
  condition: WeatherCondition
  period: DayPeriod
  isToday: boolean
}
