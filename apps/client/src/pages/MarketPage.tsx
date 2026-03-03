import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useGameStore } from '../store/game.store';
import { useAuthStore } from '../store/auth.store';
import { BASE_PRICES, COMMODITY_TIERS } from '@kilic-ve-kantar/shared';
import type { Commodity } from '@kilic-ve-kantar/shared';
import clsx from 'clsx';

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

const COMMODITY_LABELS: Record<Commodity, string> = {
  wheat: 'Buğday', iron: 'Demir', wood: 'Odun', stone: 'Taş',
  wool: 'Yün', cotton: 'Pamuk', copper: 'Bakır', salt: 'Tuz',
  olive_oil: 'Zeytinyağı', sword: 'Kılıç', shield: 'Kalkan',
  armor: 'Zırh', bread: 'Ekmek', cloth: 'Kumaş', ship: 'Gemi',
  gunpowder: 'Barut', silk: 'İpek', gold_ornament: 'Altın Süs',
  firearm: 'Ateşli Silah',
};

const TIER_LABELS = { raw: 'Ham Madde', processed: 'İşlenmiş', luxury: 'Lüks' };
const TIER_COLORS = {
  raw: 'text-green-400',
  processed: 'text-blue-400',
  luxury: 'text-gold-400',
};

interface MarketOrder {
  id: string;
  playerId: string;
  player: { username: string };
  commodity: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  currency: 'AKCE' | 'ALTIN';
  status: string;
  createdAt: string;
}

interface AuctionListing {
  id: string;
  seller: { username: string };
  itemType: string;
  itemData: Record<string, unknown>;
  startingPrice: number;
  buyNowPrice: number | null;
  currency: 'AKCE' | 'ALTIN';
  currentBid: number;
  currentBidder: string | null;
  endsAt: string;
  status: string;
}

function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Sona erdi'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}s ${m}d ${s}sn`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

function AuctionRow({ listing, onBid }: { listing: AuctionListing; onBid: (id: string) => void }) {
  const countdown = useCountdown(listing.endsAt);
  const { player } = useAuthStore();

  return (
    <tr className="border-b border-game-border hover:bg-game-surface/50">
      <td className="py-2 px-3 text-xs">
        <div className="font-medium text-game-text">{String(listing.itemData.commodity ?? listing.itemType)}</div>
        <div className="text-game-muted">Qty: {String(listing.itemData.quantity ?? 1)}</div>
      </td>
      <td className="py-2 px-3 text-xs text-game-muted">{listing.seller.username}</td>
      <td className="py-2 px-3 text-xs">
        <div className="text-game-muted">Başlangıç: {listing.startingPrice.toLocaleString('tr-TR')}</div>
        <div className={clsx('font-bold', listing.currentBid > 0 ? 'text-gold-400' : 'text-game-muted')}>
          Mevcut: {listing.currentBid > 0 ? listing.currentBid.toLocaleString('tr-TR') : '-'}
        </div>
        {listing.buyNowPrice && (
          <div className="text-green-400">Hemen Al: {listing.buyNowPrice.toLocaleString('tr-TR')}</div>
        )}
        <div className="text-xs text-game-muted">{listing.currency}</div>
      </td>
      <td className="py-2 px-3 text-xs text-orange-400">{countdown}</td>
      <td className="py-2 px-3">
        {player && listing.seller.username !== player.username && (
          <button
            onClick={() => onBid(listing.id)}
            className="btn-ghost text-xs px-2 py-1"
          >
            Teklif Ver
          </button>
        )}
      </td>
    </tr>
  );
}

