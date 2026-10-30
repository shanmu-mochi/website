/* iteration 34: ink bloom renderer (WebGL, reduced resolution, redrawn only when progress changes).
   Credits: 2D simplex noise "snoise" by Ian McEwan / Ashima Arts and Stefan Gustavson,
   https://github.com/ashima/webgl-noise (MIT License, (C) 2011 Ashima Arts, (C) 2011-2016 Stefan Gustavson),
   included verbatim below. Technique adapted from the precomputed-field threshold reveal
   (distance from origin roughened by fBm, thresholded at a rising level, with a softer second
   threshold ahead of it as the wet tide line) described at viberdy.dev/library/ink-bleed-reveal and the
   noise-threshold watercolour reveal at ink.niccolofanton.dev; no code copied from those two. */
const NOISE = `//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`
const FS = `precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uP; uniform sampler2D uTex; uniform vec2 uImg; uniform float uHas;
${NOISE}
float fbm(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
vec2 cover(vec2 uv) { float va = uRes.x / uRes.y, ia = uImg.x / uImg.y; vec2 r = vec2(min(va / ia, 1.), min(ia / va, 1.)); return uv * r + (1. - r) * .5; }
void main() {
  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 q = vec2(uv.x * asp, uv.y);
  float big = fbm(q * 1.5 + 3.1);                        // the slow wandering front
  float mid = fbm(q * 7. + 1.7);                         // feathered bumps along it
  float fib = fbm(vec2(q.x * 9., q.y * 5.) + 5.);     // paper fibre: ink wicks a little further up them
  float fine = snoise(q * 160.);                         // tooth of the paper
  float pi = clamp(uP / .62, 0., 1.), pm = clamp((uP - .46) / .5, 0., 1.);
  pi = pi * pi * (3. - 2. * pi);
  float h = uv.y + big * .15 + mid * .025 + fib * .01;
  float d = mix(-.2, 1.3, pi) - h;                       // > 0 inked
  float ink = smoothstep(-.004, .022, d + fine * .004);
  float halo = smoothstep(-.045, -.003, d + fib * .012) * (1. - ink);
  float pool = ink * exp(-max(d, 0.) * 60.);             // ink pools darker at the rim
  vec3 paper = vec3(.992, .988, .98);   // flat #fdfcfa: the page-wide grain overlay supplies the tooth, so no seam
  vec3 inkc = vec3(.102, .1, .098) * (1. + .08 * fbm(q * 3. + 9.)) * (1. - .4 * pool);
  vec3 col = mix(paper, vec3(.55, .545, .54), halo * halo * .28);   // pale diffusion into the fibres
  col = mix(col, inkc, ink);
  col += fine * .01 * ink;                               // grain shows through the ink
  // the ink resolves into the painting through the same fibres
  float h2 = uv.y + fbm(q * 1.4 + 11.) * .16 + fib * .035;
  float d2 = mix(-.3, 1.3, pm) - h2;
  float m = smoothstep(0., .06, d2) * uHas;
  vec3 img = texture2D(uTex, cover(vec2(uv.x, 1. - uv.y))).rgb;
  float stain = exp(-max(d2, 0.) * 22.);
  col = mix(col, img * (1. - .35 * stain), m);
  gl_FragColor = vec4(col, 1.);
}`
const VS = 'attribute vec2 p; varying vec2 vUv; void main() { vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }'

export function makeInk(canvas, src) {
  let gl = null
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }) } catch (e) { gl = null }
  if (!gl) return null
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o }
  let pr
  try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link') } catch (e) { console.warn('ink bloom: no shader', e); return null }
  gl.useProgram(pr); gl.disable(gl.DITHER)
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0)
  const U = (n) => gl.getUniformLocation(pr, n)
  const uRes = U('uRes'), uP = U('uP'), uImg = U('uImg'), uHas = U('uHas')
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([240, 238, 232, 255]))
  ;[gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  let has = 0, iw = 1, ih = 1, last = -1, dirty = true
  if (src) { const im = new Image(); im.decoding = 'async'; im.onload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); iw = im.naturalWidth; ih = im.naturalHeight; has = 1; dirty = true }; im.src = src }
  const draw = (p) => {
    gl.useProgram(pr)
    const sc = Math.min(0.6, 900 / Math.max(1, canvas.clientWidth))   // reduced resolution
    const w = Math.max(2, Math.round(canvas.clientWidth * sc)), h = Math.max(2, Math.round(canvas.clientHeight * sc))
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true }
    if (!dirty && Math.abs(p - last) < 0.0005) return
    last = p; dirty = false
    gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h); gl.uniform1f(uP, p); gl.uniform2f(uImg, iw, ih); gl.uniform1f(uHas, has)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  return { draw, dispose: () => { gl.deleteProgram(pr) } }
}
