/**
 * Caption Styling
 *
 * Customizable caption/subtitle appearance.
 *
 * @module core/caption-styles
 */

// =============================================================================
// Types
// =============================================================================

export interface CaptionStyleOptions {
  /** Font family */
  fontFamily?: string
  /** Font size (CSS value) */
  fontSize?: string
  /** Font weight */
  fontWeight?: string | number
  /** Font color */
  fontColor?: string
  /** Text opacity (0-1) */
  fontOpacity?: number
  /** Background color */
  backgroundColor?: string
  /** Background opacity (0-1) */
  backgroundOpacity?: number
  /** Text edge style */
  edgeStyle?: 'none' | 'raised' | 'depressed' | 'uniform' | 'drop-shadow'
  /** Edge color */
  edgeColor?: string
  /** Window color (container background) */
  windowColor?: string
  /** Window opacity (0-1) */
  windowOpacity?: number
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right'
  /** Vertical position (percentage from bottom) */
  verticalPosition?: number
  /** Horizontal padding */
  horizontalPadding?: string
  /** Vertical padding */
  verticalPadding?: string
  /** Border radius */
  borderRadius?: string
  /** Line height */
  lineHeight?: string | number
  /** Letter spacing */
  letterSpacing?: string
}

export interface CaptionStylePreset {
  name: string
  styles: CaptionStyleOptions
}

// =============================================================================
// Default Values
// =============================================================================

export const defaultCaptionStyles: Required<CaptionStyleOptions> = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '1.5em',
  fontWeight: 'normal',
  fontColor: '#ffffff',
  fontOpacity: 1,
  backgroundColor: '#000000',
  backgroundOpacity: 0.75,
  edgeStyle: 'none',
  edgeColor: '#000000',
  windowColor: 'transparent',
  windowOpacity: 0,
  textAlign: 'center',
  verticalPosition: 10,
  horizontalPadding: '8px',
  verticalPadding: '4px',
  borderRadius: '4px',
  lineHeight: 1.4,
  letterSpacing: 'normal',
}

// =============================================================================
// Style Presets
// =============================================================================

export const captionPresets: Record<string, CaptionStylePreset> = {
  default: {
    name: 'Default',
    styles: {},
  },
  cinema: {
    name: 'Cinema',
    styles: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1.8em',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      edgeStyle: 'drop-shadow',
      edgeColor: '#000000',
    },
  },
  classic: {
    name: 'Classic',
    styles: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: '1.4em',
      fontColor: '#ffff00',
      backgroundColor: '#000000',
      backgroundOpacity: 0.8,
    },
  },
  highContrast: {
    name: 'High Contrast',
    styles: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '1.6em',
      fontWeight: 'bold',
      fontColor: '#ffff00',
      backgroundColor: '#000000',
      backgroundOpacity: 1,
      edgeStyle: 'uniform',
      edgeColor: '#000000',
    },
  },
  minimal: {
    name: 'Minimal',
    styles: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1.3em',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      edgeStyle: 'drop-shadow',
    },
  },
  netflix: {
    name: 'Netflix Style',
    styles: {
      fontFamily: 'Netflix Sans, Helvetica Neue, Helvetica, Arial, sans-serif',
      fontSize: '1.6em',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      edgeStyle: 'drop-shadow',
      edgeColor: '#000000',
    },
  },
  youtube: {
    name: 'YouTube Style',
    styles: {
      fontFamily: '"YouTube Noto", Roboto, Arial, Helvetica, sans-serif',
      fontSize: '1.5em',
      fontWeight: 500,
      backgroundColor: '#000000',
      backgroundOpacity: 0.75,
      borderRadius: '2px',
      horizontalPadding: '4px',
      verticalPadding: '2px',
    },
  },
}

// =============================================================================
// Caption Style Manager
// =============================================================================

export class CaptionStyleManager {
  private styles: CaptionStyleOptions
  private container: HTMLElement | null = null
  private styleElement: HTMLStyleElement | null = null

  constructor(initialStyles: CaptionStyleOptions = {}) {
    this.styles = { ...defaultCaptionStyles, ...initialStyles }
  }

  /**
   * Get current styles
   */
  getStyles(): CaptionStyleOptions {
    return { ...this.styles }
  }

  /**
   * Update styles
   */
  setStyles(styles: Partial<CaptionStyleOptions>): void {
    this.styles = { ...this.styles, ...styles }
    this.applyStyles()
  }

  /**
   * Apply a preset
   */
  applyPreset(presetName: string): void {
    const preset = captionPresets[presetName]
    if (preset) {
      this.styles = { ...defaultCaptionStyles, ...preset.styles }
      this.applyStyles()
    }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.styles = { ...defaultCaptionStyles }
    this.applyStyles()
  }

  /**
   * Attach to caption container
   */
  attach(container: HTMLElement): void {
    this.container = container
    this.applyStyles()
  }

