uniform sampler2D tCurrent;
uniform sampler2D tPrev;
uniform float glitchIntensity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float blockSize = 16.0 / resolution.y;
  vec2 blockUv = floor(vUv / blockSize) * blockSize;

  vec4 prev = texture2D(tPrev, blockUv);
  vec4 curr = texture2D(tCurrent, blockUv);
  vec2 motionVec = (curr.rg - prev.rg) * glitchIntensity * 0.4;

  motionVec += (vec2(rand(blockUv + time), rand(blockUv - time)) - 0.5)
               * glitchIntensity * 0.02;

  vec4 datamoshed = texture2D(tCurrent, vUv + motionVec);

  gl_FragColor = mix(datamoshed, prev, glitchIntensity * 0.55);
}
