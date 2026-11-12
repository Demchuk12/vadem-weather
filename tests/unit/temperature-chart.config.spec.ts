import { describe, expect, it } from 'vitest'
import {
  CHART_CSS_VARS,
  createTemperatureChartConfig,
  type ChartPalette,
} from '@/charts/temperature-chart.config'
import type { ChartModel } from '@/types'

const palette = Object.fromEntries(
  CHART_CSS_VARS.map((name) => [name, `var(${name})`]),
) as ChartPalette

const hourly: ChartModel = {
  title: 'Hourly',
  labels: ['Now', '15:00', '18:00'],
  primary: { label: 'Temperature', values: [4, 6, 2] },
  emphasis: [true, true, false],
  precipitation: { label: 'Precipitation', values: [0, 40, 80] },
}

const weekly: ChartModel = {
  title: 'Weekly',
  labels: ['Today', 'Fri', 'Sat', 'Sun', 'Mon'],
  primary: { label: 'Average', values: [5, 6, 7, 8, 9] },
  secondary: { label: 'Night', values: [1, null, 3, 4, 5] },
}

describe('createTemperatureChartConfig', () => {
  it('builds a temperature line with precipitation bars for the hourly chart', () => {
    const { data } = createTemperatureChartConfig(hourly, palette)
    expect(data.labels).toEqual(hourly.labels)
    expect(data.datasets.map((d) => [d.type, d.yAxisID])).toEqual([
      ['line', 'y'],
      ['bar', 'pop'],
    ])
    expect(data.datasets[1]?.data).toEqual([0, 40, 80])
  })

  it('adds a dashed secondary line for the weekly chart', () => {
    const { data } = createTemperatureChartConfig(weekly, palette)
    const secondary = data.datasets[1]
    expect(secondary).toMatchObject({
      type: 'line',
      label: 'Night',
      spanGaps: true,
      borderDash: [6, 6],
    })
  })

  it('pads the temperature axis around all values', () => {
    const y = createTemperatureChartConfig(weekly, palette).options?.scales?.y
    expect(y).toMatchObject({ suggestedMin: -2, suggestedMax: 12 })
  })

  it('passes values and emphasis to the label plugin', () => {
    const labels = createTemperatureChartConfig(hourly, palette).options?.plugins?.valueLabels
    expect(labels).toMatchObject({
      values: [4, 6, 2],
      emphasis: [true, true, false],
      color: 'var(chart-text)',
      dimColor: 'var(chart-dim)',
    })
  })

  it('dims points outside the selected period', () => {
    const line = createTemperatureChartConfig(hourly, palette).data.datasets[0] as unknown as {
      pointBackgroundColor: (ctx: { dataIndex: number }) => string
    }
    expect(line.pointBackgroundColor({ dataIndex: 0 })).toBe('var(chart-line)')
    expect(line.pointBackgroundColor({ dataIndex: 2 })).toBe('var(chart-dim)')
  })

  it('skips x labels only when there are many of them', () => {
    const autoSkip = (model: ChartModel) =>
      (
        createTemperatureChartConfig(model, palette).options?.scales?.x?.ticks as {
          autoSkip: boolean
        }
      ).autoSkip
    expect(autoSkip(weekly)).toBe(false)
    expect(autoSkip({ ...hourly, labels: Array.from({ length: 9 }, (_, i) => `${i}`) })).toBe(true)
  })

  it('formats tooltip values by axis', () => {
    const label = createTemperatureChartConfig(hourly, palette).options?.plugins?.tooltip?.callbacks
      ?.label as (item: unknown) => string
    expect(label({ dataset: { yAxisID: 'y', label: 'Temperature' }, parsed: { y: 3.6 } })).toBe(
      ' Temperature: +4°',
    )
    expect(label({ dataset: { yAxisID: 'pop', label: 'Precipitation' }, parsed: { y: 40 } })).toBe(
      ' Precipitation: 40%',
    )
  })
})
