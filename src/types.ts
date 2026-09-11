export type TimerPhase = 
  | 'IDLE' 
  | 'PREP' 
  | 'WORK' 
  | 'REST' 
  | 'CYCLE_REST' 
  | 'PAUSED' 
  | 'COMPLETED';

export interface IntervalSet {
  id: string;
  name: string;
  workSeconds: number;
  restSeconds: number;
  workSoundFreq?: number;
  restSoundFreq?: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  prepSeconds: number;
  cycles: number;
  cycleRestSeconds: number;
  sets: IntervalSet[];
  createdAt?: string;
  isCustom?: boolean;
}

export interface SessionRecord {
  id: string;
  timestamp: string;
  planName: string;
  totalDurationSeconds: number;
  setsCompleted: number;
  totalSets: number;
  cyclesCompleted: number;
  totalCycles: number;
  completedFully: boolean;
  dateStr: string;
}

export type SoundTheme = 'athletic' | 'boxing' | 'digital' | 'wooden';

export interface SoundConfig {
  enabled: boolean;
  theme: SoundTheme;
  volume: number; // 0 to 1
  metronome3s: boolean;
}
