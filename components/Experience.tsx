import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Particles } from './Particles';
import { TopStar } from './TopStar';

export const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 45 }}
      dpr={[1, 1.5]} 
      gl={{ 
        antialias: false,
        toneMapping: 0 // No tone mapping to preserve HDR intensity
      }}
    >
      <color attach="background" args={['#050505']} />
      
      <Environment preset="city" environmentIntensity={0.8} blur={1} />

      <ambientLight intensity={0.2} />
      
      <spotLight 
        position={[10, 20, 10]} 
        intensity={3.0} 
        color="#ffddaa" 
        penumbra={0.5} 
        angle={0.8} 
        castShadow
      />
      
      <spotLight 
        position={[-15, 5, -10]} 
        intensity={4.0} 
        color="#aaccff" 
        angle={0.6} 
      />
      
      <pointLight 
        position={[0, -8, 5]} 
        intensity={2.0} 
        color="#ffaa00" 
        distance={30} 
        decay={1.5} 
      />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={300} scale={25} size={4} speed={0.4} opacity={0.4} color="#ffd700" />

      {/* The Particle System */}
      <Particles />

      {/* The Glowing Top Star */}
      <TopStar />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={10}
        maxDistance={50}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={1.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
};