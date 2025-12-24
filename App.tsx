import React, { Suspense } from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-mono animate-pulse">
          INITIALIZING 3D ENGINE...
        </div>
      }>
        <Experience />
      </Suspense>
      <UI />
    </div>
  );
};

export default App;
