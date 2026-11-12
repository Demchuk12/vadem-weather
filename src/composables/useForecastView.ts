import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from './useI18n'
import type {
  ChartModel,
  DayPeriod,
  DayRowModel,
  HeroModel,
  ViewMode,
  WeatherBundle,
} from '@/types'
import { average, capitalize, round, toPercent } from '@/utils/format'
import { filterByPeriod, periodStats } from '@/utils/forecast'
import { formatDayMonth, formatFullDate, formatTime, formatWeekday } from '@/utils/time'

export function useForecastView(
  bundle: MaybeRefOrGetter<WeatherBundle | null>,
  mode: MaybeRefOrGetter<ViewMode>,
  period: MaybeRefOrGetter<DayPeriod>,
) {
  const { t, locale } = useI18n()

  const weekdayLabel = (dt: number, timezone: number, index: number) =>
    index === 0 ? t('weather.today') : capitalize(formatWeekday(dt, timezone, locale.value))

  const hero = computed<HeroModel | null>(() => {
    const data = toValue(bundle)
    if (!data) return null
    const { current, hourly, daily, timezone } = data
    const selected = toValue(period)
    const today = daily[0]
    const dateLabel = capitalize(formatFullDate(current.dt, timezone, locale.value))

    if (selected === current.period) {
      return {
        label: t('weather.now'),
        dateLabel,
        temp: current.temp,
        feelsLike: current.feelsLike,
        min: Math.min(current.temp, today?.tempMin ?? current.tempMin),
        max: Math.max(current.temp, today?.tempMax ?? current.tempMax),
        condition: current.condition,
        period: current.period,
      }
    }

    const samples = filterByPeriod(hourly.slice(1), selected)
    const stats = periodStats(samples)
    if (!stats) return null
    return {
      label: selected === 'night' ? t('weather.tonight') : t('weather.daytime'),
      dateLabel,
      temp: stats.tempAvg,
      feelsLike: round(average(samples.map((s) => s.feelsLike))),
      min: stats.tempMin,
      max: stats.tempMax,
      condition: stats.condition,
      period: selected,
    }
  })

  const days = computed<DayRowModel[]>(() => {
    const data = toValue(bundle)
    if (!data) return []
    const selected = toValue(period)
    return data.daily.map((day, index) => {
      const stats = day[selected]
      return {
        date: day.date,
        weekday: weekdayLabel(day.dt, data.timezone, index),
        dateLabel: formatDayMonth(day.dt, data.timezone, locale.value),
        temp: stats?.tempAvg ?? null,
        min: day.tempMin,
        max: day.tempMax,
        pop: day.pop,
        condition: stats?.condition ?? day.condition,
        period: selected,
        isToday: index === 0,
      }
    })
  })

  const chart = computed<ChartModel | null>(() => {
    const data = toValue(bundle)
    if (!data) return null
    const selected = toValue(period)

    if (toValue(mode) === 'day') {
      return {
        title: t('weather.hourlyTitle'),
        labels: data.hourly.map((point, index) =>
          index === 0 ? t('weather.now') : formatTime(point.dt, data.timezone, locale.value),
        ),
        primary: {
          label: t('weather.temperature'),
          values: data.hourly.map((point) => round(point.temp)),
        },
        emphasis: data.hourly.map((point) => point.period === selected),
        precipitation: {
          label: t('weather.precipitation'),
          values: data.hourly.map((point) => toPercent(point.pop)),
        },
      }
    }

    return {
      title: t('weather.dailyTitle'),
      labels: data.daily.map((day, index) => weekdayLabel(day.dt, data.timezone, index)),
      primary: {
        label: `${t('weather.temperature')}, ${t('weather.avg')}`,
        values: data.daily.map((day) => day.tempAvg),
      },
      secondary: {
        label: selected === 'day' ? t('weather.dayAvg') : t('weather.nightAvg'),
        values: data.daily.map((day) => day[selected]?.tempAvg ?? null),
      },
      precipitation: {
        label: t('weather.precipitation'),
        values: data.daily.map((day) => toPercent(day.pop)),
      },
    }
  })

  return { hero, days, chart }
}
