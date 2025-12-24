import { create } from 'zustand';
import { GestureState, ParticleState } from './types';

export const useStore = create<ParticleState>((set) => ({
  gestureState: GestureState.TREE,
  handScore: 0,
  userName: "李响",
  particleCount: 6000,
  demoMode: false,
  setGestureState: (state) => set({ gestureState: state }),
  setHandScore: (score) => set({ handScore: score }),
  setUserName: (name) => set({ userName: name }),
  setParticleCount: (count) => set({ particleCount: count }),
  toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
}));