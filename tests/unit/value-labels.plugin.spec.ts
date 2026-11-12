import { describe, expect, it, vi } from 'vitest'
import { valueLabelsPlugin, type ValueLabelsOptions } from '@/charts/value-labels.plugin'

function draw(xs: number[], options: ValueLabelsOptions) {
  const ctx = { save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), fillStyle: '', font: '' }
  const chart = {
    ctx,
    getDatasetMeta: () => ({ hidden: false, data: xs.map((x) => ({ x, y: 100 })) }),
  }
  const hook = valueLabelsPlugin.afterDatasetsDraw as unknown as (
    chart: unknown,
    args: unknown,
    options: ValueLabelsOptions,
  ) => void
  hook(chart, {}, options)
  return ctx
}

const base = { font: '12px x', color: 'dark', dimColor: 'dim' }

describe('valueLabelsPlugin', () => {
  it('draws a formatted label above every point', () => {
    const ctx = draw([0, 50, 100], { ...base, values: [1, -2, 0] })
    expect(ctx.fillText.mock.calls.map(([text, , y]) => [text, y])).toEqual([
      ['+1°', 90],
      ['-2°', 90],
      ['0°', 90],
    ])
  })

  it('skips labels that would overlap', () => {
    const ctx = draw([0, 10, 40], { ...base, values: [1, 2, 3] })
    expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(['+1°', '+3°'])
  })
})