function AuctionsTab() {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bidTarget, setBidTarget] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/market/auctions?page=${page}`);
      setListings(data.listings);
      setTotalPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleBid() {
    if (!bidTarget || !bidAmount) return;
    setBidLoading(true);
    setError('');
    try {
      await api.post(`/market/auctions/${bidTarget}/bid`, { amount: Number(bidAmount) });
      setBidTarget(null);
      setBidAmount('');
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Teklif verilemedi');
    } finally {
      setBidLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {bidTarget && (
        <div className="panel p-4 border border-gold-700/40 space-y-3">
          <h3 className="text-sm font-bold text-gold-400">Teklif Ver</h3>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Teklif miktarı"
              className="input flex-1"
            />
            <button onClick={handleBid} disabled={bidLoading} className="btn-gold px-4">
              {bidLoading ? '...' : 'Teklif Ver'}
            </button>
            <button onClick={() => { setBidTarget(null); setError(''); }} className="btn-ghost px-3">
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="panel overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-game-muted text-sm">Yükleniyor...</div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center text-game-muted text-sm">Aktif müzayede yok</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-game-border text-left">
                <th className="py-2 px-3 text-xs text-game-muted font-medium">Ürün</th>
                <th className="py-2 px-3 text-xs text-game-muted font-medium">Satıcı</th>
                <th className="py-2 px-3 text-xs text-game-muted font-medium">Fiyat</th>
                <th className="py-2 px-3 text-xs text-game-muted font-medium">Kalan</th>
                <th className="py-2 px-3 text-xs text-game-muted font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <AuctionRow key={l.id} listing={l} onBid={(id) => { setBidTarget(id); setError(''); }} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs px-3 py-1">
            ← Önceki
          </button>
          <span className="text-xs text-game-muted self-center">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs px-3 py-1">
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { regions, selectedRegionId } = useGameStore();
  const { updatePlayer } = useAuthStore();

  const [regionId, setRegionId] = useState(selectedRegionId ?? '');
  const [commodity, setCommodity] = useState<Commodity>('wheat');
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState(String(BASE_PRICES[commodity]));
  const [currency, setCurrency] = useState<'AKCE' | 'ALTIN'>('AKCE');
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    setPrice(String(BASE_PRICES[commodity]));
  }, [commodity]);

  const loadOrders = useCallback(async () => {
    if (!regionId) return;
    setLoadingOrders(true);
    try {
      const { data } = await api.get(`/regions/${regionId}/orders?commodity=${commodity}`);
      setOrders(data);
    } finally {
      setLoadingOrders(false);
    }
  }, [regionId, commodity]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function placeOrder() {
    setFormError('');
    setFormSuccess('');
    setPlacing(true);
    try {
      await api.post('/market/orders', {
        regionId,
        commodity,
        orderType,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
        currency,
      });
      setFormSuccess('Emir başarıyla verildi!');
      loadOrders();
      // Refresh player data
      const { data: profile } = await api.get('/auth/profile');
      updatePlayer(profile);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setFormError(e.response?.data?.error ?? 'Emir verilemedi');
    } finally {
      setPlacing(false);
    }
  }

  const buyOrders = orders.filter((o) => o.orderType === 'BUY').sort((a, b) => b.pricePerUnit - a.pricePerUnit);
  const sellOrders = orders.filter((o) => o.orderType === 'SELL').sort((a, b) => a.pricePerUnit - b.pricePerUnit);

  const commoditiesByTier = groupBy(
    Object.keys(COMMODITY_TIERS) as Commodity[],
    (c) => COMMODITY_TIERS[c],
  ) as Record<string, Commodity[]>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      {/* Left: Filters + Order Form */}
      <div className="space-y-3">
        {/* Region selector */}
        <div className="panel p-3 space-y-2">
          <label className="text-xs text-game-muted font-medium">Bölge</label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="input w-full"
          >
            <option value="">— Bölge seçin —</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Commodity selector grouped by tier */}
        <div className="panel p-3 space-y-2">
          <label className="text-xs text-game-muted font-medium">Emtia</label>
          {(['raw', 'processed', 'luxury'] as const).map((tier) => (
            <div key={tier}>
              <div className={clsx('text-xs font-medium mb-1', TIER_COLORS[tier])}>{TIER_LABELS[tier]}</div>
              <div className="grid grid-cols-2 gap-1">
                {(commoditiesByTier[tier] ?? []).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCommodity(c)}
                    className={clsx(
                      'text-xs py-1 px-2 rounded text-left transition-colors',
                      commodity === c
                        ? 'bg-gold-900/40 text-gold-400 font-medium'
                        : 'text-game-muted hover:text-game-text hover:bg-game-surface',
                    )}
                  >
                    {COMMODITY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order form */}
        <div className="panel p-3 space-y-3">
          <h3 className="text-sm font-bold text-game-text">Emir Ver</h3>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          {formSuccess && <p className="text-xs text-green-400">{formSuccess}</p>}

          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => setOrderType('BUY')}
              className={clsx('flex-1 py-1.5 text-xs font-medium', orderType === 'BUY' ? 'bg-green-700 text-white' : 'bg-game-bg text-game-muted')}
            >
              AL
            </button>
            <button
              onClick={() => setOrderType('SELL')}
              className={clsx('flex-1 py-1.5 text-xs font-medium', orderType === 'SELL' ? 'bg-red-700 text-white' : 'bg-game-bg text-game-muted')}
            >
              SAT
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-game-muted">Miktar</label>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input w-full mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-game-muted">Birim Fiyat</label>
              <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className="input w-full mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-game-muted">Para Birimi</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as 'AKCE' | 'ALTIN')} className="input w-full mt-0.5">
                <option value="AKCE">Akçe</option>
                <option value="ALTIN">Altın</option>
              </select>
            </div>
            <div className="text-xs text-game-muted">
              Toplam: <span className="text-game-text font-medium">{(Number(quantity) * Number(price)).toLocaleString('tr-TR')} {currency}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing || !regionId}
            className={clsx('w-full py-2 text-sm font-medium rounded transition-colors', orderType === 'BUY' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-red-700 hover:bg-red-600 text-white', 'disabled:opacity-50 disabled:cursor-not-allowed')}
          >
            {placing ? 'Veriliyor...' : `${orderType === 'BUY' ? 'Alım' : 'Satım'} Emri Ver`}
          </button>
        </div>
      </div>

      {/* Right: Order book */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-game-text">
            {COMMODITY_LABELS[commodity]} — Emir Defteri
          </h3>
          <div className="text-xs text-game-muted">
            Taban Fiyat: <span className="text-gold-400">{BASE_PRICES[commodity].toLocaleString('tr-TR')} Akçe</span>
          </div>
        </div>

        {loadingOrders ? (
          <div className="panel py-8 text-center text-game-muted text-sm">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Sell orders */}
            <div className="panel overflow-hidden">
              <div className="px-3 py-2 border-b border-game-border">
                <span className="text-xs font-medium text-red-400">Satım Emirleri</span>
              </div>
              {sellOrders.length === 0 ? (
                <div className="py-4 text-center text-xs text-game-muted">Satım emri yok</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-game-border/50">
                      <th className="py-1.5 px-3 text-xs text-game-muted">Miktar</th>
                      <th className="py-1.5 px-3 text-xs text-game-muted">Fiyat</th>
                      <th className="py-1.5 px-3 text-xs text-game-muted">Satıcı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellOrders.map((o) => (
                      <tr key={o.id} className="border-b border-game-border/30 hover:bg-red-900/10">
                        <td className="py-1.5 px-3 text-xs text-game-text">{o.quantity}</td>
                        <td className="py-1.5 px-3 text-xs text-red-400 font-medium">{o.pricePerUnit.toLocaleString('tr-TR')}</td>
                        <td className="py-1.5 px-3 text-xs text-game-muted">{o.player.username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Buy orders */}
            <div className="panel overflow-hidden">
              <div className="px-3 py-2 border-b border-game-border">
                <span className="text-xs font-medium text-green-400">Alım Emirleri</span>
              </div>
              {buyOrders.length === 0 ? (
                <div className="py-4 text-center text-xs text-game-muted">Alım emri yok</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-game-border/50">
                      <th className="py-1.5 px-3 text-xs text-game-muted">Miktar</th>
                      <th className="py-1.5 px-3 text-xs text-game-muted">Fiyat</th>
                      <th className="py-1.5 px-3 text-xs text-game-muted">Alıcı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyOrders.map((o) => (
                      <tr key={o.id} className="border-b border-game-border/30 hover:bg-green-900/10">
                        <td className="py-1.5 px-3 text-xs text-game-text">{o.quantity}</td>
                        <td className="py-1.5 px-3 text-xs text-green-400 font-medium">{o.pricePerUnit.toLocaleString('tr-TR')}</td>
                        <td className="py-1.5 px-3 text-xs text-game-muted">{o.player.username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [tab, setTab] = useState<'orders' | 'auctions'>('orders');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gold-400">📦 Açık Pazar</h1>
        <div className="flex rounded overflow-hidden border border-game-border">
          <button
            onClick={() => setTab('orders')}
            className={clsx('px-4 py-1.5 text-xs font-medium', tab === 'orders' ? 'bg-gold-900/30 text-gold-400' : 'text-game-muted hover:text-game-text')}
          >
            Pazar Emirleri
          </button>
          <button
            onClick={() => setTab('auctions')}
            className={clsx('px-4 py-1.5 text-xs font-medium', tab === 'auctions' ? 'bg-gold-900/30 text-gold-400' : 'text-game-muted hover:text-game-text')}
          >
            Müzayede Evi
          </button>
        </div>
      </div>

      {tab === 'orders' ? <OrdersTab /> : <AuctionsTab />}
    </div>
  );
}
