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
  Maximize2 
} from 'lucide-react';
import { SoundConfig } from '../types';

export type ActiveTab = 'timer' | 'editor' | 'terminal' | 'presets' | 'journal' | 'c_code';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundConfig: SoundConfig;
  setSoundConfig: React.Dispatch<React.SetStateAction<SoundConfig>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundConfig,
  setSoundConfig,
}) => {
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
    { id: 'timer' as ActiveTab, label: 'Таймер (GUI)', icon: PlayCircle },
    { id: 'editor' as ActiveTab, label: 'Сложные циклы', icon: Settings2 },
    { id: 'terminal' as ActiveTab, label: 'C Консоль (CLI)', icon: Terminal },
    { id: 'presets' as ActiveTab, label: 'Шаблоны', icon: Bookmark },
    { id: 'journal' as ActiveTab, label: 'Журнал сессий', icon: History },
    { id: 'c_code' as ActiveTab, label: 'C Код & Android', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
              C:T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  C INTERVAL TIMER
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-zinc-800 text-emerald-400 border border-zinc-700">
                  Core Engine v2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                ANSI CLI + Web GUI + Android APK Bridge
              </p>
            </div>
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

          {/* Controls: Audio & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-quick-mute"
              onClick={toggleMute}
              title={soundConfig.enabled ? 'Выключить звук (M)' : 'Включить звук (M)'}
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
              title="Полноэкранный режим"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Nav */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-zinc-900 scrollbar-none">
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
                    : 'text-zinc-400 hover:bg-zinc-900'
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
