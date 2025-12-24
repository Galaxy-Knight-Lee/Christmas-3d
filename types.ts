export enum GestureState {
  IDLE = 'IDLE',
  TREE = 'TREE',
  EXPLODE = 'EXPLODE'
}

export interface ParticleState {
  gestureState: GestureState;
  handScore: number; // 0 (Fist/Tree) to 1 (Open/Explode)
  userName: string;
  particleCount: number;
  demoMode: boolean;
  setGestureState: (state: GestureState) => void;
  setHandScore: (score: number) => void;
  setUserName: (name: string) => void;
  setParticleCount: (count: number) => void;
  toggleDemoMode: () => void;
}
