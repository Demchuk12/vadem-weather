import { expect, test } from './support/fixtures'
import { block, chooseCity } from './support/pages'

test.describe('weather block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows the weather of the city detected by IP', async ({ page }) => {
    const first = block(page)
    await expect(first.search).toHaveValue('Київ')
    await expect(first.temperature).toHaveText('+8°')
    await expect(first.heroLabel).toHaveText('Зараз')
    await expect(first.root.getByText('Вологість')).toBeVisible()
    await expect(first.root.locator('canvas')).toBeVisible()
    await expect(first.chartTitle).toHaveText('Температура на найближчі 24 години')
  })

  test('selects a city from the autocomplete with the mouse', async ({ page }) => {
    const first = block(page)
    await chooseCity(first.search, 'Льв', 'Львів')

    await expect(first.search).toHaveValue('Львів')
    await expect(first.temperature).toHaveText('+4°')
  })

  test('selects a city from the autocomplete with the keyboard', async ({ page }) => {
    const first = block(page)
    await first.search.fill('Од')
    await expect(page.getByRole('option')).toHaveCount(1)
    await first.search.press('ArrowDown')
    await first.search.press('Enter')

    await expect(first.search).toHaveValue('Одеса')
    await expect(first.temperature).toHaveText('+12°')
  })

  test('shows a hint and an empty result in the autocomplete', async ({ page }) => {
    const { search } = block(page)
    await search.fill('К')
    await expect(page.getByText('Введіть щонайменше 2 літери')).toBeVisible()
    await search.fill('Атлантида')
    await expect(page.getByText('Міст не знайдено')).toBeVisible()
    await search.press('Escape')
    await expect(search).toHaveValue('Київ')
  })

  test('switches between today and 5 days', async ({ page }) => {
    const first = block(page)
    await first.mode('5 днів').click()

    await expect(first.days).toHaveCount(5)
    await expect(first.days.first()).toContainText('Сьогодні')
    await expect(first.chartTitle).toHaveText('Середня температура на 5 днів')

    await first.mode('День').first().click()
    await expect(first.root.getByText('Вологість')).toBeVisible()
  })

  test('switches between day and night', async ({ page }) => {
    const first = block(page)
    await first.mode('Ніч').click()
    await expect(first.heroLabel).toHaveText('Сьогодні вночі')
    await expect(first.root.locator('.hero')).toHaveClass(/sky--night/)

    await first.mode('День').last().click()
    await expect(first.heroLabel).toHaveText('Зараз')
  })

  test('shows an error and recovers on retry', async ({ page, api }) => {
    api.status = 401
    await page.reload()
    const first = block(page)
    await expect(first.root.getByRole('alert')).toContainText(
      'Ключ OpenWeatherMap API відсутній або недійсний.',
    )

    api.status = 200
    await first.root.getByRole('button', { name: 'Спробувати ще' }).click()
    await expect(first.temperature).toBeVisible()
  })
})
