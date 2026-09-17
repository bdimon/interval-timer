import React from 'react';
import { 
  PlayCircle, 
  Settings2, 
  Terminal, 
  Bookmark, 
  History, 
  FileCode2, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Plus
} from 'lucide-react';
import { SoundConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../i18n/context';

export type ActiveTab = 'timer' | 'editor' | 'terminal' | 'presets' | 'journal' | 'c_code';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundConfig: SoundConfig;
  setSoundConfig: React.Dispatch<React.SetStateAction<SoundConfig>>;
  onNewWorkout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundConfig,
  setSoundConfig,
  onNewWorkout,
}) => {
  const { t } = useI18n();

  const toggleMute = () => {
    setSoundConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const navItems = [
    { id: 'timer' as ActiveTab, label: t('nav_timer'), icon: PlayCircle },
    { id: 'editor' as ActiveTab, label: t('nav_editor'), icon: Settings2 },
    { id: 'terminal' as ActiveTab, label: t('nav_terminal'), icon: Terminal },
    { id: 'presets' as ActiveTab, label: t('nav_presets'), icon: Bookmark },
    { id: 'journal' as ActiveTab, label: t('nav_journal'), icon: History },
    { id: 'c_code' as ActiveTab, label: t('nav_c_code'), icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 pt-4 pb-3.5 sm:pt-6 sm:pb-5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[52px] sm:min-h-[60px]">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm shadow-sm shrink-0">
              C:T
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white select-none whitespace-nowrap">
              C INTERVAL TIMER
            </span>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: New Workout & Language & Audio & Fullscreen & PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {onNewWorkout && (
              <button
                id="btn-navbar-new-workout"
                onClick={onNewWorkout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-semibold transition-all shadow-xs"
                title={t('nav_new_cycle')}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span>{t('nav_new_cycle')}</span>
              </button>
            )}

            <PWAInstallButton />

            <button
              id="btn-quick-mute"
              onClick={toggleMute}
              title={soundConfig.enabled ? t('nav_sound_off') : t('nav_sound_on')}
              className={`p-2 rounded-lg border transition-colors ${
                soundConfig.enabled
                  ? 'bg-zinc-900 border-zinc-700 text-emerald-400 hover:bg-zinc-800'
                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {soundConfig.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="btn-fullscreen-toggle"
              onClick={toggleFullscreen}
              title={t('nav_fullscreen')}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Nav */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1.5 border-t border-zinc-900 scrollbar-none items-center">
          {onNewWorkout && (
            <>
              <button
                id="mobile-nav-new-workout"
                onClick={onNewWorkout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs whitespace-nowrap font-medium rounded-md bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 active:scale-95 transition-all shrink-0"
                title={t('nav_new_cycle')}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span>{t('nav_new_cycle')}</span>
              </button>
              <div className="h-4 w-px bg-zinc-800 shrink-0 mx-0.5" />
            </>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
