import React from 'react';
import { useI18n } from '../i18n/context';
import { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'RU', flag: 'RU' },
    { code: 'uk', label: 'UA', flag: 'UA' },
    { code: 'en', label: 'EN', flag: 'EN' },
  ];

  return (
    <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-semibold">
      <div className="px-1.5 text-zinc-500 hidden xl:flex items-center">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            id={`btn-lang-${lang.code}`}
            onClick={() => setLanguage(lang.code)}
            className={`px-2 py-1 rounded-md transition-all text-xs font-mono font-medium ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
            }`}
            title={`Switch language to ${lang.label}`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};
