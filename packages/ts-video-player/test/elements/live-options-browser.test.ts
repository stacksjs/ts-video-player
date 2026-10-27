import { expect, it } from 'bun:test'
import { browser } from '../browser-fixture'

it('applies boolean attributes to the same custom player and hides disabled controls across reconnects', async () => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { document.querySelector('#host').innerHTML = '<video-player controls autoplay loop muted keep-alive><video-skin><media-play-button slot="left"></media-play-button></video-skin></video-player>'; api.registerElements(); window.element = document.querySelector('video-player'); window.player = element.player; window.skin = element.querySelector('video-skin'); })()`)
    await wait('!!skin.shadowRoot && getComputedStyle(skin).display !== "none"')
    expect(await view.evaluate<boolean[]>('[player.state.controls, player.state.autoplay, player.state.loop]')).toEqual([true, true, true])
    await view.evaluate('(() => { element.removeAttribute("controls"); element.removeAttribute("autoplay"); element.removeAttribute("loop"); })()')
    await wait('getComputedStyle(skin).display === "none" && skin.inert')
    expect(await view.evaluate<boolean[]>('[element.player === player, player.state.controls, player.state.autoplay, player.state.loop]')).toEqual([true, false, false, false])
    // A normal controls-visibility notification must not re-enable disabled UI.
    await view.evaluate('player.el.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }))')
    await wait('getComputedStyle(skin).display === "none" && skin.inert')
    expect(await view.evaluate<boolean>('player.state.controlsVisible')).toBe(false)
    await view.evaluate('element.remove()')
    await Bun.sleep(20)
    await view.evaluate('(() => { element.setAttribute("controls", ""); element.setAttribute("loop", ""); document.querySelector("#host").append(element); })()')
    await wait('getComputedStyle(skin).display !== "none" && !skin.inert')
    expect(await view.evaluate<boolean[]>('[element.player === player, element.querySelector("video-skin") === skin, player.state.controls, player.state.loop, player.state.autoplay]')).toEqual([true, true, true, true, false])
  }
  finally { page.close() }
}, 90_000)

it('honors controls absent at creation and live autoplay/loop on real media without rebuilding the player', async () => {
  const page = await browser()
  const { view, wait } = page
  try {
    await view.evaluate(`(() => { api.registerElements(); document.querySelector('#host').innerHTML = '<video-player src="/tone.wav" muted keep-alive><video-skin></video-skin></video-player>'; window.element = document.querySelector('video-player'); window.player = element.player; window.skin = element.querySelector('video-skin'); window.ends = 0; element.addEventListener('ended', () => window.ends++); })()`)
    await wait('player.state.canPlay && getComputedStyle(skin).display === "none"')
    expect(await view.evaluate<boolean>('player.state.controls')).toBe(false)
    await view.evaluate('(() => { window.provider = player.provider; element.setAttribute("loop", ""); element.setAttribute("autoplay", ""); element.setAttribute("controls", ""); })()')
    await wait('window.ends >= 2 && getComputedStyle(skin).display !== "none"')
    await view.evaluate('(() => { element.removeAttribute("loop"); element.removeAttribute("autoplay"); })()')
    await wait('player.state.ended && player.state.paused')
    await view.evaluate('element.setAttribute("src", "/another.wav")')
    await wait('player.state.canPlay && player.state.src === "/another.wav"')
    await Bun.sleep(120)
    expect(await view.evaluate<boolean[]>('[element.player === player, player.provider === provider, player.state.paused, player.state.loop, player.state.autoplay]')).toEqual([true, true, true, false, false])
  }
  finally { page.close() }
}, 90_000)
