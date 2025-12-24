import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import * as THREE from 'three';

export const TopStar: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { handScore, demoMode } = useStore();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Determine state logic
    let targetFactor = 0;
    if (demoMode) {
      targetFactor = (Math.sin(time * 0.5) + 1) / 2;
    } else {
      targetFactor = handScore;
    }

    const isTree = targetFactor < 0.5;

    // Animation
    // 1. Rotation: Always spin slowly
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.rotation.z = Math.sin(time) * 0.1;

    // 2. Scale: Visible only when Tree (targetFactor 0), disappear when Exploded (targetFactor 1)
    // We smoothly lerp the scale.
    // When tree is full (0), scale is 1. When exploded (1), scale is 0.
    const targetScale = isTree ? 1.0 : 0.0;
    
    // Add a pulsing effect to the scale when visible
    const pulse = isTree ? 1 + Math.sin(time * 3) * 0.1 : 0;
    const currentScale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale * pulse, 0.1);
    
    meshRef.current.scale.setScalar(currentScale);
  });

  return (
    <group position={[0, 9.5, 0]}>
        {/* Core Glow Mesh */}
        <mesh ref={meshRef}>
            {/* Octahedron looks like a diamond/star */}
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial 
                color="#ffdd00"
                emissive="#ffaa00"
                emissiveIntensity={4.0} // High intensity for Bloom
                toneMapped={false}
                roughness={0.2}
                metalness={1.0}
            />
        </mesh>
        
        {/* Additional Local Light to illuminate top leaves */}
        <pointLight 
            intensity={2.0} 
            distance={15} 
            color="#ffaa00" 
            decay={2}
        />
    </group>
  );
};