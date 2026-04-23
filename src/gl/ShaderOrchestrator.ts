import * as THREE from 'three'
import { RenderTargetPool } from './RenderTargetPool'

import commonVert from '@/shaders/common.vert.glsl'
import datamoshFrag from '@/shaders/datamosh.frag.glsl'
import pixelsortFrag from '@/shaders/pixelsort.frag.glsl'
import warpFrag from '@/shaders/warp.frag.glsl'
import smearFrag from '@/shaders/smear.frag.glsl'
import distortionFrag from '@/shaders/distortion.frag.glsl'

export interface EffectState {
  glitchIntensity: number
  sortProgress: number
  warpAmp: number
  smearIntensity: number
  distortProgress: number
}

export class ShaderOrchestrator {
  private renderer: THREE.WebGLRenderer
  private pool: RenderTargetPool
  private smearPool: RenderTargetPool
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private quad: THREE.Mesh
  private time = 0
  private resolution: THREE.Vector2
  private isLowEnd: boolean

  private materials: {
    datamosh: THREE.ShaderMaterial
    pixelsort: THREE.ShaderMaterial
    warp: THREE.ShaderMaterial
    smear: THREE.ShaderMaterial
    distortion: THREE.ShaderMaterial
  }

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    const gl = this.renderer.getContext()
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const gpuRenderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : ''
    this.isLowEnd = /intel|mali-4|adreno 3/i.test(gpuRenderer)

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const rtW = Math.floor(w * 0.5)
    const rtH = Math.floor(h * 0.5)

    this.resolution = new THREE.Vector2(rtW, rtH)
    this.pool = new RenderTargetPool(rtW, rtH)
    this.smearPool = new RenderTargetPool(rtW, rtH)

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.scene = new THREE.Scene()

    const geo = new THREE.PlaneGeometry(2, 2)
    this.quad = new THREE.Mesh(geo)
    this.scene.add(this.quad)

    this.materials = this.buildMaterials()
    this.renderer.setSize(w, h, false)
  }

  private buildMaterials() {
    const base = { vertexShader: commonVert, transparent: true }
    return {
      datamosh: new THREE.ShaderMaterial({
        ...base, fragmentShader: datamoshFrag,
        uniforms: {
          tCurrent: { value: null }, tPrev: { value: null },
          glitchIntensity: { value: 0 }, time: { value: 0 },
          resolution: { value: this.resolution },
        },
      }),
      pixelsort: new THREE.ShaderMaterial({
        ...base, fragmentShader: pixelsortFrag,
        uniforms: {
          tSnail: { value: null }, sortProgress: { value: 0 }, time: { value: 0 },
        },
      }),
      warp: new THREE.ShaderMaterial({
        ...base, fragmentShader: warpFrag,
        uniforms: {
          tInput: { value: null }, warpAmp: { value: 0.04 }, time: { value: 0 },
        },
      }),
      smear: new THREE.ShaderMaterial({
        ...base, fragmentShader: smearFrag,
        uniforms: {
          tFrame0: { value: null }, tFrame1: { value: null },
          tFrame2: { value: null }, tFrame3: { value: null },
          smearIntensity: { value: 0 },
        },
      }),
      distortion: new THREE.ShaderMaterial({
        ...base, fragmentShader: distortionFrag,
        uniforms: {
          tScreen: { value: null }, distortProgress: { value: 0 }, time: { value: 0 },
        },
      }),
    }
  }

  hasActiveEffects(state: EffectState): boolean {
    return (
      state.glitchIntensity > 0.01 ||
      state.sortProgress > 0.01 ||
      state.warpAmp > 0.04 ||
      state.smearIntensity > 0.01 ||
      state.distortProgress > 0.01
    )
  }

  render(snailTexture: THREE.Texture, state: EffectState, dt: number): void {
    this.time += dt

    const r = this.renderer
    const m = this.materials

    m.warp.uniforms.tInput.value = snailTexture
    m.warp.uniforms.warpAmp.value = state.warpAmp
    m.warp.uniforms.time.value = this.time
    this.quad.material = m.warp
    r.setRenderTarget(this.pool.write)
    r.render(this.scene, this.camera)
    this.pool.swap()

    if (state.sortProgress > 0.01) {
      m.pixelsort.uniforms.tSnail.value = this.pool.read.texture
      m.pixelsort.uniforms.sortProgress.value = state.sortProgress
      m.pixelsort.uniforms.time.value = this.time
      this.quad.material = m.pixelsort
      r.setRenderTarget(this.pool.write)
      r.render(this.scene, this.camera)
      this.pool.swap()
    }

    if (!this.isLowEnd && state.glitchIntensity > 0.01) {
      m.datamosh.uniforms.tCurrent.value = this.pool.read.texture
      m.datamosh.uniforms.tPrev.value = this.smearPool.read.texture
      m.datamosh.uniforms.glitchIntensity.value = state.glitchIntensity
      m.datamosh.uniforms.time.value = this.time
      this.quad.material = m.datamosh
      r.setRenderTarget(this.pool.write)
      r.render(this.scene, this.camera)
      this.pool.swap()
    }

    if (!this.isLowEnd && state.smearIntensity > 0.01) {
      m.smear.uniforms.tFrame0.value = this.pool.read.texture
      m.smear.uniforms.tFrame1.value = this.smearPool.read.texture
      m.smear.uniforms.smearIntensity.value = state.smearIntensity
      this.quad.material = m.smear
      r.setRenderTarget(this.pool.write)
      r.render(this.scene, this.camera)
      this.pool.swap()
    }

    if (state.distortProgress > 0.01) {
      m.distortion.uniforms.tScreen.value = this.pool.read.texture
      m.distortion.uniforms.distortProgress.value = state.distortProgress
      m.distortion.uniforms.time.value = this.time
      this.quad.material = m.distortion
      r.setRenderTarget(this.pool.write)
      r.render(this.scene, this.camera)
      this.pool.swap()
    }

    this.smearPool.swap()

    this.quad.material = new THREE.MeshBasicMaterial({ map: this.pool.read.texture })
    r.setRenderTarget(null)
    r.render(this.scene, this.camera)
  }

  dispose(): void {
    this.pool.dispose()
    this.smearPool.dispose()
    this.renderer.dispose()
    Object.values(this.materials).forEach(m => m.dispose())
  }
}
