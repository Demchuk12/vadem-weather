import type { Locale } from '@/types'
import en, { type Messages } from './locales/en'
import uk from './locales/uk'

export const messages: Record<Locale, Messages> = { en, uk }

export const SUPPORTED_LOCALES: readonly Locale[] = ['uk', 'en']

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type MessageKey = Leaves<Messages>
export type MessageParams = Record<string, string | number>

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      messages[locale],
    )
  const text = typeof value === 'string' ? value : key
  return params
    ? text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
    : text
}

export function detectBrowserLocale(): Locale {
  const lang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : ''
  return lang.startsWith('en') ? 'en' : 'uk'
}
