import { WebView } from 'bun'
import { expect } from 'bun:test'
import { join } from 'node:path'

let bundle: Promise<string> | undefined
function sourceBundle(): Promise<string> {
  return bundle ??= (async () => {
    const src = join(import.meta.dir, '../src')
    const result = await Bun.build({ entrypoints: ['policy-test'], target: 'browser', format: 'esm',
      plugins: [{ name: 'policy-test', setup(build) {
        build.onResolve({ filter: /^policy-test$/ }, () => ({ path: 'entry', namespace: 'policy' }))
        build.onLoad({ filter: /.*/, namespace: 'policy' }, () => ({ contents: `export { Player } from ${JSON.stringify(join(src, 'player.ts'))}; export { HTML5Provider, defaultLoaders } from ${JSON.stringify(join(src, 'providers/index.ts'))}; export { registerElements } from ${JSON.stringify(join(src, 'elements/index.ts'))};`, loader: 'ts' }))
      } }],
    })
    if (!result.success) throw new Error(result.logs.join('\n'))
    return result.outputs[0].text()
  })()
}

// Short, silent PCM media: real canplay/play/ended behavior without network or codecs.
function wave(): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(44 + 8000).fill(128)
  const data = new DataView(bytes.buffer)
  const text = (at: number, value: string) => [...value].forEach((char, i) => { bytes[at + i] = char.charCodeAt(0) })
  text(0, 'RIFF'); data.setUint32(4, bytes.length - 8, true); text(8, 'WAVE'); text(12, 'fmt ')
  data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 1, true)
  data.setUint32(24, 8000, true); data.setUint32(28, 8000, true); data.setUint16(32, 1, true); data.setUint16(34, 8, true)
  text(36, 'data'); data.setUint32(40, bytes.length - 44, true)
  return bytes
}

export async function browser(): Promise<{ view: WebView, wait: (expression: string) => Promise<void>, close: () => void }> {
  const js = await sourceBundle()
  const html = `<!doctype html><main id="host"></main><script type="module">
import { Player, HTML5Provider, defaultLoaders, registerElements } from '/player.js';
window.api = { Player, registerElements };
window.factoryOptions = [];
defaultLoaders.unshift({ type: 'video', canPlay: src => (typeof src === 'string' ? src : src.src).startsWith('/hold'), mediaType: () => 'audio',
  async load(container, options) {
    window.factoryOptions.push({ autoplay: options.autoplay, loop: options.loop });
    await new Promise(resolve => { window.releaseLoad = resolve });
    const provider = new HTML5Provider(); await provider.setup(container, options);
    const destroy = provider.destroy.bind(provider); provider.destroy = () => { window.providerDestroys = (window.providerDestroys || 0) + 1; destroy() };
    const load = provider.load.bind(provider); provider.load = () => load('/tone.wav');
    return provider;
  }
});
</script>`
  const server = Bun.serve({ port: 0, hostname: '127.0.0.1', fetch(request) {
    const path = new URL(request.url).pathname
    if (path === '/player.js') return new Response(js, { headers: { 'Content-Type': 'text/javascript' } })
    if (path.endsWith('.wav')) return new Response(wave(), { headers: { 'Content-Type': 'audio/wav' } })
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  } })
  const view = new WebView({ headless: true, backend: { type: 'chrome', url: false, argv: ['--autoplay-policy=no-user-gesture-required'] } })
  const wait = async (expression: string) => {
    for (let i = 0; i < 250; i++) {
      if (await view.evaluate(expression)) return
      await Bun.sleep(20)
    }
    expect(await view.evaluate(expression), expression).toBeTruthy()
  }
  const close = () => { view.close(); server.stop(true) }
  try { await view.navigate(server.url.href); await wait('!!window.api') }
  catch (error) { close(); throw error }
  return { view, wait, close }
}
