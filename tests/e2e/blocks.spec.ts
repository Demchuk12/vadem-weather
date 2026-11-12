import { expect, test } from './support/fixtures'
import { block, chooseCity, weatherBlocks } from './support/pages'

test.describe('multiple blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(block(page).temperature).toBeVisible()
  })

  test('adds blocks up to the limit of 5', async ({ page }) => {
    const add = page.getByRole('button', { name: /Додати блок/ })
    for (let i = 0; i < 4; i++) await add.click()

    await expect(weatherBlocks(page)).toHaveCount(5)
    await expect(page.getByRole('button', { name: /Максимум 5 блоків/ })).toBeDisabled()
    await expect(block(page, 4).root.getByText('Оберіть місто, щоб побачити погоду')).toBeVisible()
  })

  test('cannot remove the only block', async ({ page }) => {
    await expect(block(page).remove).toHaveCount(0)
  })

  test('asks for confirmation before removing a block', async ({ page }) => {
    await page.getByRole('button', { name: /Додати блок/ }).click()
    await chooseCity(block(page, 1).search, 'Льв', 'Львів')

    await block(page, 1).remove.click()
    const dialog = page.getByRole('dialog', { name: 'Видалити цей блок?' })
    await expect(dialog).toContainText('Блок погоди для міста Львів буде видалено.')

    await dialog.getByRole('button', { name: 'Скасувати' }).click()
    await expect(dialog).toBeHidden()
    await expect(weatherBlocks(page)).toHaveCount(2)

    await block(page, 1).remove.click()
    await page.keyboard.press('Escape')
    await expect(weatherBlocks(page)).toHaveCount(2)

    await block(page, 1).remove.click()
    await dialog.getByRole('button', { name: 'Видалити', exact: true }).click()
    await expect(weatherBlocks(page)).toHaveCount(1)
    await expect(block(page).search).toHaveValue('Київ')
  })

  test('keeps blocks after reload', async ({ page }) => {
    await page.getByRole('button', { name: /Додати блок/ }).click()
    await chooseCity(block(page, 1).search, 'Од', 'Одеса')
    await page.reload()

    await expect(weatherBlocks(page)).toHaveCount(2)
    await expect(block(page, 1).search).toHaveValue('Одеса')
  })
})
