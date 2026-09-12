import React, { useState } from 'react';
import { 
  Play, 
  Settings2, 
  Trash2, 
  FileCode2, 
  Download, 
  Upload, 
  RotateCcw, 
  Clock, 
  Check, 
  Copy,
  Plus,
  Sparkles
} from 'lucide-react';
import { WorkoutPlan } from '../types';
import { exportPlanToCHeader } from '../utils/cExportHelper';

interface PresetsManagerProps {
  presets: WorkoutPlan[];
  onSelectPreset: (plan: WorkoutPlan, autoStart?: boolean) => void;
  onEditPreset: (plan: WorkoutPlan) => void;
  onCreateNewPreset: () => void;
  onDeletePreset: (id: string) => void;
  onResetDefaults: () => void;
  onImportPresets: (plans: WorkoutPlan[]) => void;
}

export const PresetsManager: React.FC<PresetsManagerProps> = ({
  presets,
  onSelectPreset,
  onEditPreset,
  onCreateNewPreset,
  onDeletePreset,
  onResetDefaults,
  onImportPresets,
}) => {
  const [activeExportPlan, setActiveExportPlan] = useState<WorkoutPlan | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateTotalDuration = (plan: WorkoutPlan): string => {
    let singleCycle = 0;
    plan.sets.forEach((s) => {
      singleCycle += s.workSeconds + s.restSeconds;
    });
    const total = plan.prepSeconds + (singleCycle * plan.cycles) + ((plan.cycles - 1) * plan.cycleRestSeconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}м ${s}с`;
  };

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'workout_presets.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportPresets(parsed);
        }
      } catch (err) {
        console.error('Failed to parse presets file', err);
      }
    };
    reader.readAsText(file);
  };

  const copyCHeader = (plan: WorkoutPlan) => {
    const cCode = exportPlanToCHeader(plan);
    navigator.clipboard.writeText(cCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header with actions */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Шаблоны тренировок</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Готовые и сохраненные программы тренировок с поддержкой экспорта в C и JSON.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create New Preset Button */}
          <button
            id="btn-create-new-preset"
            onClick={onCreateNewPreset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            title="Создать новый шаблон с чистого листа в конструкторе"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать новый шаблон</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportAllJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Экспорт JSON</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Импорт JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Reset to Defaults */}
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
            title="Восстановить заводские шаблоны"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Action Card: Create New Preset */}
        <div
          onClick={onCreateNewPreset}
          className="group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/60 bg-zinc-950/60 hover:bg-emerald-950/10 p-5 flex flex-col items-center justify-center text-center transition-all min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-emerald-500/20 border border-zinc-700 group-hover:border-emerald-500/40 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 mb-3 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-zinc-200 group-hover:text-white transition-colors">
            Создать новый шаблон
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mt-1.5 leading-relaxed">
            Сконструировать произвольную тренировку с нуля: сеты, интервалы работы и отдыха, циклы и C-экспорт.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:underline">
            <span>Открыть в конструкторе</span>
            <span>→</span>
          </span>
        </div>

        {presets.map((preset) => (
          <div
            key={preset.id}
            className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-base text-white">{preset.name}</h3>
                <span className="shrink-0 flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>{calculateTotalDuration(preset)}</span>
                </span>
              </div>

              {preset.description && (
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Сетов: <strong className="text-white">{preset.sets.length}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Циклов: <strong className="text-white">{preset.cycles}</strong>
                </span>
                {preset.prepSeconds > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400">
                    Подготовка: {preset.prepSeconds}с
                  </span>
                )}
              </div>

              {/* Set Preview Pills */}
              <div className="flex flex-wrap gap-1.5 mb-5 max-h-20 overflow-y-auto pr-1">
                {preset.sets.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300"
                  >
                    {idx + 1}.{' '}
                    {s.workSeconds > 0 ? (
                      <span className="text-emerald-400">{s.workSeconds}с</span>
                    ) : (
                      <span className="text-zinc-500 line-through">0с</span>
                    )}{' '}
                    /{' '}
                    {s.restSeconds > 0 ? (
                      <span className="text-cyan-400">{s.restSeconds}с</span>
                    ) : (
                      <span className="text-zinc-500 line-through">0с</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditPreset(preset)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
                  title="Редактировать в конструкторе"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveExportPlan(preset)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-xs transition-colors"
                  title="Экспорт в C (.h)"
                >
                  <FileCode2 className="w-4 h-4" />
                </button>
                {preset.isCustom && (
                  <button
                    onClick={() => onDeletePreset(preset.id)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 text-xs transition-colors"
                    title="Удалить шаблон"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => onSelectPreset(preset, true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Запустить</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* C Code Export Modal */}
      {activeExportPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  C Заголовок: {activeExportPlan.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveExportPlan(null)}
                className="text-zinc-400 hover:text-white px-2 py-1 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 bg-zinc-900/90 leading-relaxed">
              <pre>{exportPlanToCHeader(activeExportPlan)}</pre>
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
              <span className="text-xs text-zinc-400">
                Готово для включения в проект C
              </span>
              <button
                onClick={() => copyCHeader(activeExportPlan)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Копировать C код'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
