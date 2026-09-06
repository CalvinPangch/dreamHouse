/** Gradient sky dome + sun position helper (no addons required). */
import * as THREE from 'three';

const vert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const frag = /* glsl */ `
  uniform vec3 top;
  uniform vec3 bottom;
  uniform vec3 sun;
  uniform vec3 sunColor;
  uniform float offset;
  varying vec3 vWorld;
  void main() {
    vec3 dir = normalize(vWorld);
    float h = clamp((dir.y + offset) / (1.0 + offset), 0.0, 1.0);
    vec3 col = mix(bottom, top, pow(h, 0.75));
    float glow = pow(max(dot(dir, normalize(sun)), 0.0), 22.0);
    col += sunColor * glow * 0.9;
    float halo = pow(max(dot(dir, normalize(sun)), 0.0), 4.0);
    col += sunColor * halo * 0.15;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSky() {
  const uniforms = {
    top: { value: new THREE.Color(0x3f7fd0) },
    bottom: { value: new THREE.Color(0xdfeaf4) },
    sun: { value: new THREE.Vector3(0.4, 0.6, 0.7) },
    sunColor: { value: new THREE.Color(0xffd9a0) },
    offset: { value: 0.28 },
  };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 32, 20),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}
