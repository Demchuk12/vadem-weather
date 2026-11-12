import { expect, test } from './support/fixtures'
import { block } from './support/pages'

test.describe('settings', () => {
  test('switches the interface and API language', async ({ page, api }) => {
    await page.goto('/')
    await expect(block(page).temperature).toBeVisible()
    await page.getByRole('radio', { name: 'EN' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(block(page).heroLabel).toHaveText('Now')
    await expect(page.getByRole('link', { name: /Favorites/ })).toBeVisible()
    await expect(block(page).search).toHaveValue('Kyiv')
    await expect
      .poll(() =>
        api.requestsTo('/data/2.5/weather').some((u) => u.searchParams.get('lang') === 'en'),
      )
      .toBe(true)

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('toggles the theme and remembers it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: 'Темна тема' }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Світла тема' })).toBeVisible()
  })

  test('follows the system theme by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('shows the 404 page', async ({ page }) => {
    await page.goto('/missing')
    await expect(page.getByRole('heading', { name: 'Сторінку не знайдено' })).toBeVisible()
    await page.getByRole('button', { name: 'На головну' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
