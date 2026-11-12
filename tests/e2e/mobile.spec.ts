import { expect, test } from './support/fixtures'
import { block } from './support/pages'

test.use({ viewport: { width: 360, height: 740 } })

const hasHorizontalScroll = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)

test.describe('mobile layout @mobile', () => {
  test('fits 360px on every screen without horizontal scroll', async ({ page }) => {
    await page.goto('/')
    await expect(block(page).temperature).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)

    await block(page).mode('5 днів').click()
    await expect(block(page).days).toHaveCount(5)
    expect(await hasHorizontalScroll(page)).toBe(false)

    await block(page).favorite.click()
    await page.getByRole('link', { name: /Вибране/ }).click()
    await expect(block(page).root).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  test('opens the autocomplete and dialogs inside the viewport', async ({ page }) => {
    await page.goto('/')
    await block(page).search.fill('Льв')
    const option = page.getByRole('option', { name: /Львів/ })
    await expect(option).toBeInViewport()
    await option.tap()

    await page.getByRole('button', { name: /Додати блок/ }).tap()
    await block(page, 1).remove.tap()
    await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 })
  })
})
