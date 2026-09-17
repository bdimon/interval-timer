import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Keyboard 
} from 'lucide-react';
import { SoundConfig, SoundTheme } from '../types';
import { soundEngine } from '../utils/audioEngine';
import { useI18n } from '../i18n/context';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  soundConfig: SoundConfig;
  setSoundConfig: React.Dispatch<React.SetStateAction<SoundConfig>>;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkipNext,
  onSkipPrev,
  soundConfig,
  setSoundConfig,
}) => {
  const { t } = useI18n();

  const handlePrimaryClick = () => {
    if (!isRunning) {
      onStart();
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  const soundThemes: { id: SoundTheme; label: string }[] = [
    { id: 'athletic', label: t('theme_athletic') },
    { id: 'boxing', label: t('theme_boxing') },
    { id: 'digital', label: t('theme_digital') },
    { id: 'wooden', label: t('theme_wooden') },
  ];

  return (
    <div className="w-full bg-zinc-950 rounded-2xl border border-zinc-800/80 p-3 sm:p-4 shadow-lg flex flex-col gap-3 sm:gap-3.5">
      {/* Primary Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Step Back / Previous */}
        <button
          id="btn-step-prev"
          onClick={onSkipPrev}
          title={t('btn_prev_set')}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Big Start / Pause / Resume Button */}
        <button
          id="btn-primary-toggle"
          onClick={handlePrimaryClick}
          className={`flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base tracking-wide shadow-lg transition-all active:scale-95 ${
            !isRunning || isPaused
              ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
          }`}
        >
          {!isRunning ? (
            <>
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>{t('btn_start')}</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>{t('btn_resume')}</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5 fill-current shrink-0" />
              <span>{t('btn_pause')}</span>
            </>
          )}
        </button>

        {/* Skip Next */}
        <button
          id="btn-skip-next"
          onClick={onSkipNext}
          title={t('btn_next_set')}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Reset */}
        <button
          id="btn-reset-timer"
          onClick={onReset}
          title={t('btn_reset')}
          className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Sound Settings Bar */}
      <div className="pt-2.5 sm:pt-3 border-t border-zinc-900 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs text-zinc-400">
        {/* Sound Theme Selector & Test Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sliders className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="font-medium text-zinc-300 whitespace-nowrap">{t('sound_theme')}:</span>
          </div>

          <select
            id="sound-theme-select"
            value={soundConfig.theme}
            onChange={(e) =>
              setSoundConfig((prev) => ({
                ...prev,
                theme: e.target.value as SoundTheme,
              }))
            }
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 flex-1 min-w-[140px] sm:flex-none"
          >
            {soundThemes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="btn-test-rest-sound"
              onClick={() => soundEngine.playRestSignal(soundConfig.theme)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-colors shrink-0"
              title="Test sound"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t('phase_rest')}</span>
            </button>
            <button
              type="button"
              id="btn-test-final-sound"
              onClick={() => soundEngine.playLastSetSignal(soundConfig.theme)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors shrink-0"
              title="Test sound"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('badge_final_round')}</span>
            </button>
          </div>
        </div>

        {/* Metronome & Volume Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Metronome 3s Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="metronome-checkbox"
              checked={soundConfig.metronome3s}
              onChange={(e) =>
                setSoundConfig((prev) => ({
                  ...prev,
                  metronome3s: e.target.checked,
                }))
              }
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-zinc-300 whitespace-nowrap text-xs">
              {t('sound_metronome')} (3s)
            </span>
          </label>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setSoundConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className="text-zinc-400 hover:text-white shrink-0"
              title={soundConfig.enabled ? t('nav_sound_off') : t('nav_sound_on')}
            >
              {soundConfig.enabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundConfig.volume}
              onChange={(e) =>
                setSoundConfig((prev) => ({
                  ...prev,
                  volume: parseFloat(e.target.value),
                }))
              }
              className="w-16 sm:w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-zinc-400 w-7 text-right text-xs">
              {Math.round(soundConfig.volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint (hidden on mobile) */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-zinc-500 pt-1">
        <span className="flex items-center gap-1">
          <Keyboard className="w-3.5 h-3.5" />
          <span>{t('hotkeys_title')}:</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
          [Space] {t('btn_start')} / {t('btn_pause')}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
          [R] {t('btn_reset')}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
          [← / →] {t('timer_set')}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">
          [M] {t('sound_volume')}
        </span>
      </div>
    </div>
  );
};
