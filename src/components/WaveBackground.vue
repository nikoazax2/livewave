<template>
  <div class="wave-bg" aria-hidden="true">
    <canvas ref="canvas"></canvas>
    <div v-if="image" class="wave-bg__image" :style="{ backgroundImage: `url(${image})` }"></div>
    <div class="wave-bg__vignette"></div>
  </div>
</template>

<script>
const vertexShader = `
  uniform float uTime;
  uniform float uPulse;
  uniform vec2 uMouse;
  attribute float aScale;
  varying float vElevation;
  varying float vDepth;

  void main() {
    vec3 p = position;
    float d = length(p.xz - uMouse * vec2(18.0, 10.0));
    float ripple = sin(d * 0.9 - uTime * 4.0) * exp(-d * 0.18) * uPulse * 1.6;
    float e = sin(p.x * 0.28 + uTime * 0.7) * 0.9
            + sin(p.z * 0.42 + uTime * 0.9) * 0.6
            + sin((p.x + p.z) * 0.18 + uTime * 0.5) * 0.8
            + ripple;
    p.y += e;
    vElevation = e;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_PointSize = aScale * (1.0 + uPulse * 0.6) * (70.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying float vElevation;
  varying float vDepth;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, r);
    float t = clamp(vElevation * 0.35 + 0.5, 0.0, 1.0);
    vec3 col = mix(uColorA, uColorB, t);
    col = mix(col, uColorC, smoothstep(0.7, 1.0, t));
    float fade = smoothstep(60.0, 12.0, vDepth);
    gl_FragColor = vec4(col, glow * fade * 0.9);
  }
`;

export default {
  name: "WaveBackground",
  props: {
    image: { type: String, default: null },
  },
  async mounted() {
    const THREE = await import("three");
    if (this.destroyed) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = this.$refs.canvas;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05060f, 20, 60);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 6, 16);
    camera.lookAt(0, 0, -4);

    const cols = window.innerWidth < 600 ? 90 : 160;
    const rows = window.innerWidth < 600 ? 60 : 90;
    const positions = new Float32Array(cols * rows * 3);
    const scales = new Float32Array(cols * rows);
    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        positions[i * 3] = (x / cols - 0.5) * 60;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (z / rows - 0.5) * 40 - 8;
        scales[i] = 0.6 + Math.random() * 0.9;
        i++;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color("#2b5cff") },
      uColorB: { value: new THREE.Color("#8b3dff") },
      uColorC: { value: new THREE.Color("#ff3d8b") },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = new THREE.Vector2(0, 0);
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      mouse.set((p.clientX / window.innerWidth) * 2 - 1, (p.clientY / window.innerHeight) * 2 - 1);
    };
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const onPulse = () => {
      uniforms.uPulse.value = 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("livewave:pulse", onPulse);
    onResize();

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;
      uniforms.uPulse.value *= 0.965;
      uniforms.uMouse.value.lerp(mouse, 0.04);
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (6 - mouse.y * 1.2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -4);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        clock.getDelta();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      uniforms.uTime.value = 2;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("livewave:pulse", onPulse);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  },
  beforeUnmount() {
    this.destroyed = true;
    this.cleanup?.();
  },
};
</script>

<style scoped lang="scss">
.wave-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at 50% 0%, #1a1440 0%, #070818 55%, #05060f 100%);
  pointer-events: none;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.wave-bg__image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.35;
  mix-blend-mode: screen;
  filter: saturate(1.2) blur(2px);
}

.wave-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(5, 6, 15, 0.85) 100%);
}
</style>