  /**
   * Generate CSS from styles
   */
  generateCSS(selector = '.tsvp-captions'): string {
    const s = this.styles as Required<CaptionStyleOptions>

    // Build text shadow based on edge style
    let textShadow = 'none'
    switch (s.edgeStyle) {
      case 'raised':
        textShadow = `1px 1px 0 ${s.edgeColor}, 2px 2px 0 ${s.edgeColor}`
        break
      case 'depressed':
        textShadow = `-1px -1px 0 ${s.edgeColor}, -2px -2px 0 ${s.edgeColor}`
        break
      case 'uniform':
        textShadow = `
          -1px -1px 0 ${s.edgeColor},
          1px -1px 0 ${s.edgeColor},
          -1px 1px 0 ${s.edgeColor},
          1px 1px 0 ${s.edgeColor}
        `
        break
      case 'drop-shadow':
        textShadow = `2px 2px 4px ${s.edgeColor}, 0 0 8px rgba(0, 0, 0, 0.5)`
        break
    }

    // Build background with opacity
    const bgOpacity = Math.round(s.backgroundOpacity * 255).toString(16).padStart(2, '0')
    const bgColor = s.backgroundColor === 'transparent'
      ? 'transparent'
      : `${s.backgroundColor}${bgOpacity}`

    // Build font color with opacity
    const fontOpacity = Math.round(s.fontOpacity * 255).toString(16).padStart(2, '0')
    const fontColor = `${s.fontColor}${fontOpacity}`

    // Window background
    const windowOpacity = Math.round(s.windowOpacity * 255).toString(16).padStart(2, '0')
    const windowBg = s.windowColor === 'transparent'
      ? 'transparent'
      : `${s.windowColor}${windowOpacity}`

    return `
${selector} {
  --tsvp-captions-font-family: ${s.fontFamily};
  --tsvp-captions-font-size: ${s.fontSize};
  --tsvp-captions-font-weight: ${s.fontWeight};
  --tsvp-captions-text-color: ${fontColor};
  --tsvp-captions-bg: ${bgColor};
  --tsvp-captions-text-shadow: ${textShadow};
  --tsvp-captions-text-align: ${s.textAlign};
  --tsvp-captions-padding: ${s.verticalPadding} ${s.horizontalPadding};
  --tsvp-captions-radius: ${s.borderRadius};
  --tsvp-captions-line-height: ${s.lineHeight};
  --tsvp-captions-letter-spacing: ${s.letterSpacing};
  --tsvp-captions-bottom: ${s.verticalPosition}%;

  position: absolute;
  bottom: var(--tsvp-captions-bottom);
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
  text-align: var(--tsvp-captions-text-align);
  background: ${windowBg};
  padding: 8px;
  border-radius: 4px;
}

${selector} span,
${selector} .tsvp-caption-text {
  font-family: var(--tsvp-captions-font-family);
  font-size: var(--tsvp-captions-font-size);
  font-weight: var(--tsvp-captions-font-weight);
  color: var(--tsvp-captions-text-color);
  background: var(--tsvp-captions-bg);
  text-shadow: var(--tsvp-captions-text-shadow);
  padding: var(--tsvp-captions-padding);
  border-radius: var(--tsvp-captions-radius);
  line-height: var(--tsvp-captions-line-height);
  letter-spacing: var(--tsvp-captions-letter-spacing);
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
`
  }

  /**
   * Apply styles to container
   */
  private applyStyles(): void {
    if (!this.container) return

    // Remove existing style element
    if (this.styleElement) {
      this.styleElement.remove()
    }

    // Create new style element
    this.styleElement = document.createElement('style')
    this.styleElement.setAttribute('data-tsvp-caption-styles', 'true')
    this.styleElement.textContent = this.generateCSS()
    document.head.appendChild(this.styleElement)
  }

  /**
   * Get available presets
   */
  static getPresets(): CaptionStylePreset[] {
    return Object.values(captionPresets)
  }

  /**
   * Detach and cleanup
   */
  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
    this.container = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createCaptionStyleManager(styles?: CaptionStyleOptions): CaptionStyleManager {
  return new CaptionStyleManager(styles)
}

// =============================================================================
// Caption Settings Menu Component
// =============================================================================

export class CaptionSettingsMenu {
  private container: HTMLElement
  private manager: CaptionStyleManager
  private onChange: ((styles: CaptionStyleOptions) => void) | null = null

  constructor(manager: CaptionStyleManager) {
    this.manager = manager
    this.container = document.createElement('div')
    this.container.className = 'tsvp-caption-settings'
    this.render()
  }

