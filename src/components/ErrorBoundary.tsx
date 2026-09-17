import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('c_interval_timer_presets_v1');
      localStorage.removeItem('c_interval_timer_history_v1');
      localStorage.removeItem('c_interval_timer_editor_draft_v2');
      localStorage.removeItem('c_interval_timer_editing_id_v2');
      localStorage.removeItem('timer_display_mode');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const savedLang = (typeof localStorage !== 'undefined' && (localStorage.getItem('c_interval_timer_lang') as Language)) || 'ru';
      const t = translations[savedLang] || translations.ru;

      return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">{t.error_boundary_title}</h2>
              <p className="text-xs text-zinc-400">
                {t.error_boundary_desc}
              </p>
            </div>

            {this.state.error && (
              <div className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-rose-300 max-h-32 overflow-y-auto break-all">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.error_boundary_reset}</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.error_boundary_reload}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
