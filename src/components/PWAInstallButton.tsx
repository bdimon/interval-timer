import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useI18n } from '../i18n/context';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useI18n();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow with beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
        title={t('pwa_install_title')}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t('pwa_install')}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-all"
          title={t('pwa_ios_title')}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('pwa_ios_btn')}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-700 p-5 shadow-2xl text-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">{t('pwa_ios_title')}</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-zinc-300">
                <p>
                  {t('pwa_ios_step1')} <strong className="text-emerald-400">{t('pwa_ios_step1_btn')}</strong> {t('pwa_ios_step1_desc')}
                </p>
                <p>
                  {t('pwa_ios_step2')} <strong className="text-emerald-400">{t('pwa_ios_step2_btn')}</strong>.
                </p>
                <p>
                  {t('pwa_ios_step3')} <strong className="text-emerald-400">{t('pwa_ios_step3_btn')}</strong> {t('pwa_ios_step3_desc')}
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition-colors"
              >
                {t('pwa_ios_got_it')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
