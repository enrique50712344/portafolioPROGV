import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef, type ReactNode } from 'react';
import { usePointer } from '../hooks/useMotion';

/* la escena reacciona al puntero y a la posición de scroll */
function Rig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();

  useFrame((_, dt) => {
    if (!group.current) return;
    const { x, y, sy } = pointer.current;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.38, 2.6, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.22, 2.6, dt);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, Math.min(sy, 1400) * 0.0016, 3, dt);
  });

  return <group ref={group}>{children}</group>;
}

function CentralSculpture() {
  return (
    <Float speed={1.35} rotationIntensity={0.55} floatIntensity={1.15}>
      {/* núcleo orgánico */}
      <mesh scale={1.42}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color="#0d4636"
          metalness={0.82}
          roughness={0.16}
          emissive="#10b981"
          emissiveIntensity={0.42}
          distort={0.32}
          speed={1.7}
        />
      </mesh>
      {/* retícula exterior */}
      <mesh scale={1.72}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial wireframe color="#2dd4bf" transparent opacity={0.14} />
      </mesh>
      {/* núcleo interior luminoso */}
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 4]} />
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.1} />
      </mesh>
    </Float>
  );
}

function GlassSatellites() {
  const positions: [number, number, number][] = [
    [2.5, 0.9, -0.6],
    [-2.7, -0.7, -0.4],
    [1.7, -1.5, 0.7],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <Float key={i} speed={1.6 + i * 0.4} rotationIntensity={0.9} floatIntensity={1.6}>
          <mesh position={p} scale={0.34 + i * 0.08}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial
              color="#aff5e3"
              transparent
              opacity={0.26}
              roughness={0.08}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
          <mesh position={p} scale={0.36 + i * 0.08} rotation={[0.5, 0.3, 0]}>
            <torusGeometry args={[1.15, 0.02, 12, 90]} />
            <meshBasicMaterial color="#2dd4bf" transparent opacity={0.35} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function KnotOrbit() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.22;
    ref.current.rotation.z = clock.elapsedTime * 0.12;
  });
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh ref={ref} position={[-2.55, 1.35, -1.1]} rotation={[0.55, 0.2, 0.2]}>
        <torusKnotGeometry args={[0.46, 0.13, 120, 14]} />
        <meshBasicMaterial wireframe color="#67e8f9" transparent opacity={0.16} />
      </mesh>
    </Float>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.4 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.045;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        color="#8ef5d3"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[4, 6, 6]} intensity={1.15} color="#eafff7" />
      <pointLight position={[-4, -2.4, 2.4]} intensity={26} distance={14} color="#10b981" />
      <pointLight position={[4.2, 3.2, 1.8]} intensity={20} distance={12} color="#22d3ee" />
    </>
  );
}

export default function Scene3D() {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Lights />
      <Rig>
        <CentralSculpture />
        <GlassSatellites />
        <KnotOrbit />
        <Particles count={isSmall ? 110 : 380} />
      </Rig>
    </Canvas>
  );
}
