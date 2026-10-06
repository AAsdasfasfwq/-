// Renderer + cinematic post chain (MSAA -> bloom -> ACES -> grade/grain/vignette/CA).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export const W = 1920, H = 1080;

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uSat: { value: 1 }, uContrast: { value: 1.05 },
    uTint: { value: new THREE.Vector3(1, 1, 1) }, uLift: { value: new THREE.Vector3(0, 0, 0) },
    uVignette: { value: .45 }, uGrain: { value: .06 }, uCA: { value: .0015 }, uFade: { value: 0 },
    uFlash: { value: 0 }, uFlashColor: { value: new THREE.Vector3(1, .97, .9) }, uBars: { value: 0 },
    uRes: { value: new THREE.Vector2(W, H) }, uBlur: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime,uSat,uContrast,uVignette,uGrain,uCA,uFade,uFlash,uBars,uBlur;
    uniform vec3 uTint,uLift,uFlashColor; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime*7.13) * 43758.5453); }
    void main(){
      vec2 uv = vUv; vec2 d = uv - .5;
      float ca = uCA * (1. + 2.*dot(d,d));
      vec3 c;
      if (uBlur > 0.) { // radial zoom blur for whip transitions
        c = vec3(0.); for (int i=0;i<10;i++){ float k = 1. - uBlur*float(i)/10.*.12; c += texture2D(tDiffuse, .5 + d*k).rgb; } c /= 10.;
      } else {
        c.r = texture2D(tDiffuse, uv - d*ca).r; c.g = texture2D(tDiffuse, uv).g; c.b = texture2D(tDiffuse, uv + d*ca).b;
      }
      float l = dot(c, vec3(.2126,.7152,.0722));
      c = mix(vec3(l), c, uSat);
      c = (c - .5) * uContrast + .5;
      c = c * uTint + uLift * (1. - c);
      float v = smoothstep(.95, .25, length(d * vec2(1.25, 1.)));
      c *= mix(1. - uVignette, 1., v);
      float g = h(uv * uRes) - .5;
      c += g * uGrain * (1. - l * .5);
      c = mix(c, uFlashColor, clamp(uFlash,0.,1.));
      c *= 1. - uFade;
      float bar = step(uv.y, uBars) + step(1. - uBars, uv.y);
      c = mix(c, vec3(0.), bar);
      gl_FragColor = vec4(max(c, 0.), 1.);
    }`,
};

export const DEFAULT_GRADE = { exposure: 1, sat: 1.05, contrast: 1.06, tint: [1, 1, 1], lift: [0, 0, 0], vignette: .45, grain: .055, ca: .0012, fade: 0, flash: 0, flashColor: [1, .97, .9], bars: 0, blur: 0, bloom: .55, bloomRadius: .5, bloomThreshold: .78 };

export class Engine {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(W, H, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .55, .5, .78);
    this.output = new OutputPass();
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.output);
    this.composer.addPass(this.grade);
    this.blank = new THREE.Scene(); this.blank.background = new THREE.Color(0);
    this.blankCam = new THREE.PerspectiveCamera();
  }
  render(scene, camera, g, frameSeed) {
    const u = this.grade.uniforms;
    this.renderer.toneMappingExposure = g.exposure;
    u.uTime.value = frameSeed % 1000; u.uSat.value = g.sat; u.uContrast.value = g.contrast;
    u.uTint.value.set(...g.tint); u.uLift.value.set(...g.lift); u.uVignette.value = g.vignette;
    u.uGrain.value = g.grain; u.uCA.value = g.ca; u.uFade.value = g.fade; u.uFlash.value = g.flash;
    u.uFlashColor.value.set(...g.flashColor); u.uBars.value = g.bars; u.uBlur.value = g.blur;
    this.bloom.strength = g.bloom; this.bloom.radius = g.bloomRadius; this.bloom.threshold = g.bloomThreshold;
    this.renderPass.scene = scene || this.blank;
    this.renderPass.camera = camera || this.blankCam;
    if (camera) { camera.aspect = W / H; camera.updateProjectionMatrix(); }
    this.composer.render();
  }
}

export function disposeScene(scene) {
  if (!scene) return;
  scene.traverse((o) => {
    if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) {
      if (m.userData.keep) continue;
      for (const k in m) { const v = m[k]; if (v && v.isTexture && !v.userData.keep) v.dispose(); }
      m.dispose();
    }
  });
}
