import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, RotateCcw, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { TimerPhase, WorkoutPlan } from '../types';
import { useI18n } from '../i18n/context';
import { getLocalizedPlanName, getLocalizedSetName } from '../utils/defaultPresets';

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
  const { t, language } = useI18n();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const mins = Math.floor(Math.max(0, secondsRemaining) / 60);
  const secs = Math.max(0, secondsRemaining) % 60;
  const timeStr = `${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;

  const planDisplayName = getLocalizedPlanName(plan, language) || plan.name;
  const currentSet = plan.sets[currentSetIndex] || plan.sets[0];
  const currentSetName = getLocalizedSetName(plan, currentSetIndex, language) || currentSet?.name || 'N/A';
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

  const getPhaseLocalizedName = (p: TimerPhase): string => {
    switch (p) {
      case 'PREP': return t('phase_prep');
      case 'WORK': return t('phase_work');
      case 'REST': return t('phase_rest');
      case 'CYCLE_REST': return t('phase_cycle_rest');
      case 'PAUSED': return t('phase_paused');
      case 'COMPLETED': return t('phase_completed');
      default: return 'IDLE';
    }
  };

  const copyTerminalOutput = () => {
    const output = `
====================================================================
       C INTERVAL TIMER  |  ${t('term_header_title')}
====================================================================
${t('term_stat_plan')}: ${planDisplayName} | ${t('term_stat_cycle')}: ${currentCycleIndex + 1} / ${plan.cycles}
${t('term_stat_set')}: ${currentSetIndex + 1} / ${plan.sets.length} | ${t('term_stat_exercise')}: ${currentSetName}
${t('term_stat_phase')}: ${getPhaseLocalizedName(phase)} | ${t('term_stat_audio')}: ${soundEnabled ? t('term_stat_audio_on') : t('term_stat_audio_off')}

+--------------------------------------------------------------+
${isCountingDown3s ? `|   >>> ${t('term_countdown_warn')}: [ ${secondsRemaining} ] <<<            |` : '|                                                              |'}
|                    ${timeStr}                                 |
|                                                              |
+--------------------------------------------------------------+
${t('term_phase_progress')} ${renderAsciiProgressBar(elapsedInPhase, totalPhaseSeconds, 28)}
${t('term_total_time')}   ${formatElapsed(totalElapsedSeconds)}
${t('term_console_controls')} [P] ${t('term_ctrl_pause')}  [R] ${t('term_ctrl_reset')}  [S] ${t('term_ctrl_skip')}  [M] ${t('term_ctrl_sound')}
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
              title={t('term_copy_btn')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('term_copy_btn')}</span>
            </button>
          </div>
        </div>

        {/* ANSI Terminal Screen Content */}
        <div className="p-4 sm:p-6 bg-black text-zinc-100 select-text overflow-x-auto text-xs sm:text-sm leading-relaxed">
          {/* Header Banner */}
          <div className="text-blue-400 font-bold mb-2">
            ====================================================================<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C INTERVAL TIMER&nbsp;&nbsp;|&nbsp;&nbsp;{t('term_header_title')}<br />
            ====================================================================
          </div>

          {/* Preset & Cycle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 my-2">
            <div>
              <span className="text-cyan-400 font-bold">{t('term_stat_plan')}:</span>{' '}
              <span className="text-white">{planDisplayName}</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold">{t('term_stat_cycle')}:</span>{' '}
              <span className="text-yellow-400 font-bold">{currentCycleIndex + 1}</span> / {plan.cycles}
            </div>
            <div>
              <span className="text-cyan-400 font-bold">{t('term_stat_set')}:</span>{' '}
              <span className="text-yellow-400 font-bold">{currentSetIndex + 1}</span> / {plan.sets.length}
              {currentSetIndex === plan.sets.length - 1 && plan.sets.length > 1 && (
                 <span className="text-rose-400 font-bold ml-2 animate-pulse">[{t('badge_final_round')}]</span>
              )}
            </div>
            <div>
              <span className="text-cyan-400 font-bold">{t('term_stat_exercise')}:</span>{' '}
              <span className="text-white">{currentSetName}</span>
              {currentSet?.workSeconds === 0 && (
                <span className="text-zinc-500 text-xs ml-2 font-mono">[{t('phase_work')}: 0{t('unit_sec')}]</span>
              )}
            </div>
          </div>

          {/* Phase & Sound */}
          <div className="my-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-2">
            <div>
              <span className="text-zinc-400 font-bold">{t('term_stat_phase')}:</span>{' '}
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
                {getPhaseLocalizedName(phase)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-bold">{t('term_stat_audio')}:</span>{' '}
              <span className={soundEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                [{soundEnabled ? t('term_stat_audio_on') : t('term_stat_audio_off')}]
              </span>
            </div>
          </div>

          {/* ASCII Large Digital Frame */}
          <div className="my-3 border border-zinc-700 bg-zinc-950 p-4 rounded text-center">
            {isCountingDown3s ? (
              <div className="text-rose-500 font-bold text-xs sm:text-sm animate-pulse mb-2">
                &gt;&gt;&gt; {t('term_countdown_warn')}: [&nbsp;{secondsRemaining}&nbsp;] &lt;&lt;&lt;
              </div>
            ) : (
              <div className="text-zinc-600 text-xs mb-2">
                [{t('term_active_clock')}]
              </div>
            )}
            <div className="text-3xl sm:text-5xl font-black tracking-widest text-white font-mono my-1">
              {timeStr}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {phase === 'PAUSED' ? `=== [P] ${t('term_ctrl_pause')} ===` : t('term_time_until_change')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="my-2">
            <span className="text-zinc-400">{t('term_phase_progress')}</span>{' '}
            <span className="text-emerald-400 font-bold">
              {renderAsciiProgressBar(elapsedInPhase, totalPhaseSeconds, 24)}
            </span>
          </div>

          {/* Overall Time */}
          <div className="my-2">
            <span className="text-zinc-400">{t('term_total_time')}</span>{' '}
            <span className="text-yellow-400 font-bold">{formatElapsed(totalElapsedSeconds)}</span>
          </div>

          {/* Terminal Command Palette Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-300 flex flex-wrap gap-2 items-center justify-between">
            <span className="bg-zinc-800 text-zinc-100 px-2 py-0.5 rounded">
              {t('term_console_controls')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={onTogglePause}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-700 active:scale-95"
              >
                [P] {t('term_ctrl_pause')}
              </button>
              <button
                onClick={onReset}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-700 active:scale-95"
              >
                [R] {t('term_ctrl_reset')}
              </button>
              <button
                onClick={onSkipNext}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-zinc-700 active:scale-95"
              >
                [S] {t('term_ctrl_skip')}
              </button>
              <button
                onClick={onToggleSound}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 active:scale-95"
              >
                [M] {t('term_ctrl_sound')}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Session Log stream inside Terminal */}
        <div className="bg-zinc-950 border-t border-zinc-800/80 p-4 max-h-48 overflow-y-auto font-mono text-xs text-zinc-400">
          <div className="text-zinc-500 font-semibold mb-1 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('term_system_log')}</span>
          </div>
          {terminalLogs.length === 0 ? (
            <div className="text-zinc-600 italic">{t('term_log_empty')}</div>
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
