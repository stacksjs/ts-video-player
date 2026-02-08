interface VideoConfig {
  verbose: boolean
  [key: string]: unknown
}
import { loadConfig } from 'bunfig'

export const defaultConfig: VideoConfig = {
  verbose: true,
}

// Lazy-loaded config to avoid top-level await (enables bun --compile)
let _config: VideoConfig | null = null

export async function getConfig(): Promise<VideoConfig> {
  if (!_config) {
    _config = await loadConfig({
  name: 'video',
  defaultConfig,
})
  }
  return _config
}

// For backwards compatibility - synchronous access with default fallback
export const config: VideoConfig = defaultConfig
