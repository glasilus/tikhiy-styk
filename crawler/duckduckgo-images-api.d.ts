declare module 'duckduckgo-images-api' {
  interface SearchOptions {
    query: string
    moderate?: boolean
    iterations?: number
    retries?: number
  }
  function images(options: SearchOptions): Promise<unknown[]>
  export = images
}
