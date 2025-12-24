import React from 'react';
import { useStore } from '../store';
import { HandTracker } from './HandTracker';

export const UI: React.FC = () => {
  const { 
    userName, setUserName, 
    particleCount, setParticleCount, 
    demoMode, toggleDemoMode,
    handScore, gestureState 
  } = useStore();

  return (
    <>
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div>
          <h1 className="text-4xl text-amber-500 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            MERRY CHRISTMAS
          </h1>
          <p className="text-amber-200/60 text-sm tracking-widest mt-1 font-mono">
            INTERACTIVE EXPERIENCE
          </p>
        </div>
      </div>

      {/* Bottom Left: Hand Tracker */}
      <div className="absolute bottom-6 left-6 z-10">
        <HandTracker />
        
        {/* State Indicator */}
        <div className="mt-2 font-mono text-xs text-amber-500/80">
          <div>GESTURE: <span className="text-white font-bold">{gestureState}</span></div>
          <div className="w-48 h-1 bg-gray-800 mt-1 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-300"
               style={{ width: `${handScore * 100}%` }}
             />
          </div>
          <div className="flex justify-between text-[10px] mt-1 text-gray-500">
            <span>FIST (TREE)</span>
            <span>OPEN (EXPLODE)</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Controls */}
      <div className="absolute bottom-6 right-6 z-10 w-80 bg-black/80 border border-amber-600/30 p-6 rounded-xl backdrop-blur-md shadow-2xl">
        <h3 className="text-amber-500 text-lg mb-4 font-bold border-b border-amber-500/20 pb-2">
          CONTROLS
        </h3>

        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs text-amber-200/70 font-mono">YOUR NAME</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={12}
              className="w-full bg-gray-900/50 border border-amber-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm font-bold tracking-wide uppercase"
              placeholder="ENTER NAME"
            />
          </div>

          {/* Particle Count */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-amber-200/70 font-mono">
              <label>PARTICLES</label>
              <span>{particleCount}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="10000" 
              step="500"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-amber-200/70 font-mono">DEMO MODE (AUTO)</span>
            <button 
              onClick={toggleDemoMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${demoMode ? 'bg-amber-500' : 'bg-gray-700'}`}
            >
              <div 
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${demoMode ? 'translate-x-6' : 'translate-x-0'}`} 
              />
            </button>
          </div>
          
          <div className="pt-2 text-[10px] text-gray-500 leading-tight">
            Use your hand camera. Make a <b className="text-gray-300">Fist</b> to build the tree, <b className="text-gray-300">Open Hand</b> to explode into text.
          </div>
        </div>
      </div>
    </>
  );
};
