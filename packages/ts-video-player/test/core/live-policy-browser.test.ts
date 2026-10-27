import { expect, it } from 'bun:test'
import { browser } from '../browser-fixture'

it('updates public controls/loop/autoplay state without replacing a directly created player', async () => {
  const page = await browser()
  try {
    await page.view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { controls: false, loop: true, autoplay: true }); window.initial = player; })()`)
    expect(await page.view.evaluate<boolean[]>('[player.state.controls, player.state.controlsVisible, player.state.loop, player.state.autoplay]')).toEqual([false, false, true, true])
    await page.view.evaluate('(() => { player.setControls(true); player.setLoop(false); player.setAutoplay(false); })()')
    expect(await page.view.evaluate<boolean[]>('[player === initial, player.state.controls, player.state.loop, player.state.autoplay]')).toEqual([true, true, false, false])
    await page.view.evaluate('(() => { player.destroy(); window.saved = player.state; player.setControls(false); player.setLoop(true); player.setAutoplay(true); })()')
    expect(await page.view.evaluate<boolean>('player.state === saved')).toBe(true)
  }
  finally { page.close() }
}, 60_000)

it('changes loop policy on a real media provider and retains player/provider identity across sources', async () => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { src: '/tone.wav', muted: true, loop: true }); window.ends = 0; player.on('ended', () => window.ends++); })()`)
    await wait('player.state.canPlay && !!player.provider')
    await view.evaluate('(() => { window.initial = player; window.provider = player.provider; window.media = provider.mediaElement; })()')
    expect(await view.evaluate<boolean>('media.loop')).toBe(false)
    await view.evaluate('player.play()')
    await wait('window.ends >= 2')
    await view.evaluate('player.setLoop(false)')
    await wait('player.state.ended && player.state.paused')
    const ends = await view.evaluate<number>('window.ends')
    await Bun.sleep(500)
    expect(await view.evaluate<number>('window.ends')).toBe(ends)
    await view.evaluate('player.setSrc("/another.wav")')
    await wait('player.state.canPlay && player.state.src === "/another.wav"')
    expect(await view.evaluate<boolean[]>('[player === initial, player.provider === provider, player.provider.mediaElement === media, player.state.loop]')).toEqual([true, true, true, false])
  }
  finally { page.close() }
}, 60_000)

it('starts a ready source when autoplay is enabled and does not auto-start later sources when disabled', async () => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { src: '/tone.wav', muted: true }); })()`)
    await wait('player.state.canPlay')
    await view.evaluate('player.setAutoplay(true)')
    await wait('player.state.playing')
    await view.evaluate('player.setAutoplay(false)')
    expect(await view.evaluate<boolean[]>('[player.state.paused, player.provider.mediaElement.paused]')).toEqual([false, false])
    await view.evaluate('(() => { player.pause(); return player.setSrc("/next.wav"); })()')
    await wait('player.state.canPlay && player.state.src === "/next.wav"')
    await Bun.sleep(150)
    expect(await view.evaluate<boolean[]>('[player.state.autoplay, player.state.paused, player.provider.mediaElement.autoplay]')).toEqual([false, true, false])
  }
  finally { page.close() }
}, 60_000)

it.each(['pause', 'destroy'])('does not start a delayed provider after %s', async (operation) => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { src: '/hold', muted: true, autoplay: true }); window.plays = 0; player.on('play', () => window.plays++); })()`)
    await wait('typeof window.releaseLoad === "function"')
    await view.evaluate(`(() => { player.${operation}(); window.releaseLoad(); })()`)
    if (operation === 'pause') {
      await wait('player.state.canPlay')
      await Bun.sleep(150)
      expect(await view.evaluate<boolean[]>('[player.state.autoplay, player.state.paused, player.provider.mediaElement.paused]')).toEqual([true, true, true])
    }
    else {
      await wait('window.providerDestroys === 1')
      expect(await view.evaluate<boolean>('player.provider === null')).toBe(true)
    }
    expect(await view.evaluate<number>('window.plays')).toBe(0)
  }
  finally { page.close() }
}, 90_000)

it.each([false, true])('cancels queued autoplay without losing an explicit play request (manual=%s)', async (manual) => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { src: '/hold', muted: true, autoplay: true, loop: true }); })()`)
    await wait('typeof window.releaseLoad === "function"')
    if (manual) await view.evaluate('player.play()')
    await view.evaluate('(() => { player.setAutoplay(false); player.setLoop(false); window.releaseLoad(); })()')
    await wait('player.state.canPlay')
    if (manual) await wait('player.state.playing')
    else await Bun.sleep(120)
    expect(await view.evaluate<boolean[]>('[player.state.paused, player.state.autoplay, player.state.loop]')).toEqual([!manual, false, false])
    expect(await view.evaluate<Array<{ autoplay: boolean, loop: boolean }>>('window.factoryOptions')).toEqual([{ autoplay: false, loop: false }])
  }
  finally { page.close() }
}, 60_000)

it('enables autoplay while a provider loads, without duplicate starts', async () => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { window.player = new api.Player(document.querySelector('#host'), { src: '/hold', muted: true }); })()`)
    await wait('typeof window.releaseLoad === "function"')
    await view.evaluate('(() => { window.plays = 0; player.on("play", () => window.plays++); player.setAutoplay(true); player.setAutoplay(true); window.releaseLoad(); })()')
    await wait('player.state.playing')
    expect(await view.evaluate<number>('window.plays')).toBe(1)
  }
  finally { page.close() }
}, 60_000)
