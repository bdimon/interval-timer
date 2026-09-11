import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Flame, Coffee, CheckCircle2, PauseCircle, Timer as TimerIcon } from 'lucide-react';
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
        };
    }
  };

  const currentStyles = getPhaseStyles();
  const PhaseIcon = currentStyles.icon;

  // Percentage for circular ring (remaining / total)
  const progressRatio = totalPhaseSeconds > 0 
    ? Math.max(0, Math.min(1, secondsRemaining / totalPhaseSeconds))
    : 0;
  const strokeDashoffset = 100 - (progressRatio * 100);

  return (
    <div
      id="timer-display-container"
      className={`relative overflow-hidden rounded-3xl border ${currentStyles.cardBorder} bg-gradient-to-b ${currentStyles.radialGlow} p-6 sm:p-10 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center text-center`}
    >
      {/* 3-Second Visual Metronome Pulse Indicator */}
      <AnimatePresence>
        {isCountingDown3s && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute top-4 inset-x-4 z-20 flex items-center justify-center"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 backdrop-blur-md shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider">
                Внимание: Звук метронома ({secondsRemaining} с)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header: Current Preset, Cycle & Set Pills */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 z-10 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-400">План:</span>
          <span className="font-semibold text-white px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-700">
            {plan.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLastSetOfCycle && plan.sets.length > 1 && (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-semibold flex items-center gap-1 animate-pulse shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Финал цикла!</span>
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
            Сет <strong className="text-white">{currentSetIndex + 1}</strong> / {plan.sets.length}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
            Цикл <strong className="text-white">{currentCycleIndex + 1}</strong> / {plan.cycles}
          </span>
        </div>
      </div>

      {/* Phase Badge */}
      <div className="mb-4 z-10 flex flex-wrap items-center justify-center gap-2">
        <span
          id="phase-badge"
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm tracking-widest uppercase border shadow-sm ${currentStyles.badgeBg}`}
        >
          <PhaseIcon className="w-4 h-4" />
          <span>{currentStyles.title}</span>
        </span>
        {currentSet.workSeconds === 0 && phase === 'REST' && (
          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">
            Без работы (0с)
          </span>
        )}
      </div>

      {/* Set Name */}
      <div className="z-10 mb-4 max-w-md">
        <h3 className="text-xl sm:text-2xl font-semibold text-zinc-200 truncate">
          {phase === 'WORK'
            ? currentSet.name
            : phase === 'REST'
            ? currentSet.workSeconds === 0
              ? `${currentSet.name} (Только отдых)`
              : `Передышка перед следующим сетом`
            : phase === 'CYCLE_REST'
            ? `Отдых перед циклом ${currentCycleIndex + 2}`
            : phase === 'PREP'
            ? 'Приготовьтесь к работе'
            : plan.name}
        </h3>
      </div>

      {/* Circular Progress & Huge Digital Countdown */}
      <div className="relative my-4 flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 100 100">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none p-4">
          <span
            id="timer-countdown-digits"
            className={`font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-sm transition-all duration-200 ${
              isCountingDown3s ? 'text-rose-400 scale-105' : 'text-white'
            }`}
          >
            {formatTime(secondsRemaining)}
          </span>

          {/* Sub-label under digits */}
          <span className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
            {phase === 'PAUSED' ? 'ТАЙМЕР НА ПАУЗЕ' : `Осталось в фазе`}
          </span>
        </div>
      </div>

      {/* Bottom Info: Next Phase Preview & Elapsed Total */}
      <div className="w-full max-w-lg mt-6 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-zinc-400 z-10">
        <div className="flex items-center gap-1.5 text-center sm:text-left">
          <span className="text-zinc-500">Далее:</span>
          <span className="text-zinc-300 font-medium">{getNextPhaseInfo()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Общее время:</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {formatTime(totalElapsedSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
