import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  Terminal, 
  Smartphone, 
  Globe
} from 'lucide-react';
import { C_SOURCE_FILES } from '../c_code/cSourceFiles';
import { useI18n } from '../i18n/context';

export const CCodeViewer: React.FC = () => {
  const { t, language } = useI18n();
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = C_SOURCE_FILES[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = activeFile.content.split('\n').length;

  const getFileLocalizedMeta = (filename: string) => {
    switch (filename) {
      case 'interval_timer.h':
        return {
          name: language === 'en' ? 'Core Header File' : language === 'uk' ? 'Заголовний файл ядра' : 'Заголовочный файл ядра',
          desc: language === 'en'
            ? 'Data structures (WorkoutPlan, IntervalSet, TimerState), phase enums, and API function prototypes.'
            : language === 'uk'
            ? 'Структури даних (WorkoutPlan, IntervalSet, TimerState), перерахування фаз та прототипи API функцій.'
            : 'Структуры данных (WorkoutPlan, IntervalSet, TimerState), перечисления фаз и прототипы API функций.',
        };
      case 'interval_timer.c':
        return {
          name: language === 'en' ? 'Timer Core Implementation' : language === 'uk' ? 'Реалізація ядра таймера' : 'Реализация ядра таймера',
          desc: language === 'en'
            ? 'Phase switching logic, countdown loop, callbacks, sound signals, metronome, and storage.'
            : language === 'uk'
            ? 'Логіка зміни фаз, зворотного відліку, зворотних викликів, звукових сигналів, метронома та сховища.'
            : 'Логика смены фаз, отсчета времени, обратных вызовов, звуковых сигналов, метронома и файлового хранилища.',
        };
      case 'main.c':
        return {
          name: language === 'en' ? 'Main CLI Console Program' : language === 'uk' ? 'Головна програма (Консоль CLI)' : 'Главная программа (Консоль CLI)',
          desc: language === 'en'
            ? 'ANSI HUD terminal interface with non-blocking key control, metronome, and live log.'
            : language === 'uk'
            ? 'ANSI HUD інтерфейс у терміналі з неблокуючим керуванням [P]ауза, [R]есет, [S]кіп, метрономом та журналом.'
            : 'ANSI HUD интерфейс в терминале с неблокирующим управлением [P]ауза, [R]есет, [S]кип, метрономом и журналом.',
        };
      case 'android_jni.c':
        return {
          name: language === 'en' ? 'Android NDK / JNI Bridge' : language === 'uk' ? 'Android NDK / JNI Міст' : 'Android NDK / JNI Мост',
          desc: language === 'en'
            ? 'Binding code from C-core to Android Java/Kotlin via JNI for APK builds.'
            : language === 'uk'
            ? 'Код прив’язки C-ядра до Android Java/Kotlin через Java Native Interface (JNI) для APK збірки.'
            : 'Код привязки C-ядра к Android Java/Kotlin через Java Native Interface (JNI) для APK сборки.',
        };
      case 'Makefile':
        return {
          name: language === 'en' ? 'Build Makefile' : language === 'uk' ? 'Makefile збирача' : 'Makefile сборщика',
          desc: language === 'en'
            ? 'Compilation instructions for GCC, Clang, MinGW, and WebAssembly (emcc).'
            : language === 'uk'
            ? 'Інструкції компіляції для GCC, Clang, MinGW, а також ціль для WebAssembly (emcc).'
            : 'Инструкции компиляции для GCC, Clang, MinGW, а также цель для WebAssembly (emcc).',
        };
      default:
        return { name: activeFile.name, desc: activeFile.description };
    }
  };

  const fileMeta = getFileLocalizedMeta(activeFile.filename);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Platform Porting Architectural Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLI & Desktop */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Terminal className="w-4 h-4" />
            <span>{t('c_guide_cli_title')}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t('c_guide_cli_desc')}
          </p>
          <code className="text-[11px] font-mono bg-zinc-900 px-2 py-1.5 rounded text-zinc-300 mt-auto border border-zinc-800">
            gcc -O2 main.c interval_timer.c -o timer
          </code>
        </div>

        {/* Android APK */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>{t('c_guide_apk_title')}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t('c_guide_apk_desc')}
          </p>
          <code className="text-[11px] font-mono bg-zinc-900 px-2 py-1.5 rounded text-zinc-300 mt-auto border border-zinc-800">
            CMake + JNI Bridge (android_jni.c)
          </code>
        </div>

        {/* WebAssembly */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>{t('c_guide_wasm_title')}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t('c_guide_wasm_desc')}
          </p>
          <code className="text-[11px] font-mono bg-zinc-900 px-2 py-1.5 rounded text-zinc-300 mt-auto border border-zinc-800">
            emcc interval_timer.c -s WASM=1
          </code>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* File Tabs Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex overflow-x-auto gap-1.5 scrollbar-none py-1">
            {C_SOURCE_FILES.map((file, idx) => {
              const isActive = activeFileIndex === idx;
              return (
                <button
                  key={file.filename}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.filename}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('c_view_copied') : t('c_view_copy')}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('c_view_download')} ({activeFile.filename})</span>
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="bg-zinc-950 px-5 py-3 border-b border-zinc-900 flex flex-wrap items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{fileMeta.name}</span>
            <span>—</span>
            <span>{fileMeta.desc}</span>
          </div>
          <div className="font-mono text-zinc-500">
            {lineCount} {t('c_view_lines')} • {activeFile.language.toUpperCase()}
          </div>
        </div>

        {/* Source Code Content with Line Numbers */}
        <div className="p-4 sm:p-6 bg-black/90 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed select-text">
          <pre className="table w-full">
            {activeFile.content.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="table-row hover:bg-zinc-900/50">
                <span className="table-cell select-none pr-4 text-right text-zinc-600 w-10 font-mono text-xs">
                  {lineIndex + 1}
                </span>
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
