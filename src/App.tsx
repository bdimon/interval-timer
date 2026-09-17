import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar, ActiveTab } from './components/Navbar';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { WorkoutEditor } from './components/WorkoutEditor';
import { PresetsManager } from './components/PresetsManager';
import { HistoryJournal } from './components/HistoryJournal';
import { TerminalSimulator } from './components/TerminalSimulator';
import { CCodeViewer } from './components/CCodeViewer';
import { 
  TimerPhase, 
  WorkoutPlan, 
  SessionRecord, 
  SoundConfig 
} from './types';
import { 
  DEFAULT_WORKOUT_PRESETS, 
  getDefaultPresets, 
  localizeWorkoutPlan, 
  getLocalizedPlanName 
} from './utils/defaultPresets';
import { soundEngine } from './utils/audioEngine';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useI18n, detectDefaultLanguage } from './i18n/context';

const STORAGE_PRESETS_KEY = 'c_interval_timer_presets_v1';
const STORAGE_HISTORY_KEY = 'c_interval_timer_history_v1';
const STORAGE_DRAFT_PLAN_KEY = 'c_interval_timer_editor_draft_v2';
const STORAGE_EDITING_PRESET_ID_KEY = 'c_interval_timer_editing_id_v2';

function isValidWorkoutPlan(p: unknown): p is WorkoutPlan {
  if (!p || typeof p !== 'object') return false;
  const candidate = p as WorkoutPlan;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.sets) &&
    candidate.sets.length > 0 &&
    candidate.sets.every(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof s.name === 'string' &&
        typeof s.workSeconds === 'number' &&
        typeof s.restSeconds === 'number'
    )
  );
}

