import React, { useState, useEffect } from 'react';
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
import { useI18n } from '../i18n/context';
import { getLocalizedPlanName, localizeWorkoutPlan } from '../utils/defaultPresets';

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
  const { t, language } = useI18n();
  const [showCModal, setShowCModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Track saved state & pending modifications for reactive button rendering
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(() => JSON.stringify(plan));
  const [justSavedUpdate, setJustSavedUpdate] = useState(false);
  const [justSavedNew, setJustSavedNew] = useState(false);

  useEffect(() => {
    setLastSavedSnapshot(JSON.stringify(plan));
    setJustSavedUpdate(false);
    setJustSavedNew(false);
  }, [editingPresetId]);

  useEffect(() => {
    setLastSavedSnapshot((prevSnapshot) => {
      try {
        const prevObj = JSON.parse(prevSnapshot);
        const localizedPrev = localizeWorkoutPlan(prevObj, language);
        return JSON.stringify(localizedPrev);
      } catch {
        return prevSnapshot;
      }
    });
  }, [language]);

  const isPlanModified = JSON.stringify(plan) !== lastSavedSnapshot;

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
    return `${mins} ${t('unit_min')} ${secs} ${t('unit_sec')}`;
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
    const isTabata = plan.id === 'tabata-classic';
    const defaultPrefix = isTabata 
      ? (language === 'en' ? 'Round' : 'Раунд')
      : (language === 'en' ? 'Set' : language === 'uk' ? 'Сет' : 'Сет');
    const newSet: IntervalSet = {
      id: `set-${Date.now()}-${newIndex}`,
      name: `${defaultPrefix} ${newIndex}`,
      workSeconds: isTabata ? 20 : 30,
      restSeconds: isTabata ? 10 : 15,
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
      name: `${target.name} (2)`,
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
    notifySuccess(t('editor_remove_work_all'));
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
    notifySuccess(t('editor_remove_rest_all'));
  };

  const handleRestoreAllWorkCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        workSeconds: s.workSeconds > 0 ? s.workSeconds : 30,
      })),
    }));
    notifySuccess(t('editor_add_work_all'));
  };

  const handleRestoreAllRestCounters = () => {
    onChangePlan((prev) => ({
      ...prev,
      sets: prev.sets.map((s) => ({
        ...s,
        restSeconds: s.restSeconds > 0 ? s.restSeconds : 15,
      })),
    }));
    notifySuccess(t('editor_add_rest_all'));
  };

  const handleGenerateBatch = () => {
    const isTabata = plan.id === 'tabata-classic';
    const defaultPrefix = isTabata 
      ? (language === 'en' ? 'Round' : 'Раунд')
      : (language === 'en' ? 'Set' : language === 'uk' ? 'Сет' : 'Сет');
    const newSets: IntervalSet[] = Array.from({ length: genCount }).map((_, i) => ({
      id: `batch-${Date.now()}-${i + 1}`,
      name: `${defaultPrefix} ${i + 1}`,
      workSeconds: Math.max(0, genWork),
      restSeconds: Math.max(0, genRest),
    }));
    onChangePlan((prev) => ({
      ...prev,
      sets: newSets,
    }));
    notifySuccess(`${t('editor_gen_btn')}: ${genCount}`);
  };

  const notifySuccess = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleSaveUpdate = () => {
    onSavePresetUpdate(plan);
    setLastSavedSnapshot(JSON.stringify(plan));
    setJustSavedUpdate(true);
    notifySuccess(t('editor_btn_changes_saved'));
    setTimeout(() => {
      setJustSavedUpdate(false);
    }, 3500);
  };

  const handleSaveNew = () => {
    onSaveAsNewPreset(plan);
    setLastSavedSnapshot(JSON.stringify(plan));
    setJustSavedNew(true);
    notifySuccess(t('editor_btn_saved_as_new'));
    setTimeout(() => {
      setJustSavedNew(false);
    }, 3500);
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
              <span className="text-zinc-300 font-medium">{t('editor_editing_badge')}: </span>
              <strong className="text-white font-bold">{getLocalizedPlanName(plan, language) || plan.name}</strong>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {t('editor_autosave_badge')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onResetToOriginalPreset && (
              <button
                type="button"
                onClick={() => {
                  onResetToOriginalPreset();
                  setJustSavedUpdate(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
                title={t('editor_reset_draft')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('editor_reset_draft')}</span>
              </button>
            )}
            <button
              type="button"
              id="btn-banner-save-preset"
              onClick={handleSaveUpdate}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                justSavedUpdate
                  ? 'bg-emerald-400 text-zinc-950 shadow-emerald-500/30 ring-2 ring-emerald-300 scale-105'
                  : isPlanModified
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              {justSavedUpdate ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-zinc-950" />
                  <span>{t('editor_btn_changes_saved')}</span>
                </>
              ) : isPlanModified ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('editor_btn_save_changes')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 ml-0.5 animate-pulse" />
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('editor_btn_changes_saved')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{t('editor_title')}</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {t('editor_c_ready_badge')}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {t('editor_autosave_badge')}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {t('editor_custom_desc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Blank Plan / Complex Cycle */}
          {onCreateBlankPlan && (
            <button
              id="btn-create-new-cycle"
              onClick={onCreateBlankPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('editor_btn_new_cycle')}</span>
            </button>
          )}

          {/* Export to C Code */}
          <button
            id="btn-export-c-header"
            onClick={() => setShowCModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>{t('editor_btn_c_header')}</span>
          </button>

          {/* Save Update Preset if editing */}
          {editingPresetId ? (
            <button
              id="btn-save-preset-update"
              onClick={handleSaveUpdate}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                justSavedUpdate
                  ? 'bg-emerald-400 text-zinc-950 font-bold shadow-emerald-500/30 ring-2 ring-emerald-300 scale-105'
                  : isPlanModified
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-1 ring-emerald-400/50'
                  : 'bg-zinc-900 border border-emerald-500/40 text-emerald-400 hover:bg-zinc-800'
              }`}
            >
              {justSavedUpdate ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5] text-zinc-950" />
                  <span>{t('editor_btn_changes_saved')}</span>
                </>
              ) : isPlanModified ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('editor_btn_save_changes')}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5 animate-pulse" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t('editor_btn_changes_saved')}</span>
                </>
              )}
            </button>
          ) : null}

          {/* Save As New Preset */}
          <button
            id="btn-save-as-preset"
            onClick={handleSaveNew}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              justSavedNew
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-emerald-500/30 ring-2 ring-emerald-300'
                : 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {justSavedNew ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] text-zinc-950" />
                <span>{t('editor_btn_saved_as_new')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{t('editor_save_as_new')}</span>
              </>
            )}
          </button>

          {/* Apply to Timer */}
          <button
            id="btn-apply-plan-now"
            onClick={() => onApplyPlan(plan, true)}
            disabled={hasInvalidSet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t('editor_btn_start_timer')}</span>
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
            <strong>{t('editor_warning_invalid_set')}</strong>
            <p className="mt-0.5 text-amber-300/80">
              {t('editor_warning_invalid_desc')}
            </p>
          </div>
        </div>
      )}

      {/* Plan General Settings Card */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            {t('editor_plan_name_label')}
          </label>
          <input
            type="text"
            value={plan.name}
            onChange={(e) => onChangePlan((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder={t('editor_plan_name_placeholder')}
          />
        </div>

        {/* Prep Seconds with delete counter button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-400">
              {t('editor_prep_sec')}
            </label>
            {plan.prepSeconds > 0 ? (
              <button
                type="button"
                onClick={() => onChangePlan((p) => ({ ...p, prepSeconds: 0 }))}
                className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-0.5"
                title={t('editor_delete_counter')}
              >
                <X className="w-3 h-3" />
                <span>{t('editor_delete_counter')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChangePlan((p) => ({ ...p, prepSeconds: 5 }))}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <span>{t('editor_add_counter')} (5{t('unit_sec')})</span>
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
            {t('editor_cycles')}
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
                {t('editor_cycle_rest')}
              </label>
              {plan.cycleRestSeconds > 0 ? (
                <button
                  type="button"
                  onClick={() => onChangePlan((p) => ({ ...p, cycleRestSeconds: 0 }))}
                  className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-0.5"
                  title={t('editor_delete_counter')}
                >
                  <X className="w-3 h-3" />
                  <span>{t('editor_delete_counter')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onChangePlan((p) => ({ ...p, cycleRestSeconds: 60 }))}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <span>{t('editor_add_counter')} (60{t('unit_sec')})</span>
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
          <span className="text-[11px] text-zinc-400 font-medium">{t('editor_total_time')}</span>
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
            {t('editor_quick_gen_title')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">{t('editor_gen_sets_label')}</span>
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
            <span className="text-zinc-400">{t('editor_gen_work_label')}</span>
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
            <span className="text-zinc-500 text-[11px]">{t('unit_sec')}</span>
            {genWork > 0 ? (
              <button
                type="button"
                onClick={() => setGenWork(0)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950/40 text-[11px] text-zinc-400 hover:text-rose-300 border border-zinc-700 transition-colors"
                title={t('editor_gen_no_work')}
              >
                {t('editor_gen_no_work')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGenWork(30)}
                className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] transition-colors"
              >
                + 30{t('unit_sec')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">{t('editor_gen_rest_label')}</span>
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
            <span className="text-zinc-500 text-[11px]">{t('unit_sec')}</span>
            {genRest > 0 ? (
              <button
                type="button"
                onClick={() => setGenRest(0)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950/40 text-[11px] text-zinc-400 hover:text-rose-300 border border-zinc-700 transition-colors"
                title={t('editor_gen_no_rest')}
              >
                {t('editor_gen_no_rest')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGenRest(15)}
                className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-[11px] transition-colors"
              >
                + 15{t('unit_sec')}
              </button>
            )}
          </div>

          <button
            onClick={handleGenerateBatch}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            {t('editor_gen_btn')}
          </button>
        </div>
      </div>

      {/* Complex Sets List */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              {t('editor_sets_list_title')} ({plan.sets.length})
            </h3>
          </div>

          {/* Mass Actions for counters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRemoveAllWorkCounters}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title={t('editor_remove_work_all')}
            >
              {t('editor_remove_work_all')}
            </button>

            <button
              type="button"
              onClick={handleRemoveAllRestCounters}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title={t('editor_remove_rest_all')}
            >
              {t('editor_remove_rest_all')}
            </button>

            <button
              type="button"
              onClick={handleRestoreAllWorkCounters}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs transition-colors"
              title={t('editor_add_work_all')}
            >
              {t('editor_add_work_all')}
            </button>

            <button
              type="button"
              onClick={handleRestoreAllRestCounters}
              className="px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs transition-colors"
              title={t('editor_add_rest_all')}
            >
              {t('editor_add_rest_all')}
            </button>

            <button
              id="btn-add-set"
              onClick={handleAddSet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('editor_add_set')}</span>
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
                    placeholder={t('editor_set_placeholder')}
                  />
                </div>

                {/* Move & Duplicate & Delete set */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveSet(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                    title={t('editor_move_up')}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSet(idx, 'down')}
                    disabled={idx === plan.sets.length - 1}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                    title={t('editor_move_down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateSet(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 transition-colors"
                    title={t('editor_duplicate_set')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSet(idx)}
                    disabled={plan.sets.length <= 1}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    title={t('editor_delete_set')}
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
                    {t('editor_both_counters_empty')}
                  </span>
                </div>
              )}

              {/* Row 2: Counter Controls with explicit Delete/Restore functionality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                {/* 1. WORK COUNTER */}
                <div className={`rounded-xl p-3 border transition-all ${
                  isWorkDeleted
                    ? 'bg-zinc-900/30 border-zinc-800/60'
                    : 'bg-zinc-900/70 border-emerald-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${isWorkDeleted ? 'bg-zinc-600' : 'bg-emerald-400'}`} />
                      <span className={isWorkDeleted ? 'text-zinc-500 line-through' : 'text-emerald-400'}>
                        {t('editor_work_counter_title')}
                      </span>
                    </span>

                    {/* Button to delete or restore work counter */}
                    {isWorkDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 30 })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                        title={t('editor_add_counter')}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t('editor_add_counter')} (+30{t('unit_sec')})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 0 })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-500/30 text-[11px] transition-colors"
                        title={t('editor_delete_counter')}
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>{t('editor_delete_counter')}</span>
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
                      <span className="text-xs text-zinc-400">{t('unit_sec')}</span>

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
                        >
                          -5{t('unit_sec')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              workSeconds: (set.workSeconds || 0) + 5,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                        >
                          +5{t('unit_sec')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              workSeconds: (set.workSeconds || 0) + 15,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                        >
                          +15{t('unit_sec')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic py-1 flex items-center justify-between">
                      <span>{t('editor_work_counter_empty')}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { workSeconds: 45 })}
                        className="text-[11px] text-zinc-400 hover:text-emerald-400 hover:underline"
                      >
                        +45{t('unit_sec')}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. REST COUNTER */}
                <div className={`rounded-xl p-3 border transition-all ${
                  isRestDeleted
                    ? 'bg-zinc-900/30 border-zinc-800/60'
                    : 'bg-zinc-900/70 border-cyan-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${isRestDeleted ? 'bg-zinc-600' : 'bg-cyan-400'}`} />
                      <span className={isRestDeleted ? 'text-zinc-500 line-through' : 'text-cyan-400'}>
                        {t('editor_rest_counter_title')}
                      </span>
                    </span>

                    {/* Button to delete or restore rest counter */}
                    {isRestDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 15 })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
                        title={t('editor_add_counter')}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t('editor_add_counter')} (+15{t('unit_sec')})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 0 })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-500/30 text-[11px] transition-colors"
                        title={t('editor_delete_counter')}
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>{t('editor_delete_counter')}</span>
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
                      <span className="text-xs text-zinc-400">{t('unit_sec')}</span>

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
                        >
                          -5{t('unit_sec')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              restSeconds: (set.restSeconds || 0) + 5,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                        >
                          +5{t('unit_sec')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSet(idx, {
                              restSeconds: (set.restSeconds || 0) + 15,
                            })
                          }
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono"
                        >
                          +15{t('unit_sec')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic py-1 flex items-center justify-between">
                      <span>{t('editor_rest_counter_empty')}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSet(idx, { restSeconds: 30 })}
                        className="text-[11px] text-zinc-400 hover:text-cyan-400 hover:underline"
                      >
                        +30{t('unit_sec')}
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
                  {t('editor_export_modal_title')}
                </h3>
              </div>
              <button
                onClick={() => setShowCModal(false)}
                className="text-zinc-400 hover:text-white px-2 py-1 text-sm font-semibold"
              >
                ✕ {t('editor_close')}
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 bg-zinc-900/90 leading-relaxed">
              <pre>{exportPlanToCHeader(plan)}</pre>
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
              <p className="text-xs text-zinc-400">
                {t('editor_export_modal_hint')}
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
                <span>{copiedCode ? t('c_code_copied') : t('c_code_copy')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
