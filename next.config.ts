import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.avito.st' },
      { protocol: 'https', hostname: '*.pexels.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '*.inaturalist.org' },
      { protocol: 'https', hostname: 'inaturalist-open-data.s3.amazonaws.com' },
    ],
  },
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
}

export default config
