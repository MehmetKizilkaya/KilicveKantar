import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import clsx from 'clsx';

const SPEC_LABELS: Record<string, string> = {
  raid: 'Akın', defense: 'Savunma', reconnaissance: 'Keşif',
  siege: 'Kuşatma', escort: 'Koruma', assassination: 'Suikast',
  diplomacy: 'Diplomasi', trade: 'Ticaret',
};
const ALL_SPECS = Object.keys(SPEC_LABELS);

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  DAILY_RAID: 'Günlük Akın', DEFENSE_PACT: 'Savunma Paktı',
  RECONNAISSANCE: 'Keşif', FACTION_ALLIANCE: 'Hizip İttifakı',
  SPECIAL_MISSION: 'Özel Görev',
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor', ACTIVE: 'Aktif', COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal', BREACHED: 'İhlal',
};
const CONTRACT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400', ACTIVE: 'text-green-400',
  COMPLETED: 'text-blue-400', CANCELLED: 'text-game-muted',
  BREACHED: 'text-red-400',
};

interface MercenaryProfile {
  id: string;
  playerId: string;
  specialization: string[];
  dailyRateAkce: number;
  dailyRateAltin: number;
  isAvailable: boolean;
  reputationScore: number;
  totalContracts: number;
  description: string;
  player: {
    username: string;
    militaryLevel: number;
    tradeLevel: number;
    reputationScore: number;
    faction: { name: string; tag: string } | null;
  };
}

interface Contract {
  id: string;
  type: string;
  status: string;
  durationDays: number;
  totalAkce: number;
  totalAltin: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  employer: { username: string };
  mercenary: { username: string };
  mercenaryRating: number | null;
  employerRating: number | null;
}

