uniform sampler2D tInput;
uniform float warpAmp;
uniform float time;
varying vec2 vUv;

void main() {
  vec2 centered = vUv - 0.5;
  float dist = dot(centered, centered);

  vec2 warped = vUv + centered * dist * warpAmp;
  warped.x += sin(warped.y * 3.14159 + time * 0.1) * warpAmp * 0.25;
  warped = clamp(warped, 0.001, 0.999);

  gl_FragColor = texture2D(tInput, warped);
}
