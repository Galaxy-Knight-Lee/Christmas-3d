import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { GestureState } from '../types';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const vec3 = new THREE.Vector3();

// Color Palettes
const COLORS = {
  TREE_LEAF: new THREE.Color('#0f5e28'),
  TREE_ORNAMENT_RED: new THREE.Color('#d41616'),
  TREE_ORNAMENT_GOLD: new THREE.Color('#ffb700'),
  SNOW: new THREE.Color('#ffffff'),
  TEXT_GOLD: new THREE.Color('#ffd700'),
  TEXT_WHITE: new THREE.Color('#fffaf0')
};

interface ParticleData {
  treePos: THREE.Vector3;
  treeColor: THREE.Color;
  textPos: THREE.Vector3; // Will be updated dynamically
  textColor: THREE.Color;
  currentPos: THREE.Vector3;
  currentColor: THREE.Color;
  speed: number;
}

export const Particles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { gestureState, particleCount, userName, handScore, demoMode } = useStore();

  // Generate Tree Data
  const treeData = useMemo(() => {
    const data: { pos: THREE.Vector3; color: THREE.Color }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Cone height range: -10 to 10
      const y = (Math.random() * 20) - 10;
      
      // Normalized height (0 at top, 1 at bottom)
      const hNorm = (10 - y) / 20; 
      
      // Radius expands as we go down
      const maxRadius = hNorm * 8; 
      
      // Volumetric filling: sqrt random ensures uniform distribution in circle
      const radius = Math.sqrt(Math.random()) * maxRadius;
      const theta = Math.random() * Math.PI * 2;
      
      // Drooping branches logic: sine wave based on radius and angle
      const droop = Math.cos(radius * 1.5) * (0.5 * hNorm);
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      
      const pos = new THREE.Vector3(x, y - droop - 2, z); // -2 to center visually

      // Color Logic
      let color = COLORS.TREE_LEAF;
      const isTip = radius > maxRadius * 0.85; // Outer edges
      
      if (isTip) {
        const rand = Math.random();
        if (rand > 0.8) color = COLORS.TREE_ORNAMENT_RED;
        else if (rand > 0.6) color = COLORS.TREE_ORNAMENT_GOLD;
        else if (rand > 0.95) color = COLORS.SNOW; // Snow tips
      } else {
        // Inner noise for snow
        if (Math.random() > 0.97) color = COLORS.SNOW;
      }

      data.push({ pos, color });
    }
    return data;
  }, [particleCount]);

  // Generate Text Data
  const textPoints = useMemo(() => {
    const canvas = document.createElement('canvas');
    const w = 800;
    const h = 400;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Text styling
    ctx.font = 'bold 80px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    
    // Draw
    ctx.fillText("MERRY", w/2, h/2 - 60);
    ctx.fillText("CHRISTMAS", w/2, h/2 + 20);
    
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillStyle = '#ffd700'; // Gold for name
    ctx.fillText(userName.toUpperCase(), w/2, h/2 + 90);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const points: THREE.Vector3[] = [];

    // Scan pixels
    // Step > 1 to reduce density if needed, but we want high fidelity
    const step = 2; 
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const index = (y * w + x) * 4;
        const r = data[index];
        // If pixel is bright enough
        if (r > 128) {
          // Map 2D to 3D. 
          // Canvas (0,0) is top-left. 3D (0,0) is center.
          const pX = (x - w/2) * 0.03; // Scale down
          const pY = -(y - h/2) * 0.03; // Invert Y
          const pZ = (Math.random() - 0.5) * 0.5; // Slight Z depth
          points.push(new THREE.Vector3(pX, pY, pZ));
        }
      }
    }
    return points;
  }, [userName]);

  // Particle State Containers
  // We use Refs for animation state to avoid React re-renders on every frame
  const particles = useMemo(() => {
    return new Array(particleCount).fill(0).map((_, i) => ({
      currentPos: treeData[i].pos.clone(),
      currentColor: treeData[i].color.clone(),
      velocity: new THREE.Vector3(),
      phase: Math.random() * Math.PI * 2
    }));
  }, [particleCount, treeData]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Determine Global Target State
    // If demo mode, auto oscillate. Else use handScore.
    let targetFactor = 0;
    if (demoMode) {
      targetFactor = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
    } else {
      targetFactor = handScore; // MediaPipe score
    }

    // Smooth global transition
    const isExploding = targetFactor > 0.5;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      const treeP = treeData[i];
      
      // Critical Constraint: Stable Mapping
      // particleIndex % textPoints.length
      const textTargetIndex = i % textPoints.length;
      const textP = textPoints.length > 0 ? textPoints[textTargetIndex] : new THREE.Vector3(0,0,0);

      // Interpolate Target Position based on state
      // We don't just snap to state, we lerp based on the float factor
      vec3.lerpVectors(treeP.pos, textP, targetFactor);

      // Add noise/float motion
      const floatAmp = isExploding ? 0.05 : 0.1;
      const floatFreq = isExploding ? 2 : 1;
      vec3.y += Math.sin(time * floatFreq + p.phase) * floatAmp;
      vec3.x += Math.cos(time * floatFreq * 0.5 + p.phase) * floatAmp;

      // Update current position
      // Using a spring-like lerp for responsiveness
      p.currentPos.lerp(vec3, 0.08);

      // Color Interpolation
      const targetColor = isExploding 
        ? (i % 3 === 0 ? COLORS.TEXT_GOLD : COLORS.TEXT_WHITE)
        : treeP.color;
      
      p.currentColor.lerp(targetColor, 0.05);

      // Update Instance Matrix
      tempObject.position.copy(p.currentPos);
      
      // Scale particles based on state (larger in explosion to fill gaps)
      const scale = isExploding ? 0.15 : 0.2;
      tempObject.scale.setScalar(scale);
      
      tempObject.lookAt(state.camera.position); // Billboarding slightly
      tempObject.updateMatrix();

      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, p.currentColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        toneMapped={false}
        emissiveIntensity={2} // For bloom
        roughness={0.2}
        metalness={0.8}
      />
    </instancedMesh>
  );
};
