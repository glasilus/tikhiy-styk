uniform sampler2D tFrame0;
uniform sampler2D tFrame1;
uniform sampler2D tFrame2;
uniform sampler2D tFrame3;
uniform float smearIntensity;
varying vec2 vUv;

void main() {
  if (smearIntensity < 0.001) {
    gl_FragColor = texture2D(tFrame0, vUv);
    return;
  }

  vec4 f0 = texture2D(tFrame0, vUv);
  vec4 f1 = texture2D(tFrame1, vUv);
  vec4 f2 = texture2D(tFrame2, vUv);
  vec4 f3 = texture2D(tFrame3, vUv);

  vec4 smeared = f0 * 0.50 + f1 * 0.27 + f2 * 0.14 + f3 * 0.09;

  gl_FragColor = mix(f0, smeared, smearIntensity);
}
