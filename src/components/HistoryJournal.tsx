import React from 'react';
import { 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Flame, 
  Calendar 
} from 'lucide-react';
import { SessionRecord } from '../types';
import { useI18n } from '../i18n/context';

interface HistoryJournalProps {
  records: SessionRecord[];
  onClearHistory: () => void;
}

export const HistoryJournal: React.FC<HistoryJournalProps> = ({
  records,
  onClearHistory,
}) => {
  const { t, language } = useI18n();
  const totalWorkouts = records.length;
  const totalSeconds = records.reduce((acc, r) => acc + r.totalDurationSeconds, 0);
  const totalSets = records.reduce((acc, r) => acc + r.setsCompleted, 0);
  const fullyCompleted = records.filter((r) => r.completedFully).length;

  const formatHoursMins = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const hrUnit = language === 'en' ? 'h' : language === 'uk' ? 'год' : 'ч';
    if (hrs > 0) return `${hrs} ${hrUnit} ${mins} ${t('unit_min')}`;
    return `${mins} ${t('unit_min')} ${secs % 60} ${t('unit_sec')}`;
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const isEn = language === 'en';
    const isUk = language === 'uk';
    const header = isEn
      ? 'ID,Date & Time,Workout Plan,Duration (sec),Duration (MM:SS),Sets Done,Total Sets,Cycles Done,Total Cycles,Status\n'
      : isUk
      ? 'ID,Дата та Час,План тренування,Тривалість (сек),Тривалість (ММ:СС),Сетів пройдено,Всього сетів,Циклів пройдено,Всього циклів,Статус\n'
      : 'ID,Дата и Время,План тренировки,Длительность (сек),Длительность (ММ:СС),Сетов пройдено,Всего сетов,Циклов пройдено,Всего циклов,Статус\n';
    
    let csv = header;
    records.forEach((r) => {
      const m = Math.floor(r.totalDurationSeconds / 60);
      const s = r.totalDurationSeconds % 60;
      const statusStr = r.completedFully ? t('journal_status_completed') : t('journal_status_stopped');
      csv += `"${r.id}","${r.timestamp}","${r.planName.replace(/"/g, '""')}",${r.totalDurationSeconds},"${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}",${r.setsCompleted},${r.totalSets},${r.cyclesCompleted},${r.totalCycles},"${statusStr}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('journal_title')}</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {t('journal_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{t('journal_export_csv')}</span>
              </button>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-rose-400 hover:text-rose-300 hover:bg-zinc-800 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('journal_clear_all')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{totalWorkouts}</div>
            <div className="text-xs text-zinc-400">{t('journal_stat_workouts')}</div>
          </div>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{formatHoursMins(totalSeconds)}</div>
            <div className="text-xs text-zinc-400">{t('journal_stat_time')}</div>
          </div>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{totalSets}</div>
            <div className="text-xs text-zinc-400">{t('journal_stat_sets')}</div>
          </div>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">
              {totalWorkouts > 0 ? `${Math.round((fullyCompleted / totalWorkouts) * 100)}%` : '0%'}
            </div>
            <div className="text-xs text-zinc-400">{t('journal_stat_completed')}</div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Calendar className="w-8 h-8 text-zinc-600" />
            <p className="text-sm font-medium">{t('journal_empty_title')}</p>
            <p className="text-xs text-zinc-600">
              {t('journal_empty_desc')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">{t('journal_table_date')}</th>
                  <th className="py-3 px-4">{t('journal_table_plan')}</th>
                  <th className="py-3 px-4">{t('journal_table_duration')}</th>
                  <th className="py-3 px-4">{t('journal_table_sets')}</th>
                  <th className="py-3 px-4">{t('journal_table_cycles')}</th>
                  <th className="py-3 px-4">{t('journal_table_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {records.map((rec) => {
                  const mins = Math.floor(rec.totalDurationSeconds / 60);
                  const secs = rec.totalDurationSeconds % 60;
                  return (
                    <tr key={rec.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-400">
                        {rec.timestamp}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {rec.planName}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-white font-bold">{rec.setsCompleted}</span>
                        <span className="text-zinc-500"> / {rec.totalSets}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-white font-bold">{rec.cyclesCompleted}</span>
                        <span className="text-zinc-500"> / {rec.totalCycles}</span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.completedFully ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('journal_status_completed')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-medium">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t('journal_status_stopped')}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
