import type { ConditionGroup } from '@/types'

export const OWM_CODE = {
  FREEZING_RAIN: 511,
  CLEAR_SKY: 800,
  FEW_CLOUDS: 801,
  SCATTERED_CLOUDS: 802,
} as const

export const GROUP_BY_CODE: Readonly<Record<number, ConditionGroup>> = {
  [OWM_CODE.FREEZING_RAIN]: 'snow',
  [OWM_CODE.CLEAR_SKY]: 'clear',
  [OWM_CODE.FEW_CLOUDS]: 'partly',
  [OWM_CODE.SCATTERED_CLOUDS]: 'partly',
}

export const GROUP_BY_SERIES: Readonly<Record<number, ConditionGroup>> = {
  2: 'storm',
  3: 'rain',
  5: 'rain',
  6: 'snow',
  7: 'mist',
  8: 'clouds',
}

export const FALLBACK_GROUP: ConditionGroup = 'clouds'

export const GROUP_SEVERITY: readonly ConditionGroup[] = [
  'clear',
  'partly',
  'clouds',
  'mist',
  'rain',
  'snow',
  'storm',
]
