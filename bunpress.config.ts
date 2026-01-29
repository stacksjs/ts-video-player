import type { BunPressOptions } from '@stacksjs/bunpress'

const config: BunPressOptions = {
  verbose: true,

  docsDir: './docs',
  outDir: './dist',

  theme: 'vitepress',

  markdown: {
    title: 'ts-video-player',

    meta: {
      description: 'A modern, framework-agnostic video player with deep stx integration',
      author: 'Stacks.js, Inc.',
      viewport: 'width=device-width, initial-scale=1.0',
    },

    toc: {
      enabled: true,
      position: ['sidebar'],
      title: 'On This Page',
      minDepth: 2,
      maxDepth: 4,
      smoothScroll: true,
      activeHighlight: true,
      collapsible: true,
    },

    syntaxHighlightTheme: 'github-dark',

    preserveDirectoryStructure: true,

    features: {
      inlineFormatting: true,
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineHighlighting: true,
        lineNumbers: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
      codeGroups: true,
      codeImports: true,
      inlineToc: true,
      customAnchors: true,
      emoji: true,
      badges: true,
      includes: true,
      externalLinks: {
        autoTarget: true,
        autoRel: true,
        showIcon: true,
      },
      imageLazyLoading: true,
      tables: {
        alignment: true,
        enhancedStyling: true,
        responsive: true,
      },
    },

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Guide',
        activeMatch: '/guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Basic Usage', link: '/guide/usage' },
          { text: 'Configuration', link: '/guide/config' },
        ],
      },
      {
        text: 'Providers',
        activeMatch: '/providers',
        items: [
          { text: 'Overview', link: '/providers/' },
          { text: 'HTML5', link: '/providers/html5' },
          { text: 'YouTube', link: '/providers/youtube' },
          { text: 'Vimeo', link: '/providers/vimeo' },
          { text: 'HLS', link: '/providers/hls' },
          { text: 'DASH', link: '/providers/dash' },
        ],
      },
      {
        text: 'Plugins',
        activeMatch: '/plugins',
        items: [
          { text: 'Overview', link: '/plugins/' },
          { text: 'Analytics', link: '/plugins/analytics' },
          { text: 'Ads (VAST/VPAID)', link: '/plugins/ads' },
          { text: 'Skip Segments', link: '/plugins/skip-segments' },
          { text: 'End Screen', link: '/plugins/end-screen' },
          { text: 'Watermarks', link: '/plugins/watermarks' },
        ],
      },
      {
        text: 'API',
        activeMatch: '/api',
        items: [
          { text: 'Player', link: '/api/player' },
          { text: 'Events', link: '/api/events' },
          { text: 'State', link: '/api/state' },
        ],
      },
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is ts-video-player?', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/install' },
            { text: 'Quick Start', link: '/guide/usage' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Configuration', link: '/guide/config' },
            { text: 'Theming', link: '/guide/themes' },
            { text: 'Internationalization', link: '/guide/i18n' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard' },
          ],
        },
        {
          text: 'Providers',
          items: [
            { text: 'Overview', link: '/providers/' },
            { text: 'HTML5 Video', link: '/providers/html5' },
            { text: 'YouTube', link: '/providers/youtube' },
            { text: 'Vimeo', link: '/providers/vimeo' },
            { text: 'HLS Streaming', link: '/providers/hls' },
            { text: 'DASH Streaming', link: '/providers/dash' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Captions & Subtitles', link: '/features/captions' },
            { text: 'Thumbnails', link: '/features/thumbnails' },
            { text: 'Chapters', link: '/features/chapters' },
            { text: 'Quality Selection', link: '/features/quality' },
            { text: 'Picture-in-Picture', link: '/features/pip' },
            { text: 'Fullscreen', link: '/features/fullscreen' },
            { text: 'Remote Playback', link: '/features/remote-playback' },
            { text: 'Live Streaming', link: '/features/live' },
          ],
        },
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: 'Analytics', link: '/plugins/analytics' },
            { text: 'Ads (VAST/VPAID)', link: '/plugins/ads' },
            { text: 'Skip Segments', link: '/plugins/skip-segments' },
            { text: 'End Screen', link: '/plugins/end-screen' },
            { text: 'Watermarks', link: '/plugins/watermarks' },
          ],
        },
        {
          text: 'stx Integration',
          items: [
            { text: 'Video Directive', link: '/stx/directive' },
            { text: 'Components', link: '/stx/components' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Player', link: '/api/player' },
            { text: 'Events', link: '/api/events' },
            { text: 'State', link: '/api/state' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
    },
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://ts-video-player.netlify.app',
    filename: 'sitemap.xml',
    defaultPriority: 0.5,
    defaultChangefreq: 'monthly',
  },

  robots: {
    enabled: true,
    filename: 'robots.txt',
  },
}

export default config