// ── Browse Tab ────────────────────────────────────────────────────────────────
function BrowseTab() {
  const { player } = useAuthStore();
  const [profiles, setProfiles] = useState<MercenaryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specFilter, setSpecFilter] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const [contractTarget, setContractTarget] = useState<MercenaryProfile | null>(null);
  const [contractForm, setContractForm] = useState({
    type: 'DAILY_RAID', durationDays: '7', totalAkce: '1000', totalAltin: '0',
  });
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState('');
  const [contractSuccess, setContractSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (specFilter) params.set('specialization', specFilter);
      if (maxRate) params.set('maxRate', maxRate);
      const { data } = await api.get(`/mercenaries?${params}`);
      setProfiles(data.profiles);
      setTotalPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, specFilter, maxRate]);

  useEffect(() => { load(); }, [load]);

  async function sendOffer() {
    if (!contractTarget) return;
    setContractError('');
    setContractSuccess('');
    setContractLoading(true);
    try {
      await api.post('/mercenaries/contracts', {
        mercenaryId: contractTarget.playerId,
        type: contractForm.type,
        durationDays: Number(contractForm.durationDays),
        totalAkce: Number(contractForm.totalAkce),
        totalAltin: Number(contractForm.totalAltin),
      });
      setContractSuccess('Teklif gönderildi!');
      setContractTarget(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setContractError(e.response?.data?.error ?? 'Teklif gönderilemedi');
    } finally {
      setContractLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="panel p-3 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-game-muted block mb-1">Uzmanlık</label>
          <select value={specFilter} onChange={(e) => { setSpecFilter(e.target.value); setPage(1); }} className="input">
            <option value="">Tümü</option>
            {ALL_SPECS.map((s) => <option key={s} value={s}>{SPEC_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-game-muted block mb-1">Maks. Günlük Ücret (Akçe)</label>
          <input
            type="number" value={maxRate}
            onChange={(e) => { setMaxRate(e.target.value); setPage(1); }}
            placeholder="Sınırsız" className="input w-36"
          />
        </div>
        <button onClick={() => load()} className="btn-ghost text-xs px-3 py-2">Ara</button>
      </div>

      {/* Contract offer modal */}
      {contractTarget && (
        <div className="panel p-4 border border-gold-700/40 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gold-400">
              Sözleşme Teklifi — {contractTarget.player.username}
            </h3>
            <button onClick={() => setContractTarget(null)} className="text-game-muted hover:text-game-text text-xs">✕ İptal</button>
          </div>
          {contractError && <p className="text-xs text-red-400">{contractError}</p>}
          {contractSuccess && <p className="text-xs text-green-400">{contractSuccess}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-game-muted">Görev Türü</label>
              <select value={contractForm.type} onChange={(e) => setContractForm({ ...contractForm, type: e.target.value })} className="input w-full mt-0.5">
                {Object.entries(CONTRACT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-game-muted">Süre (Gün)</label>
              <input type="number" min={1} max={30} value={contractForm.durationDays}
                onChange={(e) => setContractForm({ ...contractForm, durationDays: e.target.value })} className="input w-full mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-game-muted">Ücret (Akçe)</label>
              <input type="number" min={0} value={contractForm.totalAkce}
                onChange={(e) => setContractForm({ ...contractForm, totalAkce: e.target.value })} className="input w-full mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-game-muted">Ücret (Altın)</label>
              <input type="number" min={0} value={contractForm.totalAltin}
                onChange={(e) => setContractForm({ ...contractForm, totalAltin: e.target.value })} className="input w-full mt-0.5" />
            </div>
          </div>
          <button onClick={sendOffer} disabled={contractLoading} className="btn-gold w-full">
            {contractLoading ? 'Gönderiliyor...' : 'Teklif Gönder'}
          </button>
        </div>
      )}

      {/* Mercenary list */}
      {loading ? (
        <div className="panel py-12 text-center text-game-muted text-sm">Yükleniyor...</div>
      ) : profiles.length === 0 ? (
        <div className="panel py-12 text-center text-game-muted text-sm">
          <div className="text-3xl mb-2">⚔️</div>
          Filtrelerle eşleşen paralı asker bulunamadı
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((p) => (
            <div key={p.id} className="panel p-4 space-y-3 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-game-text">{p.player.username}</div>
                  {p.player.faction && (
                    <div className="text-xs text-game-muted">[{p.player.faction.tag}] {p.player.faction.name}</div>
                  )}
                </div>
                <div className={clsx('text-xs px-2 py-0.5 rounded-full', p.isAvailable ? 'bg-green-900/40 text-green-400' : 'bg-game-bg text-game-muted')}>
                  {p.isAvailable ? 'Müsait' : 'Meşgul'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-game-bg rounded p-2">
                  <div className="text-game-muted">Askeri</div>
                  <div className="text-gold-400 font-bold">Sv. {p.player.militaryLevel}</div>
                </div>
                <div className="bg-game-bg rounded p-2">
                  <div className="text-game-muted">İtibar</div>
                  <div className="text-gold-400 font-bold">{p.reputationScore}</div>
                </div>
                <div className="bg-game-bg rounded p-2">
                  <div className="text-game-muted">Görev</div>
                  <div className="text-gold-400 font-bold">{p.totalContracts}</div>
                </div>
              </div>

              {p.specialization.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.specialization.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-game-bg rounded text-game-muted">
                      {SPEC_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              )}

              {p.description && (
                <p className="text-xs text-game-muted line-clamp-2">{p.description}</p>
              )}

              <div className="text-xs space-y-0.5">
                <div className="text-game-muted">
                  Günlük: <span className="text-game-text">{p.dailyRateAkce.toLocaleString('tr-TR')} Akçe</span>
                  {p.dailyRateAltin > 0 && <span className="text-yellow-300 ml-1">+ {p.dailyRateAltin} Altın</span>}
                </div>
              </div>

              {player && p.player.username !== player.username && p.isAvailable && (
                <button
                  onClick={() => { setContractTarget(p); setContractError(''); setContractSuccess(''); }}
                  className="btn-gold text-xs py-1.5 mt-auto"
                >
                  Sözleşme Teklif Et
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs px-3 py-1">← Önceki</button>
          <span className="text-xs text-game-muted self-center">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs px-3 py-1">Sonraki →</button>
        </div>
      )}
    </div>
  );
}

// ── My Profile Tab ────────────────────────────────────────────────────────────
function MyProfileTab() {
  const { player } = useAuthStore();
  const [profile, setProfile] = useState<Omit<MercenaryProfile, 'player'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    specialization: [] as string[],
    dailyRateAkce: '1000',
    dailyRateAltin: '0',
    description: '',
  });

  useEffect(() => {
    api.get('/mercenaries/my-profile').then(({ data }) => {
      if (data) {
        setProfile(data);
        setForm({
          specialization: data.specialization,
          dailyRateAkce: String(data.dailyRateAkce),
          dailyRateAltin: String(data.dailyRateAltin),
          description: data.description,
        });
      }
      setLoading(false);
    });
  }, []);

  function toggleSpec(s: string) {
    setForm((f) => ({
      ...f,
      specialization: f.specialization.includes(s)
        ? f.specialization.filter((x) => x !== s)
        : f.specialization.length < 5 ? [...f.specialization, s] : f.specialization,
    }));
  }

  async function save() {
    setError(''); setSuccess(''); setSaving(true);
    try {
      const { data } = await api.put('/mercenaries/profile', {
        specialization: form.specialization,
        dailyRateAkce: Number(form.dailyRateAkce),
        dailyRateAltin: Number(form.dailyRateAltin),
        description: form.description,
      });
      setProfile(data);
      setSuccess('Profil güncellendi!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Profil güncellenemedi');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="panel py-12 text-center text-game-muted text-sm">Yükleniyor...</div>;

  if ((player?.militaryLevel ?? 0) < 3 && !profile) {
    return (
      <div className="panel p-8 text-center space-y-3">
        <div className="text-4xl">🛡️</div>
        <h3 className="text-lg font-bold text-game-text">Paralı Asker Profili</h3>
        <p className="text-game-muted text-sm">Profil açmak için Askeri Seviye 3 gereklidir.</p>
        <p className="text-xs text-game-muted">Mevcut seviyeniz: <span className="text-gold-400">{player?.militaryLevel}</span></p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto panel p-6 space-y-5">
      <h2 className="text-base font-bold text-gold-400">
        {profile ? 'Profili Düzenle' : 'Paralı Asker Profili Oluştur'}
      </h2>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}

      {profile && (
        <div className="grid grid-cols-3 gap-3 text-center text-xs bg-game-bg rounded-md p-3">
          <div><div className="text-game-muted">İtibar</div><div className="text-gold-400 font-bold">{profile.reputationScore}</div></div>
          <div><div className="text-game-muted">Toplam Görev</div><div className="text-gold-400 font-bold">{profile.totalContracts}</div></div>
          <div><div className="text-game-muted">Durum</div><div className={profile.isAvailable ? 'text-green-400' : 'text-yellow-400'}>{profile.isAvailable ? 'Müsait' : 'Meşgul'}</div></div>
        </div>
      )}

      <div>
        <label className="text-xs text-game-muted font-medium">Uzmanlık Alanları (maks. 5)</label>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {ALL_SPECS.map((s) => (
            <button
              key={s}
              onClick={() => toggleSpec(s)}
              className={clsx(
                'text-xs py-1.5 px-2 rounded border transition-colors',
                form.specialization.includes(s)
                  ? 'border-gold-600 bg-gold-900/30 text-gold-400'
                  : 'border-game-border text-game-muted hover:border-game-text',
              )}
            >
              {SPEC_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-game-muted">Günlük Ücret (Akçe)</label>
          <input type="number" min={100} value={form.dailyRateAkce}
            onChange={(e) => setForm({ ...form, dailyRateAkce: e.target.value })}
            className="input w-full mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-game-muted">Günlük Ücret (Altın)</label>
          <input type="number" min={0} value={form.dailyRateAltin}
            onChange={(e) => setForm({ ...form, dailyRateAltin: e.target.value })}
            className="input w-full mt-0.5" />
        </div>
      </div>

      <div>
        <label className="text-xs text-game-muted">Açıklama</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          maxLength={500}
          placeholder="Hizmetlerinizi ve deneyiminizi kısaca anlatın..."
          className="input w-full mt-0.5 resize-none"
        />
        <div className="text-right text-xs text-game-muted mt-0.5">{form.description.length}/500</div>
      </div>

      <button onClick={save} disabled={saving || form.specialization.length === 0} className="btn-gold w-full">
        {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
      </button>
    </div>
  );
}

// ── My Contracts Tab ──────────────────────────────────────────────────────────
function MyContractsTab() {
  const { player } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    api.get('/mercenaries/my-contracts').then(({ data }) => {
      setContracts(data);
      setLoading(false);
    });
  }, []);

  async function respond(contractId: string, accept: boolean) {
    try {
      await api.post(`/mercenaries/contracts/${contractId}/respond`, { accept });
      const { data } = await api.get('/mercenaries/my-contracts');
      setContracts(data);
    } catch { /* handled */ }
  }

  async function submitRating(contractId: string) {
    setRatingLoading(true);
    try {
      await api.post(`/mercenaries/contracts/${contractId}/rate`, { rating: ratingValue });
      const { data } = await api.get('/mercenaries/my-contracts');
      setContracts(data);
      setRatingTarget(null);
    } finally {
      setRatingLoading(false);
    }
  }

  if (loading) return <div className="panel py-12 text-center text-game-muted text-sm">Yükleniyor...</div>;
  if (contracts.length === 0) {
    return (
      <div className="panel py-12 text-center space-y-2">
        <div className="text-3xl">📜</div>
        <p className="text-game-muted text-sm">Henüz sözleşmeniz yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((c) => {
        const isEmployer = c.employer.username === player?.username;
        const canRespond = !isEmployer && c.status === 'PENDING';
        const canRate = c.status === 'COMPLETED' &&
          (isEmployer ? c.mercenaryRating === null : c.employerRating === null);

        return (
          <div key={c.id} className="panel p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-game-text">
                  {CONTRACT_TYPE_LABELS[c.type] ?? c.type}
                </div>
                <div className="text-xs text-game-muted mt-0.5">
                  {isEmployer ? `Paralı Asker: ${c.mercenary.username}` : `İşveren: ${c.employer.username}`}
                </div>
              </div>
              <span className={clsx('text-xs font-medium', CONTRACT_STATUS_COLORS[c.status])}>
                {CONTRACT_STATUS_LABELS[c.status] ?? c.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-game-bg rounded p-2">
                <div className="text-game-muted">Süre</div>
                <div className="text-game-text">{c.durationDays} gün</div>
              </div>
              <div className="bg-game-bg rounded p-2">
                <div className="text-game-muted">Akçe</div>
                <div className="text-gold-400">{c.totalAkce.toLocaleString('tr-TR')}</div>
              </div>
              <div className="bg-game-bg rounded p-2">
                <div className="text-game-muted">Altın</div>
                <div className="text-yellow-300">{c.totalAltin}</div>
              </div>
            </div>

            {canRespond && (
              <div className="flex gap-2">
                <button onClick={() => respond(c.id, true)} className="flex-1 py-1.5 text-xs bg-green-700 hover:bg-green-600 text-white rounded font-medium">
                  Kabul Et
                </button>
                <button onClick={() => respond(c.id, false)} className="flex-1 py-1.5 text-xs bg-red-700/50 hover:bg-red-700 text-red-300 rounded font-medium">
                  Reddet
                </button>
              </div>
            )}

            {canRate && (
              ratingTarget === c.id ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-game-muted">Puan:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRatingValue(n)}
                      className={clsx('text-lg', n <= ratingValue ? 'text-yellow-400' : 'text-game-border')}>★</button>
                  ))}
                  <button onClick={() => submitRating(c.id)} disabled={ratingLoading} className="btn-gold text-xs px-3 py-1 ml-2">
                    {ratingLoading ? '...' : 'Gönder'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setRatingTarget(c.id)} className="btn-ghost text-xs px-3 py-1">
                  ★ Değerlendir
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MercenaryPage() {
  const [tab, setTab] = useState<'browse' | 'profile' | 'contracts'>('browse');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gold-400">⚔️ Sefer Loncası</h1>
        <div className="flex rounded overflow-hidden border border-game-border">
          {([['browse', 'Kiralıklar'], ['profile', 'Profilim'], ['contracts', 'Sözleşmelerim']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={clsx('px-4 py-1.5 text-xs font-medium', tab === key ? 'bg-gold-900/30 text-gold-400' : 'text-game-muted hover:text-game-text')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'browse' && <BrowseTab />}
      {tab === 'profile' && <MyProfileTab />}
      {tab === 'contracts' && <MyContractsTab />}
    </div>
  );
}
