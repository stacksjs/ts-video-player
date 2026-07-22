import { describe, expect, it } from 'bun:test'

describe('CDN entry', () => {
  it('keeps browser registration isolated from server runtimes', async () => {
    const previous = (globalThis as { window?: unknown }).window
    delete (globalThis as { window?: unknown }).window
    await expect(import(`./cdn?server=${Date.now()}`)).resolves.toBeDefined()
    if (previous !== undefined) (globalThis as { window?: unknown }).window = previous
  })
})
