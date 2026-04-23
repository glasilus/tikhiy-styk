uniform sampler2D tSnail;
uniform float sortProgress;
uniform float time;
varying vec2 vUv;

void main() {
  if (sortProgress < 0.001) {
    gl_FragColor = texture2D(tSnail, vUv);
    return;
  }

  vec4 col = texture2D(tSnail, vUv);
  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));

  float offsetY = (luma - 0.5) * sortProgress * 0.5;
  offsetY += sin(vUv.x * 8.0 + time * 0.3) * sortProgress * 0.02;

  vec2 sortedUv = vec2(vUv.x, clamp(vUv.y + offsetY, 0.0, 1.0));
  gl_FragColor = texture2D(tSnail, sortedUv);
}
