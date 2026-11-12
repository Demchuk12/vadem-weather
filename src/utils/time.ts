import type { Locale } from '@/types'

const INTL_LOCALE: Record<Locale, string> = { uk: 'uk-UA', en: 'en-GB' }

export function toCityDate(unixSeconds: number, tzOffsetSeconds: number): Date {
  return new Date((unixSeconds + tzOffsetSeconds) * 1000)
}

export function cityDateKey(unixSeconds: number, tzOffsetSeconds: number): string {
  return toCityDate(unixSeconds, tzOffsetSeconds).toISOString().slice(0, 10)
}

export function cityHour(unixSeconds: number, tzOffsetSeconds: number): number {
  return toCityDate(unixSeconds, tzOffsetSeconds).getUTCHours()
}

function format(
  unixSeconds: number,
  tz: number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...options, timeZone: 'UTC' }).format(
    toCityDate(unixSeconds, tz),
  )
}

export const formatTime = (dt: number, tz: number, locale: Locale) =>
  format(dt, tz, locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export const formatWeekday = (
  dt: number,
  tz: number,
  locale: Locale,
  style: 'short' | 'long' = 'short',
) => format(dt, tz, locale, { weekday: style })

export const formatDayMonth = (dt: number, tz: number, locale: Locale) =>
  format(dt, tz, locale, { day: 'numeric', month: 'short' })

export const formatFullDate = (dt: number, tz: number, locale: Locale) =>
  format(dt, tz, locale, { weekday: 'long', day: 'numeric', month: 'long' })

export const formatLocalTime = (timestampMs: number, locale: Locale) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(timestampMs)
