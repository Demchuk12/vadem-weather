import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { MAX_BLOCKS, STORAGE_KEYS } from '@/constants'
import { detectUserCity } from '@/services/location.service'
import { useBlocksStore } from '@/stores/blocks.store'
import { deferred, KYIV, LVIV } from './helpers'

vi.mock('@/services/location.service', () => ({ detectUserCity: vi.fn() }))

describe('blocks store', () => {
  beforeEach(() => vi.mocked(detectUserCity).mockReset())

  it('starts with one empty block', () => {
    const store = useBlocksStore()
    expect(store.blocks).toHaveLength(1)
    expect(store.blocks[0]?.city).toBeNull()
    expect(store.canRemove).toBe(false)
  })

  it(`adds blocks up to ${MAX_BLOCKS}`, () => {
    const store = useBlocksStore()
    for (let i = 0; i < MAX_BLOCKS + 2; i++) store.add()
    expect(store.blocks).toHaveLength(MAX_BLOCKS)
    expect(store.canAdd).toBe(false)
  })

  it('removes a block but always keeps one', () => {
    const store = useBlocksStore()
    store.add()
    const [first, second] = store.blocks
    store.remove(second!.id)
    expect(store.blocks.map((b) => b.id)).toEqual([first!.id])
    store.remove(first!.id)
    expect(store.blocks).toHaveLength(1)
  })

  it('sets a city for a block and persists blocks', async () => {
    const store = useBlocksStore()
    store.setCity(store.blocks[0]!.id, LVIV)
    await nextTick()
    expect(store.blocks[0]?.city).toEqual(LVIV)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.blocks)!)[0].city).toEqual(LVIV)
  })

  it('restores saved blocks', () => {
    localStorage.setItem(
      STORAGE_KEYS.blocks,
      JSON.stringify([
        { id: 'a', city: KYIV },
        { id: 'b', city: null },
      ]),
    )
    expect(useBlocksStore().blocks.map((b) => b.id)).toEqual(['a', 'b'])
  })

  it('ignores invalid saved blocks', () => {
    localStorage.setItem(STORAGE_KEYS.blocks, JSON.stringify([]))
    expect(useBlocksStore().blocks).toHaveLength(1)
  })

  it('detects the default city for the first empty block', async () => {
    const request = deferred<typeof KYIV>()
    vi.mocked(detectUserCity).mockReturnValue(request.promise)
    const store = useBlocksStore()

    const done = store.detectDefaultCity()
    expect(store.isDetecting).toBe(true)
    request.resolve(KYIV)
    await done

    expect(store.isDetecting).toBe(false)
    expect(store.blocks[0]?.city).toEqual(KYIV)
  })

  it('does not detect when the first block already has a city', async () => {
    const store = useBlocksStore()
    store.setCity(store.blocks[0]!.id, LVIV)
    await store.detectDefaultCity()
    expect(detectUserCity).not.toHaveBeenCalled()
  })

  it('keeps a city chosen by the user while detection is running', async () => {
    const request = deferred<typeof KYIV>()
    vi.mocked(detectUserCity).mockReturnValue(request.promise)
    const store = useBlocksStore()

    const done = store.detectDefaultCity()
    store.setCity(store.blocks[0]!.id, LVIV)
    request.resolve(KYIV)
    await done

    expect(store.blocks[0]?.city).toEqual(LVIV)
  })
})
