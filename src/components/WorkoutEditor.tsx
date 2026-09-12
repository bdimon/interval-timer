import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Play, 
  FileCode2, 
  Sparkles, 
  Check, 
  RotateCw,
  AlertTriangle,
  X,
  RotateCcw,
  Sliders,
  BookmarkCheck,
  PlusCircle
} from 'lucide-react';
import { WorkoutPlan, IntervalSet } from '../types';
import { exportPlanToCHeader } from '../utils/cExportHelper';

interface WorkoutEditorProps {
  plan: WorkoutPlan;
  onChangePlan: React.Dispatch<React.SetStateAction<WorkoutPlan>>;
  editingPresetId: string | null;
  onApplyPlan: (plan: WorkoutPlan, autoStart?: boolean) => void;
  onSavePresetUpdate: (plan: WorkoutPlan) => void;
  onSaveAsNewPreset: (plan: WorkoutPlan) => void;
  onResetToOriginalPreset?: () => void;
  onCreateBlankPlan?: () => void;
}

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  plan,
  onChangePlan,
  editingPresetId,
  onApplyPlan,
  onSavePresetUpdate,
  onSaveAsNewPreset,
  onResetToOriginalPreset,
  onCreateBlankPlan,
}) => {
  const [showCModal, setShowCModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Quick generator states
  const [genCount, setGenCount] = useState(6);
  const [genWork, setGenWork] = useState(30);
  const [genRest, setGenRest] = useState(15);

  const calculateTotalSeconds = (): number => {
    let singleCycle = 0;
    plan.sets.forEach((s) => {
      singleCycle += (s.workSeconds || 0) + (s.restSeconds || 0);
    });
    const totalCycles = (singleCycle * plan.cycles) + ((plan.cycles - 1) * (plan.cycleRestSeconds || 0));
    return (plan.prepSeconds || 0) + totalCycles;
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} мин ${secs} сек`;
  };

  const handleUpdateSet = (index: number, updates: Partial<IntervalSet>) => {
    onChangePlan((prev) => {
      const nextSets = [...prev.sets];
      nextSets[index] = { ...nextSets[index], ...updates };
      return { ...prev, sets: nextSets };
    });
  };

  const handleAddSet = () => {
    const newIndex = plan.sets.length + 1;
    const newSet: IntervalSet = {
      id: `set-${Date.now()}-${newIndex}`,
      name: `Сет ${newIndex}`,
      workSeconds: 30,
      restSeconds: 15,
    };
    onChangePlan((prev) => ({
      ...prev,
      sets: [...prev.sets, newSet],
    }));
  };

  const handleDuplicateSet = (index: number) => {
    const target = plan.sets[index];
    const duplicated: IntervalSet = {
      ...target,
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name} (Копия)`,
    };
    onChangePlan((prev) => {
      const nextSets = [...prev.sets];
      nextSets.splice(index + 1, 0, duplicated);
      return { ...prev, sets: nextSets };
    });
  };

  const handleDeleteSet = (index: number) => {
    if (plan.sets.length <= 1) return;
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSet = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= plan.sets.length) return;
    onChangePlan((prev) => {
      const nextSets = [...prev.sets];
      const temp = nextSets[index];
      nextSets[index] = nextSets[targetIndex];
      nextSets[targetIndex] = temp;
      return { ...prev, sets: nextSets };
    });
  };

  // Batch actions on sets
  const handleRemoveAllWorkCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        workSeconds: 0,
        // if rest is also 0, give it at least 15s rest so the set is valid
        restSeconds: s.restSeconds > 0 ? s.restSeconds : 15,
      })),
    }));
    notifySuccess('Удален счетчик работы во всех сетах (только отдых)');
  };

  const handleRemoveAllRestCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        restSeconds: 0,
        // if work is also 0, give it at least 30s work so the set is valid
        workSeconds: s.workSeconds > 0 ? s.workSeconds : 30,
      })),
    }));
    notifySuccess('Удален счетчик отдыха во всех сетах (непрерывная работа)');
  };

  const handleRestoreAllWorkCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        workSeconds: s.workSeconds > 0 ? s.workSeconds : 30,
      })),
    }));
    notifySuccess('Восстановлена работа во всех сетах (+30 сек)');
  };

  const handleRestoreAllRestCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        restSeconds: s.restSeconds > 0 ? s.restSeconds : 15,
      })),
    }));
    notifySuccess('Восстановлен отдых во всех сетах (+15 сек)');
  };

  const handleGenerateBatch = () => {
    const newSets: IntervalSet[] = Array.from({ length: genCount }).map((_, i) => ({
      id: `batch-${Date.now()}-${i + 1}`,
      name: `Сет ${i + 1}`,
      workSeconds: Math.max(0, genWork),
      restSeconds: Math.max(0, genRest),
    }));
    onChangePlan((prev) => ({
      ...prev,
      sets: newSets,
    }));
    notifySuccess(`Сгенерировано ${genCount} сетов`);
  };

  const notifySuccess = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleSaveUpdate = () => {
    onSavePresetUpdate(plan);
    notifySuccess('Изменения шаблона сохранены!');
  };

  const handleSaveNew = () => {
    onSaveAsNewPreset(plan);
    notifySuccess('Сохранен как новый шаблон!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Check if any set is completely empty (0 work and 0 rest)
  const hasInvalidSet = plan.sets.some((s) => (s.workSeconds || 0) <= 0 && (s.restSeconds || 0) <= 0);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Editing Preset Context Banner */}
      {editingPresetId && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-lg">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-zinc-300 font-medium">Редактирование шаблона: </span>
              <strong className="text-white font-bold">{plan.name}</strong>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Все изменения сохраняются в черновике автоматически при переходе между вкладками.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onResetToOriginalPreset && (
              <button
                type="button"
                onClick={onResetToOriginalPreset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
                title="Сбросить все внесенные изменения к оригиналу шаблона"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс к оригиналу</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveUpdate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить в шаблон</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Конструктор сложных циклов</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              C-Ready Struct
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Автосохранение при смене вкладок ✓
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Индивидуальная настройка интервалов: вы можете установить счетчик в 0с или удалить любой счетчик (работы или отдыха) в сете.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Blank Plan / Complex Cycle */}
          {onCreateBlankPlan && (
            <button
              id="btn-create-new-cycle"
              onClick={onCreateBlankPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              title="Начать новый сложный цикл с чистого листа"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Создать новый сложный цикл</span>
            </button>
          )}

          {/* Export to C Code */}
          <button
            id="btn-export-c-header"
            onClick={() => setShowCModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>C Заголовок (.h)</span>
          </button>

          {/* Save Update Preset if editing */}
          {editingPresetId ? (
            <button
              id="btn-save-preset-update"
              onClick={handleSaveUpdate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить изменения</span>
            </button>
          ) : null}

          {/* Save As New Preset */}
          <button
            id="btn-save-as-preset"
            onClick={handleSaveNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 text-xs font-semibold transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Сохранить как новый</span>
          </button>

          {/* Apply to Timer */}
          <button
            id="btn-apply-plan-now"
            onClick={() => onApplyPlan(plan, true)}
            disabled={hasInvalidSet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            title={hasInvalidSet ? 'Внимание: есть сет, где удалены оба счетчика' : 'Применить план и запустить таймер'}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Запустить таймер</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Warning if any set has 0 work and 0 rest */}
      {hasInvalidSet && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3.5 flex items-center gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Внимание: в одном или нескольких сетах удалены оба счетчика (работа 0с и отдых 0с).</strong>
            <p className="mt-0.5 text-amber-300/80">
              В каждом сете должен присутствовать хотя бы один счетчик (работа или отдых), либо удалите пустой сет кнопкой корзины.
            </p>
          </div>
        </div>
      )}

      {/* Plan General Settings Card */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Название тренировки / программы
          </label>
          <input
            type="text"
            value={plan.name}
            onChange={(e) => onChangePlan((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder="Например: HIIT Пирамида"
          />
        </div>

        {/* Prep Seconds with delete counter button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Подготовка (сек)
            </label>
            {plan.prepSeconds > 0 ? (
              <button
                type="button"
                onClick={() => onChangePlan((p) => ({ ...p, prepSeconds: 0 }))}
                className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-0.5"
                title="Удалить подготовку (сбросить на 0с)"
              >
                <X className="w-3 h-3" />
                <span>Удалить (0с)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChangePlan((p) => ({ ...p, prepSeconds: 5 }))}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <span>+ Добавить (5с)</span>
              </button>
            )}
          </div>
          <input
            type="number"
            min="0"
            max="120"
            value={plan.prepSeconds === 0 ? 0 : plan.prepSeconds}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChangePlan((p) => ({ ...p, prepSeconds: isNaN(val) ? 0 : Math.max(0, val) }));
            }}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Cycles */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Повторение всех сетов (Циклов)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="20"
              value={plan.cycles}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChangePlan((p) => ({ ...p, cycles: isNaN(val) ? 1 : Math.max(1, val) }));
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <RotateCw className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>
        </div>

        {/* Cycle Rest with delete counter button */}
        {plan.cycles > 1 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Отдых между циклами (сек)
              </label>
              {plan.cycleRestSeconds > 0 ? (
                <button
                  type="button"
                  onClick={() => onChangePlan((p) => ({ ...p, cycleRestSeconds: 0 }))}
                  className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-0.5"
                  title="Удалить отдых между циклами (0с)"
                >
                  <X className="w-3 h-3" />
                  <span>Удалить (0с)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onChangePlan((p) => ({ ...p, cycleRestSeconds: 60 }))}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>+ Добавить (60с)</span>
                </button>
              )}
            </div>
            <input
              type="number"
              min="0"
              max="600"
              value={plan.cycleRestSeconds === 0 ? 0 : plan.cycleRestSeconds}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChangePlan((p) => ({
                  ...p,
                  cycleRestSeconds: isNaN(val) ? 0 : Math.max(0, val),
                }));
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Summary Duration Badge */}
        <div className="flex flex-col justify-center rounded-xl bg-zinc-900/90 border border-zinc-800 p-3">
          <span className="text-[11px] text-zinc-400 font-medium">Общее время тренировки:</span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {formatDuration(calculateTotalSeconds())}
          </span>
        </div>
      </div>

      {/* Quick Generator Accordion / Banner */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Быстрый генератор равномерных сетов:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Сетов:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={genCount}
              onChange={(e) => setGenCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-center text-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Работа:</span>
            <input
              type="number"
              min="0"
              max="600"
              value={genWork}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setGenWork(isNaN(v) ? 0 : Math.max(0, v));
              }}
              className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-center text-white font-mono"
            />
            <span className="text-zinc-500 text-[11px]">сек</span>
            {genWork > 0 ? (
              <button
                type="button"
                onClick={() => setGenWork(0)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950/40 text-[11px] text-zinc-400 hover:text-rose-300 border border-zinc-700 transition-colors"
                title="Удалить работу (0с)"
              >
                0с (без работы)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGenWork(30)}
                className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] transition-colors"
              >
                + 30с
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Отдых:</span>
            <input
              type="number"
              min="0"
              max="600"
              value={genRest}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setGenRest(isNaN(v) ? 0 : Math.max(0, v));
              }}
              className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-center text-white font-mono"
            />
            <span className="text-zinc-500 text-[11px]">сек</span>
            {genRest > 0 ? (
              <button
                type="button"
                onClick={() => setGenRest(0)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950/40 text-[11px] text-zinc-400 hover:text-rose-300 border border-zinc-700 transition-colors"
                title="Удалить отдых (0с)"
              >
                0с (без отдыха)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGenRest(15)}
                className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-[11px] transition-colors"
              >
                + 15с
              </button>
            )}
          </div>

          <button
            onClick={handleGenerateBatch}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            Сгенерировать
          </button>
        </div>
      </div>

      {/* Complex Sets List */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Список сетов ({plan.sets.length})
            </h3>
          </div>

          {/* Mass Actions for counters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRemoveAllWorkCounters}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title="Удалить счетчик работы во всех сетах (останется только отдых)"
            >
              Удалить работу во всех (0с)
            </button>

            <button
              type="button"
              onClick={handleRemoveAllRestCounters}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title="Удалить счетчик отдыха во всех сетах (непрерывная работа)"
            >
              Удалить отдых во всех (0с)
            </button>

            <button
              type="button"
              onClick={handleRestoreAllWorkCounters}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs transition-colors"
              title="Вернуть работу (+30с) во все сеты"
            >
              +30с работы всем
            </button>

            <button
              type="button"
              onClick={handleRestoreAllRestCounters}
              className="px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs transition-colors"
              title="Вернуть отдых (+15с) во все сеты"
            >
              +15с отдыха всем
            </button>

            <button
              id="btn-add-set"
              onClick={handleAddSet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить сет</span>
            </button>
          </div>
        </div>

        {plan.sets.map((set, idx) => {
          const isWorkDeleted = (set.workSeconds || 0) === 0;
          const isRestDeleted = (set.restSeconds || 0) === 0;
          const isBothDeleted = isWorkDeleted && isRestDeleted;

          return (
            <div
              key={set.id}
              className={`bg-zinc-950 rounded-2xl border p-4 shadow-sm transition-colors flex flex-col gap-3 ${
                isBothDeleted
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Row 1: Set Number, Name, and Quick Reorder / Duplicate / Delete Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-300 shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={set.name}
                    onChange={(e) => handleUpdateSet(idx, { name: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Название упражнения"
                  />
                </div>

                {/* Move & Duplicate & Delete set */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveSet(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                    title="Переместить сет вверх"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSet(idx, 'down')}
                    disabled={idx === plan.sets.length - 1}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                    title="Переместить сет вниз"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateSet(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 transition-colors"
                    title="Дублировать сет"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSet(idx)}
                    disabled={plan.sets.length <= 1}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    title="Удалить весь этот сет"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warning if both counters are deleted */}
              {isBothDeleted && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    В сете удалены оба счетчика (0с работы и 0с отдыха). Добавьте работу или отдых, либо удалите этот сет.
                  </span>
                </div>
              )}

              {/* Row 2: Counter Controls with explicit Delete/Restore functionality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                {/* 1. СЧЕТЧИК РАБОТЫ */}
                <div className={`rounded-xl p-3 border transition-all ${
                  isWorkDeleted
                    ? 'bg-zinc-900/30 border-zinc-800/60'
                    : 'bg-zinc-900/70 border-emerald-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${isWorkDeleted ? 'bg-zinc-600' : 'bg-emerald-400'}`} />
                      <span className={isWorkDeleted ? 'text-zinc-500 line-through' : 'text-emerald-400'}>
                        Счетчик работы:
                      </span>
                    </span>

                    {/* Button to delete or restore work counter */}
                    {isWorkDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 30 })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                        title="Добавить счетчик работы (30 сек)"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Добавить работу (+30с)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 0 })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-500/30 text-[11px] transition-colors"
                        title="Удалить счетчик работы (установить в 0 сек)"
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Удалить счетчик (0с)</span>
                      </button>
                    )}
                  </div>

                  {!isWorkDeleted ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="3600"
                        value={set.workSeconds === 0 ? 0 : set.workSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleUpdateSet(idx, {
                            workSeconds: isNaN(val) ? 0 : Math.max(0, val),
                          });
                        }}
                        className="w-20 bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-center font-mono text-sm text-white font-bold focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">сек</span>

                      {/* Quick adjustment buttons */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              workSeconds: Math.max(0, (set.workSeconds || 0) - 5),
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Убавить 5 секунд"
                        >
                          -5с
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              workSeconds: (set.workSeconds || 0) + 5,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Прибавить 5 секунд"
                        >
                          +5с
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              workSeconds: (set.workSeconds || 0) + 15,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Прибавить 15 секунд"
                        >
                          +15с
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic py-1 flex items-center justify-between">
                      <span>Счетчик удален: фаза работы пропущена (0с)</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 45 })}
                        className="text-[11px] text-zinc-400 hover:text-emerald-400 hover:underline"
                      >
                        +45с
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. СЧЕТЧИК ОТДЫХА */}
                <div className={`rounded-xl p-3 border transition-all ${
                  isRestDeleted
                    ? 'bg-zinc-900/30 border-zinc-800/60'
                    : 'bg-zinc-900/70 border-cyan-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${isRestDeleted ? 'bg-zinc-600' : 'bg-cyan-400'}`} />
                      <span className={isRestDeleted ? 'text-zinc-500 line-through' : 'text-cyan-400'}>
                        Счетчик отдыха:
                      </span>
                    </span>

                    {/* Button to delete or restore rest counter */}
                    {isRestDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 15 })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
                        title="Добавить счетчик отдыха (15 сек)"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Добавить отдых (+15с)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 0 })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-500/30 text-[11px] transition-colors"
                        title="Удалить счетчик отдыха (установить в 0 сек)"
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Удалить счетчик (0с)</span>
                      </button>
                    )}
                  </div>

                  {!isRestDeleted ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="3600"
                        value={set.restSeconds === 0 ? 0 : set.restSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleUpdateSet(idx, {
                            restSeconds: isNaN(val) ? 0 : Math.max(0, val),
                          });
                        }}
                        className="w-20 bg-zinc-950 border border-zinc-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-center font-mono text-sm text-white font-bold focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">сек</span>

                      {/* Quick adjustment buttons */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              restSeconds: Math.max(0, (set.restSeconds || 0) - 5),
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Убавить 5 секунд"
                        >
                          -5с
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              restSeconds: (set.restSeconds || 0) + 5,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Прибавить 5 секунд"
                        >
                          +5с
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              restSeconds: (set.restSeconds || 0) + 15,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                          title="Прибавить 15 секунд"
                        >
                          +15с
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic py-1 flex items-center justify-between">
                      <span>Счетчик удален: отдых пропущен (переход к след. сету)</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 30 })}
                        className="text-[11px] text-zinc-400 hover:text-cyan-400 hover:underline"
                      >
                        +30с
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* C Code Export Modal */}
      {showCModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Экспорт плана в структуру C (.h)
                </h3>
              </div>
              <button
                onClick={() => setShowCModal(false)}
                className="text-zinc-400 hover:text-white px-2 py-1 text-sm font-semibold"
              >
                ✕ Закрыть
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 bg-zinc-900/90 leading-relaxed">
              <pre>{exportPlanToCHeader(plan)}</pre>
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
              <p className="text-xs text-zinc-400">
                Вставьте этот код в <code className="text-emerald-400">c_src/</code> для использования в C программе.
              </p>
              <button
                onClick={() => copyToClipboard(exportPlanToCHeader(plan))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copiedCode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                }`}
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Скопировано!' : 'Копировать C код'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
