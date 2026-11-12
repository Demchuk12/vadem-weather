export function formatTemp(value: number, withUnit = false): string {
  const rounded = Math.round(value)
  const safe = Object.is(rounded, -0) ? 0 : rounded
  const sign = safe > 0 ? '+' : ''
  return `${sign}${safe}°${withUnit ? 'C' : ''}`
}

export const toPercent = (fraction: number) => Math.round(fraction * 100)

export function capitalize(text: string): string {
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text
}

export function average(values: readonly number[]): number {
  if (values.length === 0) return NaN
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function round(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
export type CompassPoint = (typeof COMPASS)[number]

export function compassPoint(deg: number): CompassPoint {
  const index = Math.round((((deg % 360) + 360) % 360) / 45) % 8
  return COMPASS[index] ?? 'N'
}
