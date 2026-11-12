import type { ChartType, Plugin } from 'chart.js'
import { formatTemp } from '@/utils/format'

export interface ValueLabelsOptions {
  values: number[]
  emphasis?: boolean[]
  font: string
  color: string
  dimColor: string
  minGap?: number
}

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    valueLabels?: ValueLabelsOptions
  }
}

export const valueLabelsPlugin: Plugin<'line' | 'bar', ValueLabelsOptions> = {
  id: 'valueLabels',
  afterDatasetsDraw(chart, _args, options) {
    const meta = chart.getDatasetMeta(0)
    if (!meta || meta.hidden || !options.values) return

    const { ctx } = chart
    const minGap = options.minGap ?? 30
    let lastX = -Infinity

    ctx.save()
    ctx.font = options.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    meta.data.forEach((point, index) => {
      const value = options.values[index]
      if (value === undefined || point.x - lastX < minGap) return
      lastX = point.x
      ctx.fillStyle = (options.emphasis?.[index] ?? true) ? options.color : options.dimColor
      ctx.fillText(formatTemp(value), point.x, point.y - 10)
    })
    ctx.restore()
  },
}
