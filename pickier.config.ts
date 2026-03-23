import type { PickierConfig } from 'pickier'

const config: Partial<PickierConfig> = {
  pluginRules: {
    'no-console': 'off',
    // Disable rules that trigger false positives on CSS/HTML inside template strings
    'style/max-statements-per-line': 'off',
    'style/brace-style': 'off',
    'indent': 'off',
    'style/indent': 'off',
    'quotes': 'off',
    'style/quotes': 'off',
  },

  ignores: [
    '**/node_modules/**',
    '**/dist/**',
  ],
}

export default config
