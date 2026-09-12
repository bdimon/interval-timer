import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-14 sm:bottom-12 left-4 z-50 flex items-center gap-2 rounded-lg bg-zinc-900 border border-emerald-500/50 px-3 py-2 text-xs font-medium text-emerald-400 shadow-xl"
    >
      <WifiOff className="w-4 h-4 text-emerald-400 animate-pulse" />
      <span>Оффлайн режим (PWA кэш активен)</span>
    </div>
  );
};
