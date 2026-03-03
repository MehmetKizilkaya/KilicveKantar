import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import { ENERGY_COSTS } from '@kilic-ve-kantar/shared';
import clsx from 'clsx';

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  NEWS: 'Haber', COLUMN: 'Köşe Yazısı', PROPAGANDA: 'Propaganda',
  ADVERTISEMENT: 'İlan', INTERVIEW: 'Röportaj',
};
const ARTICLE_TYPE_COLORS: Record<string, string> = {
  NEWS: 'text-blue-400', COLUMN: 'text-green-400',
  PROPAGANDA: 'text-red-400', ADVERTISEMENT: 'text-yellow-400',
  INTERVIEW: 'text-purple-400',
};

interface NewsItem {
  id: string;
  source: 'player' | 'auto';
  title: string;
  content?: string;
  body?: string;
  type?: string;
  publishedAt?: string;
  createdAt?: string;
  likeCount?: number;
  readCount?: number;
  propagandaStrength?: number;
  author?: { username: string; vipPlan: string };
  targetRegionId?: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa önce`;
  const days = Math.floor(hours / 24);
  return `${days}g önce`;
}

// ── Feed Tab ──────────────────────────────────────────────────────────────────
function FeedTab() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [liking, setLiking] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/news/feed?page=${p}`);
      if (p === 1) setItems(data);
      else setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === 20);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  async function like(id: string) {
    setLiking(id);
    try {
      const { data } = await api.post(`/news/${id}/like`);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, likeCount: data.likeCount } : i));
    } finally {
      setLiking(null);
    }
  }

  if (selected) {
    const date = selected.publishedAt ?? selected.createdAt ?? '';
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="btn-ghost text-xs px-3 py-1">← Listeye Dön</button>
        <div className="panel p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {selected.type && (
                <span className={clsx('text-xs font-medium', ARTICLE_TYPE_COLORS[selected.type])}>
                  {ARTICLE_TYPE_LABELS[selected.type] ?? selected.type}
                </span>
              )}
              <h1 className="text-xl font-bold text-game-text mt-1">{selected.title}</h1>
            </div>
          </div>
          {selected.author && (
            <div className="text-xs text-game-muted">
              ✍️ {selected.author.username} · {timeAgo(date)}
            </div>
          )}
          {!selected.author && (
            <div className="text-xs text-game-muted">🤖 Sistem · {timeAgo(date)}</div>
          )}
          <div className="border-t border-game-border pt-4 text-sm text-game-text leading-relaxed whitespace-pre-wrap">
            {selected.content ?? selected.body}
          </div>
          {selected.likeCount !== undefined && (
            <div className="flex gap-4 text-xs text-game-muted border-t border-game-border pt-3">
              <span>👁️ {selected.readCount ?? 0} okuma</span>
              <button
                onClick={() => like(selected.id)}
                disabled={liking === selected.id}
                className="hover:text-red-400 transition-colors"
              >
                ❤️ {selected.likeCount} beğeni
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const date = item.publishedAt ?? item.createdAt ?? '';
        return (
          <div
            key={item.id}
            className="panel p-4 hover:border-game-border cursor-pointer transition-colors"
            onClick={() => setSelected(item)}
          >
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.type ? (
                    <span className={clsx('text-xs font-medium', ARTICLE_TYPE_COLORS[item.type])}>
                      {ARTICLE_TYPE_LABELS[item.type]}
                    </span>
                  ) : (
                    <span className="text-xs text-game-muted">🤖 Sistem</span>
                  )}
                  {item.propagandaStrength && item.propagandaStrength > 0 && (
                    <span className="text-xs text-red-400">⚡ Propaganda</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-game-text truncate">{item.title}</h3>
                <p className="text-xs text-game-muted mt-0.5 line-clamp-2">
                  {(item.content ?? item.body ?? '').slice(0, 150)}...
                </p>
              </div>
              <div className="text-xs text-game-muted text-right whitespace-nowrap flex-shrink-0 space-y-1">
                <div>{timeAgo(date)}</div>
                {item.author && <div className="text-gold-400">{item.author.username}</div>}
                {item.likeCount !== undefined && (
                  <div>❤️ {item.likeCount}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="py-6 text-center text-game-muted text-sm">Yükleniyor...</div>
      )}

      {!loading && hasMore && (
        <button onClick={() => { const next = page + 1; setPage(next); load(next); }}
          className="w-full panel py-3 text-xs text-game-muted hover:text-game-text text-center transition-colors">
          Daha Fazla Yükle
        </button>
      )}

      {!loading && items.length === 0 && (
        <div className="panel py-12 text-center text-game-muted text-sm">
          <div className="text-3xl mb-2">📰</div>
          Henüz haber yok
        </div>
      )}
    </div>
  );
}

// ── Write Tab ─────────────────────────────────────────────────────────────────
function WriteTab() {
  const { player, updatePlayer } = useAuthStore();
  const { regions } = useGameStore();
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'NEWS',
    targetRegionId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const energyCost = ENERGY_COSTS.WRITE_ARTICLE;
  const canWrite = (player?.energy ?? 0) >= energyCost;

  async function submit() {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Başlık ve içerik zorunludur');
      return;
    }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await api.post('/news', {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        targetRegionId: form.targetRegionId || undefined,
      });
      setSuccess('Makaleniz yayınlandı!');
      setForm({ title: '', content: '', type: 'NEWS', targetRegionId: '' });
      updatePlayer({ energy: (player?.energy ?? 0) - energyCost });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Makale yayınlanamadı');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto panel p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gold-400">✍️ Makale Yaz</h2>
        <div className="text-xs text-game-muted">
          Enerji maliyeti: <span className={clsx('font-medium', canWrite ? 'text-green-400' : 'text-red-400')}>
            {energyCost} ⚡
          </span>
          {' '}(Mevcut: {player?.energy})
        </div>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded">{error}</p>}
      {success && <p className="text-xs text-green-400 bg-green-900/20 px-3 py-2 rounded">{success}</p>}

      {!canWrite && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 px-3 py-2 rounded">
          ⚡ Yeterli enerjiniz yok. Enerji bekleniyor...
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs text-game-muted font-medium">Başlık *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={150}
            placeholder="Etkileyici bir başlık yazın..."
            className="input w-full mt-0.5"
          />
          <div className="text-right text-xs text-game-muted mt-0.5">{form.title.length}/150</div>
        </div>

        <div>
          <label className="text-xs text-game-muted font-medium">Makale Türü</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input w-full mt-0.5">
            {Object.entries(ARTICLE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-game-muted font-medium">
            Hedef Bölge
            {form.type === 'PROPAGANDA' && <span className="text-red-400 ml-1">(Propaganda zorunlu)</span>}
          </label>
          <select value={form.targetRegionId} onChange={(e) => setForm({ ...form, targetRegionId: e.target.value })} className="input w-full mt-0.5">
            <option value="">— Bölge seçin —</option>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {form.type === 'PROPAGANDA' && form.targetRegionId && (
        <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded">
          ⚠️ Propaganda makaleleri seçili bölgenin moralini düşürür. Tespit edilirse sonuçları olabilir.
        </div>
      )}

      <div>
        <label className="text-xs text-game-muted font-medium">İçerik *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={12}
          minLength={50}
          maxLength={10000}
          placeholder="Makalenizi buraya yazın... (en az 50 karakter)"
          className="input w-full mt-0.5 resize-none font-mono text-xs leading-relaxed"
        />
        <div className="flex justify-between text-xs text-game-muted mt-0.5">
          <span className={form.content.length < 50 ? 'text-red-400' : 'text-green-400'}>
            {form.content.length < 50 ? `En az ${50 - form.content.length} karakter daha` : '✓ Minimum sağlandı'}
          </span>
          <span>{form.content.length.toLocaleString('tr-TR')}/10.000</span>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={submitting || !canWrite || form.content.length < 50 || !form.title.trim()}
        className="btn-gold w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Yayınlanıyor...' : '📰 Makaleyi Yayınla'}
      </button>

      <p className="text-xs text-center text-game-muted">
        Makaleler otomatik onaylanır. Kurallara aykırı içerikler moderatörler tarafından kaldırılabilir.
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [tab, setTab] = useState<'feed' | 'write'>('feed');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gold-400">📰 Gazete</h1>
        <div className="flex rounded overflow-hidden border border-game-border">
          {([['feed', 'Haberler'], ['write', 'Makale Yaz']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={clsx('px-4 py-1.5 text-xs font-medium', tab === key ? 'bg-gold-900/30 text-gold-400' : 'text-game-muted hover:text-game-text')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'feed' ? <FeedTab /> : <WriteTab />}
    </div>
  );
}
