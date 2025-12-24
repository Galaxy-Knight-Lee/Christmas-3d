import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const tempObject = new THREE.Object3D();
const vec3 = new THREE.Vector3();
const colorHelper = new THREE.Color();
const rotationEuler = new THREE.Euler();
const quaternion = new THREE.Quaternion();

// PALETTE: "Cinematic Christmas"
const COLORS = {
  LEAF: new THREE.Color('#4a5d23'),      // Olive Green (Matteish)
  GOLD: new THREE.Color('#ffcf40'),      // Bright Gold (Metallic)
  BRONZE: new THREE.Color('#cd7f32'),    // Copper/Bronze (Metallic)
  CREAM: new THREE.Color('#f0eee4'),     // Cream/White (Pearl)
};

export const Particles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { particleCount, userName, handScore, demoMode } = useStore();

  // Generate Tree Data
  const treeData = useMemo(() => {
    const data: { pos: THREE.Vector3; color: THREE.Color; type: 'leaf' | 'gold' | 'bronze' | 'cream'; randomRot: THREE.Euler }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // 1. Volume Distribution (Cone)
      const y = (Math.random() * 22) - 11;
      const hNorm = (11 - y) / 22; 
      const coneRadius = hNorm * 8.5; 
      
      const rRatio = Math.sqrt(Math.random()); 
      const radius = rRatio * coneRadius;
      const theta = Math.random() * Math.PI * 2;
      
      const jitterY = (Math.random() - 0.5) * 0.5;
      const droop = Math.cos(radius * 0.5) * (1.5 * hNorm);
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      const pos = new THREE.Vector3(x, y - droop - 2 + jitterY, z);

      // 2. Color Logic
      let color = COLORS.LEAF;
      let type: 'leaf' | 'gold' | 'bronze' | 'cream' = 'leaf';
      const rand = Math.random();

      // Mix colors like a decorated tree
      if (rand > 0.90) { color = COLORS.GOLD; type = 'gold'; }
      else if (rand > 0.80) { color = COLORS.BRONZE; type = 'bronze'; }
      else if (rand > 0.70) { color = COLORS.CREAM; type = 'cream'; }
      else {
        // Variation in leaf green
        if (Math.random() > 0.5) color = new THREE.Color('#3a4a1b'); 
      }

      const randomRot = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      data.push({ pos, color, type, randomRot });
    }
    return data;
  }, [particleCount]);

  // Generate Text Data
  const textPoints = useMemo(() => {
    const canvas = document.createElement('canvas');
    const w = 1024;
    const h = 512;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = 'bold 90px "Cinzel", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("MERRY", w/2, h/2 - 80);
    ctx.fillText("CHRISTMAS", w/2, h/2 + 10);
    
    ctx.font = 'bold 70px "Inter", sans-serif';
    ctx.fillText(userName, w/2, h/2 + 110);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const points: THREE.Vector3[] = [];
    const step = 3; 

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4] > 200) { 
          points.push(new THREE.Vector3((x - w/2) * 0.035, -(y - h/2) * 0.035, 0));
        }
      }
    }
    return points;
  }, [userName]);

  const particles = useMemo(() => {
    return new Array(particleCount).fill(0).map((_, i) => ({
      currentPos: treeData[i].pos.clone(),
      currentRot: treeData[i].randomRot.clone(),
      // Add slight variety to rotation speed for more organic sparkle
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.8, 
        (Math.random() - 0.5) * 0.8, 
        (Math.random() - 0.5) * 0.8
      ),
      intensity: 1.0,
      phase: Math.random() * Math.PI * 2
    }));
  }, [particleCount, treeData]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    let targetFactor = 0;
    if (demoMode) {
      targetFactor = (Math.sin(time * 0.5) + 1) / 2;
    } else {
      targetFactor = handScore;
    }

    const isExploding = targetFactor > 0.5;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      const treeP = treeData[i];
      
      const textTargetIndex = i % textPoints.length;
      const textP = textPoints.length > 0 ? textPoints[textTargetIndex] : new THREE.Vector3(0,0,0);

      // --- POSITION ---
      vec3.lerpVectors(treeP.pos, textP, targetFactor);
      
      // Reduce float amplitude slightly in text mode to keep letters sharp
      // while preserving the "alive" feeling
      const floatAmp = isExploding ? 0.01 : 0.05; 
      vec3.y += Math.sin(time * 0.5 + p.phase) * floatAmp;
      p.currentPos.lerp(vec3, 0.1);

      // --- ROTATION (THE KEY TO SPARKLE) ---
      // Previously, we flattened rotation in text mode. 
      // NOW: We let them rotate continuously. This ensures facets catch the environment map
      // and creates the "Diamond Glitter" effect even when forming text.
      p.currentRot.x += p.rotSpeed.x * 0.02;
      p.currentRot.y += p.rotSpeed.y * 0.02;
      p.currentRot.z += p.rotSpeed.z * 0.02;
      
      rotationEuler.set(p.currentRot.x, p.currentRot.y, p.currentRot.z);
      quaternion.setFromEuler(rotationEuler);

      // --- COLOR & INTENSITY ---
      const baseColor = treeP.color; 
      
      let targetIntensity = 1.0;
      const wave = Math.sin(time * 2.5 + p.phase); // Faster shimmer

      if (!isExploding) {
        // Tree Mode
        if (treeP.type !== 'leaf') {
           targetIntensity = 1.2 + wave * 0.3;
        } else {
           targetIntensity = 1.0 + wave * 0.1;
        }
      } else {
        // Text Mode
        // Instead of a flat high intensity (which looks matte), 
        // we use a high BASE intensity + a strong wave.
        // This makes the text shimmer like a neon sign or jewels.
        // Base 1.5 ensures visibility, + 1.0 wave peaks at 2.5 for Bloom.
        targetIntensity = 1.5 + (wave * 0.5 + 0.5); 
      }
      
      p.intensity = THREE.MathUtils.lerp(p.intensity, targetIntensity, 0.1);
      
      colorHelper.copy(baseColor).multiplyScalar(p.intensity);

      // --- UPDATE MATRIX ---
      tempObject.position.copy(p.currentPos);
      tempObject.quaternion.copy(quaternion);
      
      const scaleBase = isExploding ? 0.12 : 0.35; 
      tempObject.scale.setScalar(scaleBase);
      
      tempObject.updateMatrix();

      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, colorHelper);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        toneMapped={false}
        emissive="#1a1a00" 
        emissiveIntensity={0.25} // Slightly increased to ensure deep greens glow
        color="#ffffff" 
        roughness={0.12} // Reduced roughness for sharper reflections
        metalness={0.8}  // Increased metalness for more "gem" like quality
        envMapIntensity={1.5} // Boosted environment reflection
      />
    </instancedMesh>
  );
};