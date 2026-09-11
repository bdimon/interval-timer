import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  Terminal, 
  Smartphone, 
  Globe, 
  Layers 
} from 'lucide-react';
import { C_SOURCE_FILES } from '../c_code/cSourceFiles';

export const CCodeViewer: React.FC = () => {
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

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Platform Porting Architectural Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLI & Desktop */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Terminal className="w-4 h-4" />
            <span>1. CLI & GUI (C99 Standard)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Чистый C с разделением ядра и UI. Компилируется в консольное приложение через GCC/Clang или подключается к Raylib / ImGui / GTK.
          </p>
          <code className="text-[11px] font-mono bg-zinc-900 px-2 py-1.5 rounded text-zinc-300 mt-auto border border-zinc-800">
            gcc -O2 main.c interval_timer.c -o timer
          </code>
        </div>

        {/* Android APK */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>2. Android APK (NDK + JNI)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Ядро компилируется в нативную библиотеку <code className="text-cyan-300">.so</code> через Android NDK и работает внутри фонового Android Service без пауз.
          </p>
          <code className="text-[11px] font-mono bg-zinc-900 px-2 py-1.5 rounded text-zinc-300 mt-auto border border-zinc-800">
            CMake + JNI мост (android_jni.c)
          </code>
        </div>

        {/* WebAssembly */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 shadow-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>3. Web & WebAssembly</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Компиляция исходного C кода напрямую в бинарный Wasm модуль с помощью Emscripten (<code className="text-purple-300">emcc</code>) для веб-браузеров.
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
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Скачать {activeFile.filename}</span>
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="bg-zinc-950 px-5 py-3 border-b border-zinc-900 flex flex-wrap items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{activeFile.name}</span>
            <span>—</span>
            <span>{activeFile.description}</span>
          </div>
          <div className="font-mono text-zinc-500">
            {lineCount} строк • {activeFile.language.toUpperCase()}
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