  private render(): void {
    this.container.innerHTML = ''
    this.container.style.cssText = `
      padding: 16px;
      background: var(--tsvp-menu-bg, rgba(20, 20, 20, 0.95));
      border-radius: var(--tsvp-menu-radius, 8px);
      color: var(--tsvp-color-text, #ffffff);
      font-family: var(--tsvp-font-family, sans-serif);
      font-size: var(--tsvp-font-size, 14px);
    `

    const styles = this.manager.getStyles()

    // Preset selector
    this.addPresetSelector()

    // Font size
    this.addSlider('Font Size', 'fontSize', ['0.8em', '1em', '1.2em', '1.5em', '1.8em', '2em'], styles.fontSize || '1.5em')

    // Font color
    this.addColorPicker('Text Color', 'fontColor', styles.fontColor || '#ffffff')

    // Background opacity
    this.addSlider('Background', 'backgroundOpacity', ['0', '0.25', '0.5', '0.75', '1'], String(styles.backgroundOpacity ?? 0.75))

    // Edge style
    this.addSelect('Text Edge', 'edgeStyle', [
      { value: 'none', label: 'None' },
      { value: 'raised', label: 'Raised' },
      { value: 'depressed', label: 'Depressed' },
      { value: 'uniform', label: 'Uniform' },
      { value: 'drop-shadow', label: 'Drop Shadow' },
    ], styles.edgeStyle || 'none')

    // Reset button
    const resetBtn = document.createElement('button')
    resetBtn.textContent = 'Reset to Default'
    resetBtn.style.cssText = `
      width: 100%;
      margin-top: 16px;
      padding: 8px 16px;
      border: 1px solid var(--tsvp-color-border, rgba(255, 255, 255, 0.2));
      border-radius: var(--tsvp-radius-sm, 4px);
      background: transparent;
      color: var(--tsvp-color-text, #ffffff);
      cursor: pointer;
    `
    resetBtn.addEventListener('click', () => {
      this.manager.reset()
      this.render()
      if (this.onChange) {
        this.onChange(this.manager.getStyles())
      }
    })
    this.container.appendChild(resetBtn)
  }

  private addPresetSelector(): void {
    const row = this.createRow('Preset')
    const select = document.createElement('select')
    select.style.cssText = this.getInputStyle()

    for (const [key, preset] of Object.entries(captionPresets)) {
      const option = document.createElement('option')
      option.value = key
      option.textContent = preset.name
      select.appendChild(option)
    }

    select.addEventListener('change', () => {
      this.manager.applyPreset(select.value)
      this.render()
      if (this.onChange) {
        this.onChange(this.manager.getStyles())
      }
    })

    row.appendChild(select)
    this.container.appendChild(row)
  }

  private addSlider(label: string, key: keyof CaptionStyleOptions, values: string[], current: string): void {
    const row = this.createRow(label)
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '0'
    slider.max = String(values.length - 1)
    slider.value = String(values.indexOf(current))
    slider.style.cssText = 'flex: 1;'

    slider.addEventListener('input', () => {
      const value = values[Number.parseInt(slider.value, 10)]
      this.manager.setStyles({ [key]: key === 'backgroundOpacity' ? Number.parseFloat(value) : value })
      if (this.onChange) {
        this.onChange(this.manager.getStyles())
      }
    })

    row.appendChild(slider)
    this.container.appendChild(row)
  }

  private addColorPicker(label: string, key: keyof CaptionStyleOptions, current: string): void {
    const row = this.createRow(label)
    const input = document.createElement('input')
    input.type = 'color'
    input.value = current
    input.style.cssText = 'width: 40px; height: 30px; border: none; cursor: pointer;'

    input.addEventListener('input', () => {
      this.manager.setStyles({ [key]: input.value })
      if (this.onChange) {
        this.onChange(this.manager.getStyles())
      }
    })

    row.appendChild(input)
    this.container.appendChild(row)
  }

  private addSelect(label: string, key: keyof CaptionStyleOptions, options: Array<{ value: string, label: string }>, current: string): void {
    const row = this.createRow(label)
    const select = document.createElement('select')
    select.style.cssText = this.getInputStyle()

    for (const opt of options) {
      const option = document.createElement('option')
      option.value = opt.value
      option.textContent = opt.label
      option.selected = opt.value === current
      select.appendChild(option)
    }

    select.addEventListener('change', () => {
      this.manager.setStyles({ [key]: select.value as any })
      if (this.onChange) {
        this.onChange(this.manager.getStyles())
      }
    })

    row.appendChild(select)
    this.container.appendChild(row)
  }

  private createRow(label: string): HTMLElement {
    const row = document.createElement('div')
    row.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    `

    const labelEl = document.createElement('span')
    labelEl.textContent = label
    labelEl.style.opacity = '0.8'
    row.appendChild(labelEl)

    return row
  }

  private getInputStyle(): string {
    return `
      padding: 6px 10px;
      border: 1px solid var(--tsvp-color-border, rgba(255, 255, 255, 0.2));
      border-radius: var(--tsvp-radius-sm, 4px);
      background: rgba(0, 0, 0, 0.3);
      color: var(--tsvp-color-text, #ffffff);
    `
  }

  /**
   * Set change handler
   */
  onStyleChange(handler: (styles: CaptionStyleOptions) => void): void {
    this.onChange = handler
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.container
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.container.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createCaptionSettingsMenu(manager: CaptionStyleManager): CaptionSettingsMenu {
  return new CaptionSettingsMenu(manager)
}
