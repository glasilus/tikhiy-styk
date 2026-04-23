import * as THREE from 'three'

export class RenderTargetPool {
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  private current = 0

  constructor(width: number, height: number) {
    const opts: THREE.RenderTargetOptions = {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    }
    this.targets = [
      new THREE.WebGLRenderTarget(width, height, opts),
      new THREE.WebGLRenderTarget(width, height, opts),
    ]
  }

  get read(): THREE.WebGLRenderTarget { return this.targets[this.current] }
  get write(): THREE.WebGLRenderTarget { return this.targets[1 - this.current] }

  swap(): void { this.current = 1 - this.current }

  resize(width: number, height: number): void {
    this.targets[0].setSize(width, height)
    this.targets[1].setSize(width, height)
  }

  dispose(): void {
    this.targets[0].dispose()
    this.targets[1].dispose()
  }
}
