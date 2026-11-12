import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
  type ChartDataset,
  type ScriptableContext,
} from 'chart.js'
import type { ChartModel } from '@/types'
import { formatTemp } from '@/utils/format'
import { valueLabelsPlugin } from './value-labels.plugin'

Chart.register(
  LineController,
  BarController,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  valueLabelsPlugin,
)

export const CHART_CSS_VARS = [
  'chart-line',
  'chart-line-2',
  'chart-fill',
  'chart-grid',
  'chart-text',
  'chart-tooltip-bg',
  'chart-tooltip-text',
  'chart-dim',
  'precip-soft',
  'surface-solid',
  'font-sans',
] as const

export type ChartPalette = Record<(typeof CHART_CSS_VARS)[number], string>

type Kind = 'line' | 'bar'
type Values = (number | null)[]
export type TemperatureChartConfig = ChartConfiguration<Kind, Values, string>

const STAGGER_MS = 45
const PRECIPITATION_AXIS_MAX = 300

function fillGradient(color: string) {
  return ({ chart }: ScriptableContext<'line'>) => {
    if (!chart.chartArea) return 'transparent'
    const gradient = chart.ctx.createLinearGradient(
      0,
      chart.chartArea.top,
      0,
      chart.chartArea.bottom,
    )
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    return gradient
  }
}

function suggestedRange({ primary, secondary }: ChartModel) {
  const values = [...primary.values, ...(secondary?.values ?? [])].filter(
    (value): value is number => value !== null,
  )
  if (!values.length) return {}
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max(2, (max - min) * 0.35)
  return { suggestedMin: Math.floor(min - pad), suggestedMax: Math.ceil(max + pad) }
}

function buildDatasets(model: ChartModel, palette: ChartPalette): ChartDataset<Kind, Values>[] {
  const isEmphasized = (index: number) => model.emphasis?.[index] ?? true
  const lineColor = (index: number) =>
    isEmphasized(index) ? palette['chart-line'] : palette['chart-dim']

  const datasets: ChartDataset<Kind, Values>[] = [
    {
      type: 'line',
      label: model.primary.label,
      data: model.primary.values,
      yAxisID: 'y',
      borderColor: palette['chart-line'],
      borderWidth: 3,
      tension: 0.4,
      fill: 'start',
      backgroundColor: fillGradient(palette['chart-fill']),
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 2,
      pointBackgroundColor: (ctx) => lineColor(ctx.dataIndex),
      pointBorderColor: palette['surface-solid'],
      segment: {
        borderColor: (ctx) =>
          isEmphasized(ctx.p0DataIndex) && isEmphasized(ctx.p1DataIndex)
            ? palette['chart-line']
            : palette['chart-dim'],
      },
      order: 1,
    },
  ]

  if (model.secondary) {
    datasets.push({
      type: 'line',
      label: model.secondary.label,
      data: model.secondary.values,
      yAxisID: 'y',
      borderColor: palette['chart-line-2'],
      backgroundColor: palette['chart-line-2'],
      borderWidth: 2,
      borderDash: [6, 6],
      tension: 0.4,
      pointRadius: 3,
      spanGaps: true,
      order: 0,
    })
  }

  if (model.precipitation) {
    datasets.push({
      type: 'bar',
      label: model.precipitation.label,
      data: model.precipitation.values,
      yAxisID: 'pop',
      backgroundColor: palette['precip-soft'],
      borderRadius: 6,
      barPercentage: 0.5,
      order: 2,
    })
  }

  return datasets
}

export function createTemperatureChartConfig(
  model: ChartModel,
  palette: ChartPalette,
): TemperatureChartConfig {
  const font = palette['font-sans']
  const ticks = { color: palette['chart-text'], font: { family: font, size: 11 } }

  return {
    type: 'line',
    data: { labels: model.labels, datasets: buildDatasets(model, palette) },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 24, left: 4, right: 4 } },
      animation: {
        duration: 700,
        easing: 'easeOutQuart',
        delay: (ctx) =>
          ctx.type === 'data' && ctx.mode === 'default'
            ? ctx.dataIndex * STAGGER_MS + ctx.datasetIndex * STAGGER_MS * 2
            : 0,
      },
      animations: {
        y: {
          from: (ctx) =>
            ctx.type === 'data' && ctx.mode === 'default' ? ctx.chart.chartArea?.bottom : undefined,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            ...ticks,
            font: { family: font, size: 12, weight: 600 },
            maxRotation: 0,
            autoSkip: model.labels.length > 6,
            autoSkipPadding: 10,
          },
        },
        y: {
          ...suggestedRange(model),
          grid: { color: palette['chart-grid'] },
          border: { display: false },
          ticks: { ...ticks, maxTicksLimit: 5, callback: (value) => `${value}°` },
        },
        pop: { display: false, min: 0, max: PRECIPITATION_AXIS_MAX },
      },
      plugins: {
        valueLabels: {
          values: model.primary.values,
          emphasis: model.emphasis,
          font: `700 12px ${font}`,
          color: palette['chart-text'],
          dimColor: palette['chart-dim'],
        },
        tooltip: {
          backgroundColor: palette['chart-tooltip-bg'],
          titleColor: palette['chart-tooltip-text'],
          bodyColor: palette['chart-tooltip-text'],
          padding: 12,
          cornerRadius: 12,
          boxPadding: 4,
          titleFont: { family: font, weight: 700 },
          bodyFont: { family: font },
          callbacks: {
            label: ({ dataset, parsed }) => {
              if (parsed.y === null || parsed.y === undefined) return ''
              const value = dataset.yAxisID === 'pop' ? `${parsed.y}%` : formatTemp(parsed.y)
              return ` ${dataset.label}: ${value}`
            },
          },
        },
      },
    },
  }
}
