/* iteration 34/36: ink bloom renderer (WebGL). Iteration 36: full device-pixel resolution, two passes:
   the static fibre/height field is rendered once into a texture (16-bit height packed in RG), and each
   frame only thresholds it (a few texture reads), so the gesture is cheap and the edge is crisp.
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
const FIELD = `precision highp float;
varying vec2 vUv; uniform vec2 uRes;
${NOISE}
float fbm5(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
float fbm3(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 3; i++) { s += a * snoise(p); p = p * 2.07 + 31.7; a *= .5; } return s; }
void main() {
  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 q = vec2(uv.x * asp, uv.y);
  float big = fbm5(q * 1.5 + 3.1);                       // the slow wandering front
  float mid = fbm3(q * 7. + 1.7);                        // feathered bumps along it
  float fib = fbm3(vec2(q.x * 26., q.y * 11.) + 5.);     // paper fibre: ink wicks a little further up them
  float fine = fbm3(q * 70. + 2.3);                      // tooth of the paper (band-limited, no aliasing)
  float h = uv.y + big * .15 + mid * .03 + fib * .008 + fine * .0025;
  float e = clamp((h + .3) / 1.7, 0., 1.) * 65535.;      // 16-bit height in RG
  float hi = floor(e / 256.), lo = e - hi * 256.;
  gl_FragColor = vec4(hi / 255., lo / 255., fib * .5 + .5, fine * .5 + .5);
}`
const FS = `precision highp float;
varying vec2 vUv; uniform vec2 uRes; uniform float uP; uniform sampler2D uF;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec4 f = texture2D(uF, vUv);
  float h = (f.r * 255. * 256. + f.g * 255.) / 65535. * 1.7 - .3;
  float fib = f.b * 2. - 1., fine = f.a * 2. - 1.;
  float px = 1. / uRes.y;                                 // one device pixel, for the anti-aliased edge
  float d = mix(-.25, 1.36, uP) - h;                     // > 0 inked
  float ink = smoothstep(-1.2 * px, 1.2 * px + .0015, d);
  float halo = smoothstep(-.03, 0., d + fib * .01) * (1. - ink);
  float pool = ink * exp(-max(d, 0.) * 70.);             // ink pools darker at the rim
  vec3 paper = vec3(.992, .988, .98);                    // #fdfcfa; the page-wide grain overlay supplies the tooth
  vec3 inkc = vec3(.102, .1, .098) * (1. + .05 * fine * (1. - pool)) * (1. - .35 * pool);
  vec3 col = mix(paper, vec3(.62, .61, .6), halo * halo * .22);   // pale wet diffusion into the fibres
  col = mix(col, inkc, ink);
  col += (hash(gl_FragCoord.xy) - .5) / 255.;            // dither: no banding in the halo
  gl_FragColor = vec4(col, 1.);
}`
const VS = 'attribute vec2 p; varying vec2 vUv; void main() { vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }'

export function makeInk(canvas) {
  let gl = null
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }) } catch (e) { gl = null }
  if (!gl) return null
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o }
  const prog = (fs) => { const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link'); return pr }
  let pf, pr
  try { pf = prog(FIELD); pr = prog(FS) } catch (e) { console.warn('ink bloom: no shader', e); return null }
  gl.disable(gl.DITHER)
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const bind = (p) => { gl.useProgram(p); const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0) }
  const tex = gl.createTexture(), fb = gl.createFramebuffer()
  let fw = 0, fh = 0, last = -1
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)                // full device pixels (capped at 2x)
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
    if (fw === w && fh === h) return
    // the static field, once per size
    fw = w; fh = h; last = -1
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    ;[gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    bind(pf); gl.viewport(0, 0, w, h); gl.uniform2f(gl.getUniformLocation(pf, 'uRes'), w, h); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
  const draw = (p) => {
    size()
    if (Math.abs(p - last) < 0.0002) return
    last = p
    bind(pr); gl.viewport(0, 0, fw, fh)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(gl.getUniformLocation(pr, 'uF'), 0); gl.uniform2f(gl.getUniformLocation(pr, 'uRes'), fw, fh); gl.uniform1f(gl.getUniformLocation(pr, 'uP'), p)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  return { draw, prepare: size, dispose: () => { gl.deleteProgram(pf); gl.deleteProgram(pr); gl.deleteTexture(tex); gl.deleteFramebuffer(fb) } }
}
