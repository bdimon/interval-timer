import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Flame, Coffee, CheckCircle2, PauseCircle, Timer as TimerIcon, BarChart2, CircleDot } from 'lucide-react';
import { TimerPhase, WorkoutPlan } from '../types';

interface TimerDisplayProps {
  phase: TimerPhase;
  secondsRemaining: number;
  totalPhaseSeconds: number;
  currentSetIndex: number;
  currentCycleIndex: number;
  plan: WorkoutPlan;
  totalElapsedSeconds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  phase,
  secondsRemaining,
  totalPhaseSeconds,
  currentSetIndex,
  currentCycleIndex,
  plan,
  totalElapsedSeconds,
}) => {
  // Allow toggling between linear (compact 1-screen) and circular modes, defaulting to 'linear'
  const [displayMode, setDisplayMode] = useState<'linear' | 'circular'>(() => {
    return (localStorage.getItem('timer_display_mode') as 'linear' | 'circular') || 'linear';
  });

  const handleToggleMode = (mode: 'linear' | 'circular') => {
    setDisplayMode(mode);
    localStorage.setItem('timer_display_mode', mode);
  };

  const currentSet = plan.sets[currentSetIndex] || plan.sets[0];
  const isCountingDown3s = secondsRemaining <= 3 && secondsRemaining >= 1 && phase !== 'PAUSED' && phase !== 'COMPLETED';
  const isLastSetOfCycle = currentSetIndex === plan.sets.length - 1;

  // Calculate upcoming next phase
  const getNextPhaseInfo = (): string => {
    if (phase === 'PREP') {
      if (currentSet.workSeconds > 0) {
        return `Работа: ${currentSet.name} (${formatTime(currentSet.workSeconds)})`;
      }
      return `Отдых: ${currentSet.name} (${formatTime(currentSet.restSeconds)})`;
    }
    if (phase === 'WORK') {
      if (currentSet.restSeconds > 0) {
        return `Отдых (${formatTime(currentSet.restSeconds)})`;
      }
      if (currentSetIndex + 1 < plan.sets.length) {
        const nextSet = plan.sets[currentSetIndex + 1];
        return `Сет ${currentSetIndex + 2}: ${nextSet.name} (${formatTime(nextSet.workSeconds > 0 ? nextSet.workSeconds : nextSet.restSeconds)})`;
      }
      if (currentCycleIndex + 1 < plan.cycles) {
        return `Цикл ${currentCycleIndex + 2}: ${plan.sets[0].name}`;
      }
      return 'Завершение тренировки';
    }
    if (phase === 'REST' || phase === 'CYCLE_REST') {
      if (currentSetIndex + 1 < plan.sets.length) {
        const nextSet = plan.sets[currentSetIndex + 1];
        return `Сет ${currentSetIndex + 2}: ${nextSet.name} (${formatTime(nextSet.workSeconds > 0 ? nextSet.workSeconds : nextSet.restSeconds)})`;
      }
      if (currentCycleIndex + 1 < plan.cycles) {
        return `Цикл ${currentCycleIndex + 2}: ${plan.sets[0].name}`;
      }
      return 'Завершение тренировки';
    }
    return 'Ожидание запуска';
  };

  const formatTime = (totalSec: number): string => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Phase theme styling
  const getPhaseStyles = () => {
    switch (phase) {
      case 'WORK':
        return {
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          title: 'РАБОТА / WORK',
          icon: Flame,
          accentColor: 'text-emerald-400',
          cardBorder: 'border-emerald-500/30',
          radialGlow: 'from-emerald-500/10 via-emerald-950/20 to-zinc-950',
          ringColor: '#10b981',
          barGradient: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/30',
          indicatorColor: 'bg-emerald-400',
        };
      case 'REST':
      case 'CYCLE_REST':
        return {
          badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          title: phase === 'CYCLE_REST' ? 'ОТДЫХ МЕЖДУ ЦИКЛАМИ' : 'ОТДЫХ / REST',
          icon: Coffee,
          accentColor: 'text-cyan-400',
          cardBorder: 'border-cyan-500/30',
          radialGlow: 'from-cyan-500/10 via-cyan-950/20 to-zinc-950',
          ringColor: '#06b6d4',
          barGradient: 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-cyan-500/30',
          indicatorColor: 'bg-cyan-400',
        };
      case 'PREP':
        return {
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          title: 'ПОДГОТОВКА / PREP',
          icon: Bell,
          accentColor: 'text-amber-400',
          cardBorder: 'border-amber-500/30',
          radialGlow: 'from-amber-500/10 via-amber-950/20 to-zinc-950',
          ringColor: '#f59e0b',
          barGradient: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/30',
          indicatorColor: 'bg-amber-400',
        };
      case 'PAUSED':
        return {
          badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
          title: 'ПАУЗА / PAUSED',
          icon: PauseCircle,
          accentColor: 'text-purple-400',
          cardBorder: 'border-purple-500/30',
          radialGlow: 'from-purple-500/10 via-purple-950/20 to-zinc-950',
          ringColor: '#a855f7',
          barGradient: 'bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-purple-500/30',
          indicatorColor: 'bg-purple-400',
        };
      case 'COMPLETED':
        return {
          badgeBg: 'bg-emerald-500/30 text-emerald-300 border-emerald-400',
          title: 'ТРЕНИРОВКА ЗАВЕРШЕНА!',
          icon: CheckCircle2,
          accentColor: 'text-emerald-400',
          cardBorder: 'border-emerald-500/50',
          radialGlow: 'from-emerald-500/20 via-zinc-900 to-zinc-950',
          ringColor: '#10b981',
          barGradient: 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-emerald-500/40',
          indicatorColor: 'bg-emerald-400',
        };
      default:
        return {
          badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          title: 'ГОТОВ К СТАРТУ',
          icon: TimerIcon,
          accentColor: 'text-zinc-400',
          cardBorder: 'border-zinc-800',
          radialGlow: 'from-zinc-900 via-zinc-950 to-zinc-950',
          ringColor: '#71717a',
          barGradient: 'bg-zinc-600',
          indicatorColor: 'bg-zinc-400',
        };
    }
  };

  const currentStyles = getPhaseStyles();
  const PhaseIcon = currentStyles.icon;

  // Percentage for progress (remaining / total)
  const progressRatio = totalPhaseSeconds > 0 
    ? Math.max(0, Math.min(1, secondsRemaining / totalPhaseSeconds))
    : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const elapsedInPhase = Math.max(0, totalPhaseSeconds - secondsRemaining);
  const strokeDashoffset = 100 - (progressRatio * 100);

  const isLinear = displayMode === 'linear';

  return (
    <div
      id="timer-display-container"
      className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border ${currentStyles.cardBorder} bg-gradient-to-b ${currentStyles.radialGlow} ${
        isLinear ? 'p-3.5 sm:p-5' : 'p-5 sm:p-8'
      } shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center`}
    >
      {/* 3-Second Visual Metronome Pulse Indicator */}
      <AnimatePresence>
        {isCountingDown3s && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute top-2 inset-x-4 z-20 flex items-center justify-center"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 backdrop-blur-md shadow-lg animate-pulse text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono font-bold uppercase tracking-wider">
                Метроном: {secondsRemaining}с
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header: Current Preset, Cycle & Set Pills + View Mode Toggle */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3 z-10 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-zinc-400 hidden xs:inline">План:</span>
          <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700 truncate max-w-[150px] sm:max-w-[220px]">
            {plan.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isLastSetOfCycle && plan.sets.length > 1 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-semibold flex items-center gap-1 animate-pulse shadow-sm">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Финал!</span>
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs">
            Сет <strong className="text-white">{currentSetIndex + 1}</strong>/{plan.sets.length}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs">
            Цикл <strong className="text-white">{currentCycleIndex + 1}</strong>/{plan.cycles}
          </span>

          {/* View mode toggle button (Linear vs Circular) */}
          <div className="flex items-center ml-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5">
            <button
              type="button"
              id="btn-mode-linear"
              onClick={() => handleToggleMode('linear')}
              className={`p-1 rounded-md transition-colors ${
                isLinear ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Линейный компактный режим (на 1 экран)"
            >
              <BarChart2 className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              type="button"
              id="btn-mode-circular"
              onClick={() => handleToggleMode('circular')}
              className={`p-1 rounded-md transition-colors ${
                !isLinear ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Круговой классический режим"
            >
              <CircleDot className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Phase Badge & Exercise Name Row */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-1.5 sm:mb-2 z-10">
        <div className="flex items-center gap-2">
          <span
            id="phase-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full font-bold text-[11px] sm:text-xs tracking-wider uppercase border shadow-xs ${currentStyles.badgeBg}`}
          >
            <PhaseIcon className="w-3.5 h-3.5" />
            <span>{currentStyles.title}</span>
          </span>
          {currentSet.workSeconds === 0 && phase === 'REST' && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px] font-medium">
              Без работы (0с)
            </span>
          )}
        </div>

        {/* Set / Exercise Name */}
        <h3 className="text-sm sm:text-base font-semibold text-zinc-200 truncate max-w-[240px] sm:max-w-xs text-right">
          {phase === 'WORK'
            ? currentSet.name
            : phase === 'REST'
            ? currentSet.workSeconds === 0
              ? `${currentSet.name} (Отдых)`
              : `Передышка`
            : phase === 'CYCLE_REST'
            ? `Отдых перед циклом ${currentCycleIndex + 2}`
            : phase === 'PREP'
            ? 'Приготовьтесь'
            : plan.name}
        </h3>
      </div>

      {/* --- DISPLAY MODE 1: LINEAR PROGRESS COUNTER (COMPACT 1-SCREEN) --- */}
      {isLinear ? (
        <div className="w-full my-1 sm:my-2 flex flex-col items-center justify-center z-10">
          {/* Main Countdown Digits */}
          <div className="flex items-baseline justify-center gap-2 select-none">
            <span
              id="timer-countdown-digits"
              className={`font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none drop-shadow-sm transition-all duration-200 ${
                isCountingDown3s ? 'text-rose-400 scale-105' : 'text-white'
              }`}
            >
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-zinc-400">
              {phase === 'PAUSED' ? 'ПАУЗА' : `/ ${formatTime(totalPhaseSeconds)}`}
            </span>
          </div>

          {/* High-visibility Linear Progress Bar */}
          <div className="w-full mt-2 sm:mt-3 px-1">
            <div className="w-full h-3 sm:h-3.5 bg-zinc-900/90 rounded-full overflow-hidden p-0.5 border border-zinc-800/90 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-linear shadow-sm ${currentStyles.barGradient}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Sub-bar time indicators */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1 px-1">
              <span>Прошло: {formatTime(elapsedInPhase)}</span>
              <span className="font-semibold text-zinc-300">{progressPercent}%</span>
              <span>Осталось: {formatTime(secondsRemaining)}</span>
            </div>
          </div>
        </div>
      ) : (
        /* --- DISPLAY MODE 2: CLASSIC CIRCULAR COUNTER (COMPACTED) --- */
        <div className="relative my-2 sm:my-3 flex items-center justify-center">
          <svg className="w-48 h-48 sm:w-60 sm:h-60 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-zinc-800/80 fill-none"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={currentStyles.ringColor}
              strokeWidth="5"
              strokeDasharray="276.46"
              strokeDashoffset={(strokeDashoffset / 100) * 276.46}
              strokeLinecap="round"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* Center Digital Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none p-2">
            <span
              id="timer-countdown-digits"
              className={`font-mono text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm transition-all duration-200 ${
                isCountingDown3s ? 'text-rose-400 scale-105' : 'text-white'
              }`}
            >
              {formatTime(secondsRemaining)}
            </span>

            <span className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5">
              {phase === 'PAUSED' ? 'ТАЙМЕР НА ПАУЗЕ' : `Осталось в фазе`}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Info: Next Phase Preview & Elapsed Total */}
      <div className="w-full mt-2 sm:mt-3 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 z-10">
        <div className="flex items-center gap-1.5 text-left truncate max-w-[70%]">
          <span className="text-zinc-500 shrink-0">Далее:</span>
          <span className="text-zinc-300 font-medium truncate">{getNextPhaseInfo()}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-zinc-500">Общее:</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {formatTime(totalElapsedSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};

