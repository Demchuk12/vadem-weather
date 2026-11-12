import type { Locator, Page } from '@playwright/test'

export function weatherBlocks(page: Page) {
  return page.getByRole('article')
}

export function block(page: Page, index = 0) {
  const root = weatherBlocks(page).nth(index)
  return {
    root,
    search: root.getByRole('combobox'),
    temperature: root.locator('.hero__temp'),
    heroLabel: root.locator('.hero__chip'),
    favorite: root.getByRole('button', { name: /вибран|favorites/i }),
    remove: root.getByRole('button', { name: /Видалити блок|Remove block/ }),
    mode: (name: string | RegExp) => root.getByRole('radio', { name }),
    days: root.locator('.days > li'),
    chartTitle: root.locator('.chart__title'),
  }
}

export async function chooseCity(search: Locator, query: string, option: string) {
  await search.fill(query)
  await search
    .page()
    .getByRole('option', { name: new RegExp(option) })
    .click()
}

export const SAVED_CITIES = [1, 2, 3, 4, 5].map((n) => ({
  id: `${n}0.00:${n}0.00`,
  name: `City ${n}`,
  country: 'PL',
  lat: n * 10,
  lon: n * 10,
}))
