import { expect, test } from './support/fixtures'
import { block, SAVED_CITIES } from './support/pages'

test.describe('favorites', () => {
  test('adds a city and shows it on the favorites tab', async ({ page }) => {
    await page.goto('/')
    const first = block(page)
    await first.favorite.click()

    await expect(first.favorite).toHaveAttribute('aria-pressed', 'true')
    await expect(first.root).toHaveClass(/is-favorite/)

    const tab = page.getByRole('link', { name: /Вибране/ })
    await expect(tab).toContainText('1')
    await tab.click()

    await expect(page).toHaveURL(/\/favorites$/)
    await expect(page.getByRole('heading', { name: 'Вибране' })).toBeVisible()
    const favorite = block(page)
    await expect(favorite.root.getByRole('heading', { name: /Київ/ })).toBeVisible()
    await expect(favorite.search).toHaveCount(0)

    await favorite.mode('5 днів').click()
    await expect(favorite.days).toHaveCount(5)
  })

  test('keeps favorites after reload and removes them from the tab', async ({ page }) => {
    await page.goto('/')
    await block(page).favorite.click()
    await page.goto('/favorites')
    await expect(block(page).root).toBeVisible()

    await block(page).favorite.click()
    await expect(page.getByText('У вибраному поки порожньо')).toBeVisible()
    await page.getByRole('button', { name: 'Знайти місто' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('asks to remove a city when the limit is reached', async ({ page }) => {
    await page.addInitScript((cities) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('vw:favorites', JSON.stringify(cities))
        sessionStorage.setItem('seeded', '1')
      }
    }, SAVED_CITIES)
    await page.goto('/')

    await block(page).favorite.click()
    const dialog = page.getByRole('dialog', { name: 'Вибране заповнене' })
    await expect(dialog).toContainText(
      'Для додавання Київ видаліть одне з цих міст, тому що максимум 5.',
    )
    await expect(dialog.getByRole('listitem')).toHaveCount(5)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(block(page).favorite).toHaveAttribute('aria-pressed', 'false')

    await block(page).favorite.click()
    await dialog.getByRole('listitem').filter({ hasText: 'City 1' }).getByRole('button').click()
    await expect(dialog).toBeHidden()
    await expect(block(page).favorite).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('link', { name: /Вибране/ }).click()
    await expect(page.getByRole('article')).toHaveCount(5)
    await expect(page.getByRole('heading', { name: /City 1$/ })).toHaveCount(0)
  })
})
