import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, RotateCcw, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { TimerPhase, WorkoutPlan } from '../types';

interface TerminalSimulatorProps {
  phase: TimerPhase;
  secondsRemaining: number;
  totalPhaseSeconds: number;
  currentSetIndex: number;
  currentCycleIndex: number;
  plan: WorkoutPlan;
  totalElapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  soundEnabled: boolean;
  terminalLogs: string[];
  onTogglePause: () => void;
  onReset: () => void;
  onSkipNext: () => void;
  onToggleSound: () => void;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  phase,
  secondsRemaining,
  totalPhaseSeconds,
  currentSetIndex,
  currentCycleIndex,
  plan,
  totalElapsedSeconds,
  isRunning,
  isPaused,
  soundEnabled,
  terminalLogs,
  onTogglePause,
  onReset,
  onSkipNext,
  onToggleSound,
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const mins = Math.floor(Math.max(0, secondsRemaining) / 60);
  const secs = Math.max(0, secondsRemaining) % 60;
  const timeStr = `${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;

  const currentSet = plan.sets[currentSetIndex] || plan.sets[0];
  const isCountingDown3s = secondsRemaining <= 3 && secondsRemaining >= 1 && phase !== 'PAUSED' && phase !== 'COMPLETED';

  // Render ASCII Progress Bar
  const renderAsciiProgressBar = (current: number, total: number, width: number = 28): string => {
    if (total <= 0) return '░'.repeat(width) + '   0%';
    const ratio = Math.max(0, Math.min(1, current / total));
    const filled = Math.round(ratio * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const pct = Math.round(ratio * 100);
    return `[${bar}] ${String(pct).padStart(3, ' ')}%`;
  };

  const elapsedInPhase = Math.max(0, totalPhaseSeconds - secondsRemaining);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getPhaseNameRussian = (p: TimerPhase): string => {
    switch (p) {
      case 'PREP': return 'ПОДГОТОВКА / PREPARATION';
      case 'WORK': return 'РАБОТА / WORK';
      case 'REST': return 'ОТДЫХ / REST';
      case 'CYCLE_REST': return 'ОТДЫХ МЕЖДУ ЦИКЛАМИ';
      case 'PAUSED': return 'ПАУЗА / PAUSED';
      case 'COMPLETED': return 'ЗАВЕРШЕНО / COMPLETED';
      default: return 'ОЖИДАНИЕ / IDLE';
    }
  };

  const copyTerminalOutput = () => {
    const output = `
====================================================================
       C INTERVAL TIMER  |  ИНТЕРВАЛЬНЫЙ ТАЙМЕР НА C
====================================================================
План: ${plan.name} | Цикл: ${currentCycleIndex + 1} / ${plan.cycles}
Сет: ${currentSetIndex + 1} / ${plan.sets.length} | Упражнение: ${currentSet?.name || 'N/A'}
ФАЗА: ${getPhaseNameRussian(phase)} | ЗВУК: ${soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}

+--------------------------------------------------------------+
${isCountingDown3s ? `|   >>> ОБРАТНЫЙ ОТСЧЕТ / COUNTDOWN: [ ${secondsRemaining} ] <<<            |` : '|                                                              |'}
|                    ${timeStr}                                 |
|                                                              |
+--------------------------------------------------------------+
Фаза прогресс: ${renderAsciiProgressBar(elapsedInPhase, totalPhaseSeconds, 28)}
Общее время:   ${formatElapsed(totalElapsedSeconds)}
УПРАВЛЕНИЕ: [P] Пауза/Старт  [R] Сброс  [S] Пропуск  [M] Звук
    `;
    navigator.clipboard.writeText(output.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Terminal Window Frame */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-mono">
        {/* Terminal Title Bar */}
        <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600" />
            <span className="text-xs text-zinc-400 font-mono ml-2">
              bash: ./c_src/interval_timer (ANSI VT100 Terminal)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTerminalOutput}
              title="Скопировать экран терминала"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Копировать</span>
            </button>
          </div>
        </div>

        {/* ANSI Terminal Screen Content */}
        <div className="p-4 sm:p-6 bg-black text-zinc-100 select-text overflow-x-auto text-xs sm:text-sm leading-relaxed">
          {/* Header Banner */}
          <div className="text-blue-400 font-bold mb-2">
            ====================================================================<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C INTERVAL TIMER&nbsp;&nbsp;|&nbsp;&nbsp;ИНТЕРВАЛЬНЫЙ ТАЙМЕР НА C<br />
            ====================================================================
          </div>

          {/* Preset & Cycle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 my-2">
            <div>
              <span className="text-cyan-400 font-bold">План / Workout:</span>{' '}
              <span className="text-white">{plan.name}</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold">Цикл / Cycle:</span>{' '}
              <span className="text-yellow-400 font-bold">{currentCycleIndex + 1}</span> / {plan.cycles}
            </div>
            <div>
              <span className="text-cyan-400 font-bold">Сет / Set:</span>{' '}
              <span className="text-yellow-400 font-bold">{currentSetIndex + 1}</span> / {plan.sets.length}
              {currentSetIndex === plan.sets.length - 1 && plan.sets.length > 1 && (
                <span className="text-rose-400 font-bold ml-2 animate-pulse">[ФИНАЛ РАУНДА]</span>
              )}
            </div>
            <div>
              <span className="text-cyan-400 font-bold">Упражнение:</span>{' '}
              <span className="text-white">{currentSet?.name}</span>
              {currentSet?.workSeconds === 0 && (
                <span className="text-zinc-500 text-xs ml-2 font-mono">[Работа: 0с]</span>
              )}
            </div>
          </div>

          {/* Phase & Sound */}
          <div className="my-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-2">
            <div>
              <span className="text-zinc-400 font-bold">ФАЗА:</span>{' '}
              <span
                className={`font-bold uppercase ${
                  phase === 'WORK'
                    ? 'text-emerald-400'
                    : phase === 'REST' || phase === 'CYCLE_REST'
                    ? 'text-cyan-400'
                    : phase === 'PREP'
                    ? 'text-amber-400'
                    : phase === 'PAUSED'
                    ? 'text-purple-400'
                    : 'text-zinc-400'
                }`}
              >
                {getPhaseNameRussian(phase)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">ЗВУК / AUDIO:</span>{' '}
              <span className={soundEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                {soundEnabled ? '[ВКЛ / ENABLED]' : '[ВЫКЛ / MUTED]'}
              </span>
            </div>
          </div>

          {/* ASCII Large Digital Frame */}
          <div className="my-3 border border-zinc-700 bg-zinc-950 p-4 rounded text-center">
            {isCountingDown3s ? (
              <div className="text-rose-500 font-bold text-xs sm:text-sm animate-pulse mb-2">
                &gt;&gt;&gt; ВНИМАНИЕ! ОБРАТНЫЙ ОТСЧЕТ / COUNTDOWN: [&nbsp;{secondsRemaining}&nbsp;] &lt;&lt;&lt; [МЕТРОНОМ ТИК]
              </div>
            ) : (
              <div className="text-zinc-600 text-xs mb-2">
                [ТАЙМЕР АКТИВЕН — СТАНДАРТНОЕ ВРЕМЯ]
              </div>
            )}
            <div className="text-3xl sm:text-5xl font-black tracking-widest text-white font-mono my-1">
              {timeStr}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {phase === 'PAUSED' ? '=== НАЖМИТЕ [P] ЧТОБЫ ПРОДОЛЖИТЬ ===' : 'ВРЕМЯ ДО СМЕНЫ ИНТЕРВАЛА'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="my-2">
            <span className="text-zinc-400">Фаза прогресс:</span>{' '}
            <span className="text-emerald-400 font-bold">
              {renderAsciiProgressBar(elapsedInPhase, totalPhaseSeconds, 24)}
            </span>
          </div>

          {/* Overall Time */}
          <div className="my-2">
            <span className="text-zinc-400">Общее время:  </span>{' '}
            <span className="text-yellow-400 font-bold">{formatElapsed(totalElapsedSeconds)}</span>
          </div>

          {/* Terminal Command Palette Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-300 flex flex-wrap gap-2 items-center justify-between">
            <span className="bg-zinc-800 text-zinc-100 px-2 py-0.5 rounded">
              УПРАВЛЕНИЕ В КОНСОЛИ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={onTogglePause}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-700 active:scale-95"
              >
                [P] Пауза/Старт
              </button>
              <button
                onClick={onReset}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-700 active:scale-95"
              >
                [R] Сброс
              </button>
              <button
                onClick={onSkipNext}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-zinc-700 active:scale-95"
              >
                [S] Пропуск
              </button>
              <button
                onClick={onToggleSound}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 active:scale-95"
              >
                [M] Звук
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Session Log stream inside Terminal */}
        <div className="bg-zinc-950 border-t border-zinc-800/80 p-4 max-h-48 overflow-y-auto font-mono text-xs text-zinc-400">
          <div className="text-zinc-500 font-semibold mb-1 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Системный журнал событий C ядра (stdout / stderr):</span>
          </div>
          {terminalLogs.length === 0 ? (
            <div className="text-zinc-600 italic">Событий пока нет. Запустите таймер.</div>
          ) : (
            <div className="space-y-1">
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-zinc-300">
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
