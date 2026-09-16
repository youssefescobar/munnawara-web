"use client"

import { brand } from "@/lib/theme"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { ContactShadows, Environment, Float, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"

const BusModel = () => {
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group position={[0, -0.15, 0]}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[2.4, 0.85, 1.05]} />
          <meshStandardMaterial
            color={brand.orange}
            metalness={0.25}
            roughness={0.4}
          />
        </mesh>
        <mesh castShadow position={[0.15, 1.05, 0]}>
          <boxGeometry args={[1.7, 0.35, 0.95]} />
          <meshStandardMaterial
            color={brand.ink}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0.2, 0.85, 0.53]}>
          <boxGeometry args={[1.5, 0.28, 0.04]} />
          <meshStandardMaterial
            color={brand.blueSoft}
            metalness={0.6}
            roughness={0.15}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[0.2, 0.85, -0.53]}>
          <boxGeometry args={[1.5, 0.28, 0.04]} />
          <meshStandardMaterial
            color={brand.blueSoft}
            metalness={0.6}
            roughness={0.15}
            transparent
            opacity={0.85}
          />
        </mesh>
        {[
          [-0.75, 0.22, 0.55],
          [0.75, 0.22, 0.55],
          [-0.75, 0.22, -0.55],
          [0.75, 0.22, -0.55],
        ].map((pos, i) => (
          <mesh
            key={i}
            castShadow
            position={pos as [number, number, number]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
            <meshStandardMaterial
              color={brand.black}
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.45, 0.53]}>
          <boxGeometry args={[2.35, 0.06, 0.02]} />
          <meshStandardMaterial
            color={brand.blue}
            emissive={brand.blue}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </Float>
  )
}

type FleetSceneProps = {
  className?: string
}

export const FleetScene = ({ className }: FleetSceneProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div
        className={`flex aspect-[16/10] items-center justify-center rounded-2xl border border-border bg-surface-mint ${className ?? ""}`}
      >
        <div className="h-24 w-40 rounded-xl bg-orange/90 shadow-md" aria-hidden />
      </div>
    )
  }

  return (
    <div
      className={`aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface-mint to-surface ${className ?? ""}`}
    >
      <Canvas
        camera={{ position: [3.2, 2.1, 3.4], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 2]} intensity={1.15} castShadow />
          <BusModel />
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.35}
            scale={8}
            blur={2.4}
            far={4}
          />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={2.8}
            maxDistance={6}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
