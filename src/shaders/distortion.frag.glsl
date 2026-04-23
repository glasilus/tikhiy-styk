uniform sampler2D tScreen;
uniform float distortProgress;
uniform float time;
varying vec2 vUv;

void main() {
  if (distortProgress < 0.001) {
    gl_FragColor = texture2D(tScreen, vUv);
    return;
  }

  float wave = sin(vUv.y * 22.0 + time * 4.0) * 0.018 * distortProgress;
  float skew = sin(vUv.y * 6.0 + time * 1.5) * 0.009 * distortProgress;

  vec2 distorted = vec2(vUv.x + wave + skew, vUv.y);
  distorted = clamp(distorted, 0.001, 0.999);

  gl_FragColor = texture2D(tScreen, distorted);
}
