import {
  FALLBACK_GROUP,
  GROUP_BY_CODE,
  GROUP_BY_SERIES,
  GROUP_SEVERITY,
  OWM_CODE,
} from '@/constants/weather-conditions'
import type { ConditionGroup, DayPeriod, WeatherCondition } from '@/types'
import type { OwmWeatherConditionDto } from '@/types/openweather.dto'

const codeSeries = (id: number) => Math.floor(id / 100)

export function conditionGroup(id: number): ConditionGroup {
  return GROUP_BY_CODE[id] ?? GROUP_BY_SERIES[codeSeries(id)] ?? FALLBACK_GROUP
}

export function severity(group: ConditionGroup): number {
  return GROUP_SEVERITY.indexOf(group)
}

export function toCondition(dto: OwmWeatherConditionDto | undefined): WeatherCondition {
  const id = dto?.id ?? OWM_CODE.CLEAR_SKY
  return { id, group: conditionGroup(id), description: dto?.description ?? '' }
}

export function periodFromIcon(icon: string | undefined): DayPeriod {
  return icon?.endsWith('n') ? 'night' : 'day'
}
