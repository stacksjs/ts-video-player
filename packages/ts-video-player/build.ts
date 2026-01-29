/**
 * Build script for ts-video-player
 */

import { build } from 'bun'

async function main() {
  console.log('Building ts-video-player...')

  // Build ESM
  await build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'browser',
    format: 'esm',
    splitting: true,
    sourcemap: 'external',
    minify: false,
  })

  // Build minified for CDN
  await build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'browser',
    format: 'esm',
    naming: '[name].min.[ext]',
    sourcemap: 'external',
    minify: true,
  })

  // Build stx integration separately
  await build({
    entrypoints: ['./src/stx/index.ts'],
    outdir: './dist/stx',
    target: 'browser',
    format: 'esm',
    sourcemap: 'external',
    minify: false,
  })

  // Generate type declarations
  const proc = Bun.spawn(['bunx', 'tsc', '--emitDeclarationOnly'], {
    cwd: import.meta.dir,
    stdout: 'inherit',
    stderr: 'inherit',
  })
  await proc.exited

  console.log('Build complete!')
}

main().catch(console.error)
