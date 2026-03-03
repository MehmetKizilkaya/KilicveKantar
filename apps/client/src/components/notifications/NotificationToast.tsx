import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ToastItem {
  id: string;
  title: string;
  body: string;
  type: string;
}

const TOAST_ICONS: Record<string, string> = {
  war_declared:    '⚔️',
  caravan_attacked:'🚨',
  contract_offer:  '🤝',
  auction_won:     '🏆',
  labor_complete:  '✅',
  faction_message: '💬',
  trade_offer:     '📦',
  market_alert:    '📊',
  default:         '🔔',
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent).detail as ToastItem;
      setToasts((t) => [...t, { ...notif, id: notif.id ?? String(Date.now()) }]);
    };

    const laborHandler = (e: Event) => {
      const { reward } = (e as CustomEvent).detail as { reward: number };
      setToasts((t) => [
        ...t,
        {
          id: `labor-${Date.now()}`,
          type: 'labor_complete',
          title: 'Çalışma Tamamlandı!',
          body: `${reward.toLocaleString('tr-TR')} Akçe kazandınız.`,
        },
      ]);
    };

    window.addEventListener('kv:notification', handler);
    window.addEventListener('kv:labor_done', laborHandler);

    return () => {
      window.removeEventListener('kv:notification', handler);
      window.removeEventListener('kv:labor_done', laborHandler);
    };
  }, []);

  // Auto-remove toasts after 5s
  useEffect(() => {
    if (toasts.length === 0) return;
    const id = setTimeout(() => {
      setToasts((t) => t.slice(1));
    }, 5000);
    return () => clearTimeout(id);
  }, [toasts]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'fade-in panel px-4 py-3 max-w-xs shadow-xl pointer-events-auto',
            'border border-gold-800/50 bg-game-surface',
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {TOAST_ICONS[toast.type] ?? TOAST_ICONS.default}
            </span>
            <div>
              <p className="text-sm font-semibold text-game-text">{toast.title}</p>
              <p className="text-xs text-game-muted mt-0.5">{toast.body}</p>
            </div>
            <button
              className="ml-auto text-game-muted hover:text-game-text text-lg leading-none"
              onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
