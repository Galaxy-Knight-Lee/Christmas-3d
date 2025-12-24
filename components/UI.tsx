import React, { useState } from 'react';
import { useStore } from '../store';
import { HandTracker } from './HandTracker';

export const UI: React.FC = () => {
  const { 
    userName, setUserName, 
    particleCount, setParticleCount, 
    demoMode, toggleDemoMode,
    handScore, gestureState 
  } = useStore();

  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start pointer-events-none z-10">
        <div>
          <h1 className="text-2xl md:text-4xl text-amber-500 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            MERRY CHRISTMAS
          </h1>
          <p className="text-amber-200/60 text-[10px] md:text-sm tracking-widest mt-1 font-mono">
            INTERACTIVE EXPERIENCE
          </p>
        </div>
      </div>

      {/* Hand Tracker - Top Right on Mobile, Bottom Left on Desktop */}
      <div className="absolute top-4 right-4 md:top-auto md:right-auto md:bottom-6 md:left-6 z-10 origin-top-right md:origin-bottom-left transform scale-75 md:scale-100">
        <HandTracker />
        
        {/* State Indicator */}
        <div className="mt-2 font-mono text-xs text-amber-500/80 bg-black/60 p-2 rounded backdrop-blur-sm md:bg-transparent md:p-0">
          <div className="flex justify-between items-center mb-1">
            <span>STATE:</span>
            <span className={`font-bold ${gestureState === 'EXPLODE' ? 'text-red-500' : 'text-green-500'}`}>
              {gestureState}
            </span>
          </div>
          <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-300"
               style={{ width: `${handScore * 100}%` }}
             />
          </div>
        </div>
      </div>

      {/* Controls - Bottom Right, Collapsible on Mobile */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
        
        {/* Toggle Button (Visible mainly on mobile/tablet context, or just to hide UI) */}
        <button 
          onClick={() => setControlsOpen(!controlsOpen)}
          className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-500 border border-amber-500/50 rounded-full p-3 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </button>

        {/* Panel */}
        <div className={`
          w-80 bg-black/90 border border-amber-600/30 p-6 rounded-xl backdrop-blur-md shadow-2xl
          transition-all duration-500 ease-in-out origin-bottom-right
          ${controlsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none absolute bottom-16'}
        `}>
          <h3 className="text-amber-500 text-lg mb-4 font-bold border-b border-amber-500/20 pb-2 flex justify-between items-center">
            <span>CONTROLS</span>
            <span className="text-[10px] text-gray-500 font-normal font-mono">V1.0</span>
          </h3>

          <div className="space-y-5">
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
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-amber-200/70 font-mono">
                <label>PARTICLES (CPU HEAVY)</label>
                <span className="text-amber-500">{particleCount}</span>
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
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
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
            
            <div className="pt-2 text-[10px] text-gray-500 leading-tight border-t border-gray-800 mt-2">
              <p>1. Ensure room is lit.</p>
              <p>2. Show hand to camera.</p>
              <p>3. <b className="text-gray-300">Fist</b> = Tree, <b className="text-gray-300">Open</b> = Text.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};