import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.avito.st' },
      { protocol: 'https', hostname: '*.pexels.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  turbopack: {
    rules: {
      '*.glsl': { type: 'raw' },
      '*.vert.glsl': { type: 'raw' },
      '*.frag.glsl': { type: 'raw' },
    },
  },
}

export default config
