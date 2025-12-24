import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Particles } from './Particles';

export const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 45 }}
      dpr={[1, 2]} // Optimize pixel ratio
      gl={{ antialias: false }} // Postproc usually handles AA or makes it heavy
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 20, 10]} intensity={1.5} color="#ffaa00" penumbra={1} />
      <spotLight position={[-10, 5, -10]} intensity={2} color="#4455ff" />
      <pointLight position={[0, -10, 0]} intensity={1} color="#ffd700" distance={15} />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#ffd700" />

      {/* Core Logic */}
      <Particles />

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={10}
        maxDistance={40}
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