export default function App() {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');

  // Workout Presets State with strict validation and language synchronization
  const [presets, setPresets] = useState<WorkoutPlan[]>(() => {
    const initLang = detectDefaultLanguage();
    const defaults = getDefaultPresets(initLang);
    try {
      const saved = localStorage.getItem(STORAGE_PRESETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isValidWorkoutPlan);
          if (valid.length > 0) {
            // Synchronize built-in presets with detected language
            return valid.map((p) => {
              if (p.isCustom && p.id !== 'tabata-classic') return p;
              const matching = defaults.find((d) => d.id === p.id);
              if (!matching) return p;
              return {
                ...p,
                name: matching.name,
                description: matching.description,
                sets: p.sets.map((s, idx) => ({
                  ...s,
                  name: matching.sets[idx]?.name ?? s.name,
                })),
              };
            });
          }
        }
      }
    } catch {
      // fallback
    }
    return defaults;
  });

  // Current Workout Plan with safety guard
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>(() => {
    const initLang = detectDefaultLanguage();
    const defaults = getDefaultPresets(initLang);
    return presets[0] || defaults[0];
  });

  // Persistent Editor Draft State with safety guard
  const [editorPlan, setEditorPlan] = useState<WorkoutPlan>(() => {
    const initLang = detectDefaultLanguage();
    const defaults = getDefaultPresets(initLang);
    try {
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_PLAN_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (isValidWorkoutPlan(parsed)) {
          if (parsed.isCustom && parsed.id !== 'tabata-classic') return parsed;
          return localizeWorkoutPlan(parsed, initLang);
        }
      }
    } catch {
      // fallback
    }
    return presets[0] || defaults[0];
  });

  // Synchronize built-in presets, currentPlan, and editorPlan whenever language changes
  useEffect(() => {
    const defaults = getDefaultPresets(language);
    setPresets((prev) =>
      prev.map((p) => {
        if (p.isCustom && p.id !== 'tabata-classic') return p;
        const matching = defaults.find((d) => d.id === p.id);
        if (!matching) return p;
        return {
          ...p,
          name: matching.name,
          description: matching.description,
          sets: p.sets.map((s, idx) => ({
            ...s,
            name: matching.sets[idx]?.name ?? s.name,
          })),
        };
      })
    );

    setCurrentPlan((prev) => (prev.isCustom && prev.id !== 'tabata-classic' ? prev : localizeWorkoutPlan(prev, language)));
    setEditorPlan((prev) => (prev.isCustom && prev.id !== 'tabata-classic' ? prev : localizeWorkoutPlan(prev, language)));
  }, [language]);

  // ID of the preset currently being edited (if editing an existing template)
  const [editingPresetId, setEditingPresetId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_EDITING_PRESET_ID_KEY) || null;
    } catch {
      return null;
    }
  });

  // Session History State
  const [history, setHistory] = useState<SessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Sound Configuration State
  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    enabled: true,
    theme: 'athletic',
    volume: 0.8,
    metronome3s: true,
  });

  // Timer Runtime State
  const [phase, setPhase] = useState<TimerPhase>('IDLE');
  const [previousPhase, setPreviousPhase] = useState<TimerPhase>('IDLE');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [totalPhaseSeconds, setTotalPhaseSeconds] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Simulated Terminal stdout Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] C Interval Timer Engine v2.0 initialized.',
    `[INFO] Loaded default plan: "${presets[0].name}" (${presets[0].sets.length} sets, ${presets[0].cycles} cycle).`,
  ]);

  // Append a message to simulated terminal log
  const addTerminalLog = useCallback((msg: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setTerminalLogs((prev) => [...prev.slice(-99), `[${timeStr}] ${msg}`]);
  }, []);

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(presets));
  }, [presets]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Save editor draft to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_DRAFT_PLAN_KEY, JSON.stringify(editorPlan));
  }, [editorPlan]);

  // Save editing preset ID
  useEffect(() => {
    if (editingPresetId) {
      localStorage.setItem(STORAGE_EDITING_PRESET_ID_KEY, editingPresetId);
    } else {
      localStorage.removeItem(STORAGE_EDITING_PRESET_ID_KEY);
    }
  }, [editingPresetId]);

  // Sync sound volume to audio engine
  useEffect(() => {
    soundEngine.setVolume(soundConfig.volume);
    soundEngine.setMuted(!soundConfig.enabled);
  }, [soundConfig.volume, soundConfig.enabled]);

  // Reset timer to current plan initial state
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSetIndex(0);
    setCurrentCycleIndex(0);
    setTotalElapsedSeconds(0);

    const safePlan = isValidWorkoutPlan(currentPlan) ? currentPlan : DEFAULT_WORKOUT_PRESETS[0];

    if (safePlan.prepSeconds > 0) {
      setPhase('PREP');
      setPreviousPhase('PREP');
      setSecondsRemaining(safePlan.prepSeconds);
      setTotalPhaseSeconds(safePlan.prepSeconds);
    } else if (safePlan.sets.length > 0) {
      const firstSet = safePlan.sets[0];
      if (firstSet.workSeconds > 0) {
        setPhase('WORK');
        setPreviousPhase('WORK');
        setSecondsRemaining(firstSet.workSeconds);
        setTotalPhaseSeconds(firstSet.workSeconds);
      } else {
        setPhase('REST');
        setPreviousPhase('REST');
        setSecondsRemaining(firstSet.restSeconds);
        setTotalPhaseSeconds(firstSet.restSeconds);
      }
    } else {
      setPhase('IDLE');
      setPreviousPhase('IDLE');
      setSecondsRemaining(0);
      setTotalPhaseSeconds(0);
    }
    addTerminalLog(`Timer reset to start of plan "${safePlan.name}".`);
  }, [currentPlan, addTerminalLog]);

  // Initialize timer on plan change
  useEffect(() => {
    resetTimer();
  }, [currentPlan, resetTimer]);

  // Log session to history
  const logSessionRecord = useCallback((completedFully: boolean) => {
    const now = new Date();
    const newRecord: SessionRecord = {
      id: `session-${Date.now()}`,
      timestamp: now.toLocaleString('ru-RU'),
      planName: currentPlan.name,
      totalDurationSeconds: totalElapsedSeconds,
      setsCompleted: currentCycleIndex * currentPlan.sets.length + currentSetIndex,
      totalSets: currentPlan.sets.length * currentPlan.cycles,
      cyclesCompleted: currentCycleIndex + (completedFully ? 1 : 0),
      totalCycles: currentPlan.cycles,
      completedFully,
      dateStr: now.toISOString().slice(0, 10),
    };

    setHistory((prev) => [newRecord, ...prev]);
    addTerminalLog(
      `Journal record appended: ${newRecord.planName} | Duration: ${Math.floor(
        totalElapsedSeconds / 60
      )}m ${totalElapsedSeconds % 60}s | Status: ${completedFully ? 'COMPLETED' : 'STOPPED'}`
    );
  }, [currentPlan, currentCycleIndex, currentSetIndex, totalElapsedSeconds, addTerminalLog]);

  // Advance to next interval phase (mirroring transition_to_next_phase in C engine)
  const advanceToNextPhase = useCallback(() => {
    if (phase === 'PREP') {
      // Transition from PREP to first set
      const firstSet = currentPlan.sets[0];
      const isLastSet = currentPlan.sets.length === 1;

      if (firstSet.workSeconds > 0) {
        setPhase('WORK');
        setSecondsRemaining(firstSet.workSeconds);
        setTotalPhaseSeconds(firstSet.workSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playWorkSignal(soundConfig.theme);
          }
        }
        addTerminalLog(
          isLastSet
            ? `🔥 Phase: PREP -> WORK | [FINAL SET] Set 1/${currentPlan.sets.length}: "${firstSet.name}" (${firstSet.workSeconds}s)`
            : `Phase: PREP -> WORK | Set 1/${currentPlan.sets.length}: "${firstSet.name}" (${firstSet.workSeconds}s)`
        );
      } else if (firstSet.restSeconds > 0) {
        setPhase('REST');
        setSecondsRemaining(firstSet.restSeconds);
        setTotalPhaseSeconds(firstSet.restSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playRestSignal(soundConfig.theme);
          }
        }
        addTerminalLog(
          isLastSet
            ? `🔥 Phase: PREP -> REST (Work 0s) | [FINAL SET] Set 1/${currentPlan.sets.length}: "${firstSet.name}" (${firstSet.restSeconds}s)`
            : `Phase: PREP -> REST (Work 0s) | Set 1/${currentPlan.sets.length}: "${firstSet.name}" (${firstSet.restSeconds}s)`
        );
      } else {
        advanceToNextSet();
      }
      return;
    }

    if (phase === 'WORK') {
      const set = currentPlan.sets[currentSetIndex];
      if (set.restSeconds > 0) {
        // Rest within current set
        setPhase('REST');
        setSecondsRemaining(set.restSeconds);
        setTotalPhaseSeconds(set.restSeconds);
        if (soundConfig.enabled) soundEngine.playRestSignal(soundConfig.theme);
        addTerminalLog(`Phase: WORK -> REST | Set ${currentSetIndex + 1}: (${set.restSeconds}s)`);
      } else {
        // No rest, proceed directly to next set or cycle
        advanceToNextSet();
      }
      return;
    }

    if (phase === 'REST') {
      advanceToNextSet();
      return;
    }

    if (phase === 'CYCLE_REST') {
      // Break between cycles finished, start next cycle set 0
      const firstSet = currentPlan.sets[0];
      const isLastSet = currentPlan.sets.length === 1;
      setCurrentSetIndex(0);

      if (firstSet.workSeconds > 0) {
        setPhase('WORK');
        setSecondsRemaining(firstSet.workSeconds);
        setTotalPhaseSeconds(firstSet.workSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playWorkSignal(soundConfig.theme);
          }
        }
        addTerminalLog(
          isLastSet
            ? `🔥 Cycle Break finished. Starting Cycle ${currentCycleIndex + 1}, [FINAL SET] Set 1: "${firstSet.name}"`
            : `Cycle Break finished. Starting Cycle ${currentCycleIndex + 1}, Set 1: "${firstSet.name}"`
        );
      } else if (firstSet.restSeconds > 0) {
        setPhase('REST');
        setSecondsRemaining(firstSet.restSeconds);
        setTotalPhaseSeconds(firstSet.restSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playRestSignal(soundConfig.theme);
          }
        }
        addTerminalLog(`Cycle Break finished. Starting Cycle ${currentCycleIndex + 1}, Set 1 (Work 0s, Rest ${firstSet.restSeconds}s)`);
      } else {
        advanceToNextSet();
      }
    }
  }, [phase, currentPlan, currentSetIndex, currentCycleIndex, soundConfig, addTerminalLog]);

  // Helper to advance to next set
  const advanceToNextSet = () => {
    const nextSetIdx = currentSetIndex + 1;
    if (nextSetIdx >= currentPlan.sets.length) {
      // Cycle completed
      const nextCycleIdx = currentCycleIndex + 1;
      if (nextCycleIdx >= currentPlan.cycles) {
        // All cycles completed!
        setPhase('COMPLETED');
        setIsRunning(false);
        setIsPaused(false);
        if (soundConfig.enabled) soundEngine.playCompleteSignal();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        addTerminalLog(`🎉 WORKOUT COMPLETED SUCCESSFULLY! All ${currentPlan.cycles} cycles finished.`);
        logSessionRecord(true);
      } else if (currentPlan.cycleRestSeconds > 0) {
        // Inter-cycle rest
        setCurrentCycleIndex(nextCycleIdx);
        setCurrentSetIndex(0);
        setPhase('CYCLE_REST');
        setSecondsRemaining(currentPlan.cycleRestSeconds);
        setTotalPhaseSeconds(currentPlan.cycleRestSeconds);
        if (soundConfig.enabled) soundEngine.playRestSignal(soundConfig.theme);
        addTerminalLog(`Cycle ${currentCycleIndex + 1} finished. Cycle Rest (${currentPlan.cycleRestSeconds}s)`);
      } else {
        // Next cycle immediately
        setCurrentCycleIndex(nextCycleIdx);
        setCurrentSetIndex(0);
        const firstSet = currentPlan.sets[0];
        const isLastSet = currentPlan.sets.length === 1;

        if (firstSet.workSeconds > 0) {
          setPhase('WORK');
          setSecondsRemaining(firstSet.workSeconds);
          setTotalPhaseSeconds(firstSet.workSeconds);
          if (soundConfig.enabled) {
            if (isLastSet) soundEngine.playLastSetSignal(soundConfig.theme);
            else soundEngine.playWorkSignal(soundConfig.theme);
          }
        } else {
          setPhase('REST');
          setSecondsRemaining(firstSet.restSeconds);
          setTotalPhaseSeconds(firstSet.restSeconds);
          if (soundConfig.enabled) {
            if (isLastSet) soundEngine.playLastSetSignal(soundConfig.theme);
            else soundEngine.playRestSignal(soundConfig.theme);
          }
        }
        addTerminalLog(`Starting Cycle ${nextCycleIdx + 1} / ${currentPlan.cycles}`);
      }
    } else {
      // Next set in current cycle
      setCurrentSetIndex(nextSetIdx);
      const nextSet = currentPlan.sets[nextSetIdx];
      const isLastSet = nextSetIdx === currentPlan.sets.length - 1;

      if (nextSet.workSeconds > 0) {
        setPhase('WORK');
        setSecondsRemaining(nextSet.workSeconds);
        setTotalPhaseSeconds(nextSet.workSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playWorkSignal(soundConfig.theme);
          }
        }
        addTerminalLog(
          isLastSet
            ? `🔥 [FINAL SET] Set ${nextSetIdx + 1}/${currentPlan.sets.length}: "${nextSet.name}" (${nextSet.workSeconds}s)`
            : `Phase -> WORK | Set ${nextSetIdx + 1}/${currentPlan.sets.length}: "${nextSet.name}" (${nextSet.workSeconds}s)`
        );
      } else if (nextSet.restSeconds > 0) {
        setPhase('REST');
        setSecondsRemaining(nextSet.restSeconds);
        setTotalPhaseSeconds(nextSet.restSeconds);
        if (soundConfig.enabled) {
          if (isLastSet) {
            soundEngine.playLastSetSignal(soundConfig.theme);
          } else {
            soundEngine.playRestSignal(soundConfig.theme);
          }
        }
        addTerminalLog(
          isLastSet
            ? `🔥 [FINAL SET] Set ${nextSetIdx + 1}/${currentPlan.sets.length}: "${nextSet.name}" (Work 0s, Rest ${nextSet.restSeconds}s)`
            : `Phase -> REST (Work 0s) | Set ${nextSetIdx + 1}/${currentPlan.sets.length}: "${nextSet.name}" (${nextSet.restSeconds}s)`
        );
      } else {
        advanceToNextSet();
      }
    }
  };

  // Step back to previous set
  const stepBackPrevious = useCallback(() => {
    if (currentSetIndex > 0) {
      const prevIdx = currentSetIndex - 1;
      setCurrentSetIndex(prevIdx);
      const set = currentPlan.sets[prevIdx];
      if (set.workSeconds > 0) {
        setPhase('WORK');
        setSecondsRemaining(set.workSeconds);
        setTotalPhaseSeconds(set.workSeconds);
      } else {
        setPhase('REST');
        setSecondsRemaining(set.restSeconds);
        setTotalPhaseSeconds(set.restSeconds);
      }
      addTerminalLog(`Jumped back to Set ${prevIdx + 1}: "${set.name}"`);
    } else if (currentCycleIndex > 0) {
      const prevCycle = currentCycleIndex - 1;
      const lastSetIdx = currentPlan.sets.length - 1;
      setCurrentCycleIndex(prevCycle);
      setCurrentSetIndex(lastSetIdx);
      const set = currentPlan.sets[lastSetIdx];
      if (set.workSeconds > 0) {
        setPhase('WORK');
        setSecondsRemaining(set.workSeconds);
        setTotalPhaseSeconds(set.workSeconds);
      } else {
        setPhase('REST');
        setSecondsRemaining(set.restSeconds);
        setTotalPhaseSeconds(set.restSeconds);
      }
      addTerminalLog(`Jumped back to Cycle ${prevCycle + 1}, Set ${lastSetIdx + 1}`);
    } else {
      resetTimer();
    }
  }, [currentSetIndex, currentCycleIndex, currentPlan, addTerminalLog, resetTimer]);

  // Main 1-Second Timer Tick Effect
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning || isPaused || phase === 'COMPLETED' || phase === 'IDLE') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTotalElapsedSeconds((t) => t + 1);

      setSecondsRemaining((prevSec) => {
        // Metronome sound tick and visual countdown at 3, 2, 1
        if (prevSec <= 3 && prevSec >= 1) {
          if (soundConfig.enabled && soundConfig.metronome3s) {
            soundEngine.playMetronomeTick(prevSec, soundConfig.theme);
          }
          addTerminalLog(`Metronome tick: [ ${prevSec} ] s remaining before interval switch`);
        }

        const nextSec = prevSec - 1;
        if (nextSec < 0) {
          advanceToNextPhase();
          return 0;
        }
        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, phase, soundConfig, advanceToNextPhase, addTerminalLog]);

  // User Actions
  const handleStart = () => {
    soundEngine.resumeContext();
    if (phase === 'IDLE' || phase === 'COMPLETED') {
      resetTimer();
    }
    setIsRunning(true);
    setIsPaused(false);
    addTerminalLog('Timer started.');
  };

  const handlePause = () => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    setPreviousPhase(phase);
    setPhase('PAUSED');
    addTerminalLog('Timer paused.');
  };

  const handleResume = () => {
    soundEngine.resumeContext();
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    setPhase(previousPhase === 'PAUSED' ? 'WORK' : previousPhase);
    addTerminalLog('Timer resumed.');
  };

  const handleTogglePause = () => {
    if (!isRunning) {
      handleStart();
    } else if (isPaused) {
      handleResume();
    } else {
      handlePause();
    }
  };

  const handleSkipNext = () => {
    if (!isRunning) return;
    addTerminalLog('Skipped current phase by user command.');
    advanceToNextPhase();
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        resetTimer();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
        handleSkipNext();
      } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
        setSoundConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Presets Handlers
  const handleSelectPreset = (plan: WorkoutPlan, autoStart: boolean = false) => {
    setCurrentPlan(plan);
    setActiveTab('timer');
    if (autoStart) {
      setTimeout(() => {
        handleStart();
      }, 100);
    }
  };

  const handleEditPreset = (plan: WorkoutPlan) => {
    setEditingPresetId(plan.id);
    setEditorPlan(JSON.parse(JSON.stringify(plan)));
    setActiveTab('editor');
    addTerminalLog(`Opened preset for editing: "${plan.name}".`);
  };

  // Create a brand new blank workout plan / complex cycle
  const handleCreateNewBlankPlan = () => {
    const blankPlan: WorkoutPlan = {
      id: `custom-plan-${Date.now()}`,
      name: t('editor_btn_new_cycle'),
      description: t('editor_custom_desc'),
      prepSeconds: 5,
      cycles: 1,
      cycleRestSeconds: 30,
      isCustom: true,
      createdAt: new Date().toISOString(),
      sets: [
        {
          id: `set-${Date.now()}-1`,
          name: `${t('timer_set')} 1`,
          workSeconds: 30,
          restSeconds: 15,
        },
        {
          id: `set-${Date.now()}-2`,
          name: `${t('timer_set')} 2`,
          workSeconds: 30,
          restSeconds: 15,
        },
        {
          id: `set-${Date.now()}-3`,
          name: `${t('timer_set')} 3`,
          workSeconds: 30,
          restSeconds: 15,
        },
      ],
    };

    setEditingPresetId(null);
    setEditorPlan(blankPlan);
    setActiveTab('editor');
    addTerminalLog('Created new blank complex cycle in editor.');
  };

  const handleSavePresetUpdate = (updatedPlan: WorkoutPlan) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? { ...updatedPlan, isCustom: true } : p))
    );
    if (currentPlan.id === updatedPlan.id) {
      setCurrentPlan(updatedPlan);
    }
    setEditorPlan(updatedPlan);
    addTerminalLog(`Saved changes to preset "${updatedPlan.name}".`);
  };

  const handleSaveAsNewPreset = (newPlan: WorkoutPlan) => {
    const presetToAdd: WorkoutPlan = {
      ...newPlan,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setPresets((prev) => [presetToAdd, ...prev]);
    setEditingPresetId(presetToAdd.id);
    setEditorPlan(presetToAdd);
    setCurrentPlan(presetToAdd);
    addTerminalLog(`Saved new custom preset "${presetToAdd.name}".`);
  };

  const handleResetToOriginalPreset = () => {
    if (!editingPresetId) return;
    const defaults = getDefaultPresets(language);
    const def = defaults.find((d) => d.id === editingPresetId);
    if (def) {
      setEditorPlan(JSON.parse(JSON.stringify(def)));
      addTerminalLog(`Reset editor changes to original preset "${def.name}".`);
      return;
    }
    const orig = presets.find((p) => p.id === editingPresetId);
    if (orig) {
      setEditorPlan(JSON.parse(JSON.stringify(orig)));
      addTerminalLog(`Reset editor changes to original preset "${orig.name}".`);
    }
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    if (editingPresetId === id) {
      setEditingPresetId(null);
    }
  };

  const handleResetDefaultPresets = () => {
    const defaults = getDefaultPresets(language);
    setPresets(defaults);
    setCurrentPlan(defaults[0]);
    setEditorPlan(defaults[0]);
    setEditingPresetId(null);
    addTerminalLog('Reset all workout presets to default factory settings.');
  };

  const handleImportPresets = (imported: WorkoutPlan[]) => {
    setPresets(imported);
    if (imported.length > 0) {
      setCurrentPlan(imported[0]);
      setEditorPlan(imported[0]);
      setEditingPresetId(imported[0].id);
    }
    addTerminalLog(`Successfully imported ${imported.length} workout presets from JSON.`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    addTerminalLog('Workout journal cleared.');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundConfig={soundConfig}
        setSoundConfig={setSoundConfig}
        onNewWorkout={handleCreateNewBlankPlan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-6 flex flex-col items-center justify-start">
        {/* TAB 1: Main Interactive GUI Timer (Compact 1-screen layout) */}
        <div className={activeTab === 'timer' ? 'w-full max-w-2xl flex flex-col gap-2.5 sm:gap-3 items-center' : 'hidden'}>
          <TimerDisplay
            phase={phase}
            secondsRemaining={secondsRemaining}
            totalPhaseSeconds={totalPhaseSeconds}
            currentSetIndex={currentSetIndex}
            currentCycleIndex={currentCycleIndex}
            plan={currentPlan}
            totalElapsedSeconds={totalElapsedSeconds}
          />

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={resetTimer}
            onSkipNext={handleSkipNext}
            onSkipPrev={stepBackPrevious}
            soundConfig={soundConfig}
            setSoundConfig={setSoundConfig}
          />
        </div>

        {/* TAB 2: Complex Cycles Workout Editor (Preserved across tab switches) */}
        <div className={activeTab === 'editor' ? 'w-full' : 'hidden'}>
          <WorkoutEditor
            plan={editorPlan}
            onChangePlan={setEditorPlan}
            editingPresetId={editingPresetId}
            onApplyPlan={(p, autoStart) => {
              setCurrentPlan(p);
              setActiveTab('timer');
              if (autoStart) {
                setTimeout(() => handleStart(), 150);
              }
            }}
            onSavePresetUpdate={handleSavePresetUpdate}
            onSaveAsNewPreset={handleSaveAsNewPreset}
            onResetToOriginalPreset={handleResetToOriginalPreset}
            onCreateBlankPlan={handleCreateNewBlankPlan}
          />
        </div>

        {/* TAB 3: Interactive C Console / Terminal Simulator */}
        <div className={activeTab === 'terminal' ? 'w-full' : 'hidden'}>
          <TerminalSimulator
            phase={phase}
            secondsRemaining={secondsRemaining}
            totalPhaseSeconds={totalPhaseSeconds}
            currentSetIndex={currentSetIndex}
            currentCycleIndex={currentCycleIndex}
            plan={currentPlan}
            totalElapsedSeconds={totalElapsedSeconds}
            isRunning={isRunning}
            isPaused={isPaused}
            soundEnabled={soundConfig.enabled}
            terminalLogs={terminalLogs}
            onTogglePause={handleTogglePause}
            onReset={resetTimer}
            onSkipNext={handleSkipNext}
            onToggleSound={() =>
              setSoundConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
            }
          />
        </div>

        {/* TAB 4: Workout Presets */}
        <div className={activeTab === 'presets' ? 'w-full' : 'hidden'}>
          <PresetsManager
            presets={presets}
            onSelectPreset={handleSelectPreset}
            onEditPreset={handleEditPreset}
            onCreateNewPreset={handleCreateNewBlankPlan}
            onDeletePreset={handleDeletePreset}
            onResetDefaults={handleResetDefaultPresets}
            onImportPresets={handleImportPresets}
          />
        </div>

        {/* TAB 5: Session History & Journal */}
        <div className={activeTab === 'journal' ? 'w-full' : 'hidden'}>
          <HistoryJournal
            records={history}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* TAB 6: C Codebase & Architecture Porting */}
        <div className={activeTab === 'c_code' ? 'w-full' : 'hidden'}>
          <CCodeViewer />
        </div>
      </main>

      {/* Persistent Bottom Status Bar (hidden on mobile) */}
      <OfflineIndicator />
      <footer className="hidden md:block bg-zinc-950 border-t border-zinc-900 py-3 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400 font-medium">C Core Engine Ready</span>
            </span>
            <span>•</span>
            <span>CLI POSIX / Win32 / Wasm / Android NDK</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <span>{t('footer_plan')}: <strong className="text-zinc-200">{getLocalizedPlanName(currentPlan, language) || currentPlan.name}</strong></span>
            <span>•</span>
            <span>{t('footer_metronome')}: <strong className="text-emerald-400">{soundConfig.metronome3s ? t('footer_metronome_on') : t('footer_metronome_off')}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
