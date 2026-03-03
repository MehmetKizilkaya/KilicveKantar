import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import clsx from 'clsx';

const EVENT_ICONS: Record<string, string> = {
  war_declared:    '⚔️',
  war_ended:       '🏳️',
  coup_success:    '🏛️',
  coup_failed:     '❌',
  caravan_robbed:  '🚨',
  big_trade:       '💰',
  region_captured: '🗺️',
  faction_formed:  '🤝',
  NEWS:            '📰',
  COLUMN:          '✍️',
  PROPAGANDA:      '📢',
  ADVERTISEMENT:   '📣',
  INTERVIEW:       '🎤',
};

interface FeedItem {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  content?: string;
  source: 'player' | 'auto';
  publishedAt?: string;
  createdAt?: string;
  author?: { username: string };
  readCount?: number;
  likeCount?: number;
}

export default function NewsFeed() {
  const { data: items = [], isLoading } = useQuery<FeedItem[]>({
    queryKey: ['news', 'feed'],
    queryFn: () => api.get('/news/feed').then((r) => r.data),
    refetchInterval: 60_000,
  });

  return (
    <div className="panel flex flex-col h-full overflow-hidden">
      <div className="panel-header flex-shrink-0">
        <h3 className="font-semibold text-sm text-game-text flex items-center gap-2">
          📰 Haber Akışı
        </h3>
        <span className="text-xs text-game-muted">{items.length} haber</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-game-border min-h-0">
        {isLoading && (
          <p className="text-xs text-game-muted text-center py-4">Yükleniyor...</p>
        )}
        {!isLoading && items.length === 0 && (
          <p className="text-xs text-game-muted text-center py-8">Henüz haber yok</p>
        )}
        {items.map((item) => {
          const date = item.publishedAt ?? item.createdAt ?? '';
          const icon = EVENT_ICONS[item.type ?? ''] ?? '📌';
          const isAuto = item.source === 'auto';

          return (
            <div
              key={item.id}
              className={clsx(
                'p-3 text-xs hover:bg-game-bg/50 transition-colors fade-in',
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'font-semibold leading-tight mb-0.5',
                    isAuto ? 'text-gold-400' : 'text-game-text',
                  )}>
                    {item.title}
                  </p>
                  <p className="text-game-muted line-clamp-2 leading-relaxed">
                    {item.body ?? item.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-game-muted">
                    {item.author && <span>✍️ {item.author.username}</span>}
                    {item.readCount !== undefined && <span>👁️ {item.readCount}</span>}
                    {item.likeCount !== undefined && <span>❤️ {item.likeCount}</span>}
                    {date && (
                      <span className="ml-auto">
                        {formatDistanceToNow(new Date(date), { locale: tr, addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
