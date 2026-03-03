import { useQuery, useMutation } from '@tanstack/react-query';
import { useGameStore } from '../../store/game.store';
import { api } from '../../lib/api';
import clsx from 'clsx';

const TYPE_LABELS: Record<string, string> = {
  AGRICULTURE: '🌾 Tarım',
  INDUSTRIAL: '🏭 Sanayi',
  TRADE: '🏪 Ticaret',
  MILITARY: '🏰 Askeri',
  COASTAL: '⛵ Kıyı',
};

export default function RegionPanel() {
  const { selectedRegionId, selectRegion } = useGameStore();

  const { data: region, isLoading } = useQuery({
    queryKey: ['region', selectedRegionId],
    queryFn: () => api.get(`/regions/${selectedRegionId}`).then((r) => r.data),
    enabled: !!selectedRegionId,
  });

  const setHome = useMutation({
    mutationFn: () => api.post(`/regions/${selectedRegionId}/set-home`),
  });

  if (!selectedRegionId) {
    return (
      <div className="panel p-4 text-center">
        <p className="text-game-muted text-sm">Haritadan bir il seçin</p>
        <p className="text-game-muted text-xs mt-1">Bölge bilgileri burada görünecek</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="panel p-4">
        <p className="text-game-muted text-xs">Yükleniyor...</p>
      </div>
    );
  }

  if (!region) return null;

  const moralColor =
    region.morale >= 70 ? 'text-green-400'
    : region.morale >= 40 ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <div>
          <h3 className="font-bold text-game-text">{region.name}</h3>
          <span className="text-xs text-game-muted">{TYPE_LABELS[region.type] ?? region.type}</span>
        </div>
        <button
          className="text-game-muted hover:text-game-text text-lg leading-none"
          onClick={() => selectRegion(null)}
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Faction / Governor */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-game-bg rounded p-2">
            <div className="text-game-muted mb-0.5">Fraksiyon</div>
            <div className="text-game-text font-medium">
              {region.faction ? `[${region.faction.tag}] ${region.faction.name}` : 'Bağımsız'}
            </div>
          </div>
          <div className="bg-game-bg rounded p-2">
            <div className="text-game-muted mb-0.5">Vali</div>
            <div className="text-game-text font-medium">
              {region.governor?.username ?? 'Atanmamış'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div className="bg-game-bg rounded p-2">
            <div className={clsx('text-lg font-bold', moralColor)}>{region.morale}</div>
            <div className="text-game-muted">Moral</div>
          </div>
          <div className="bg-game-bg rounded p-2">
            <div className="text-lg font-bold text-emerald-400">{region.economicValue}</div>
            <div className="text-game-muted">Ekonomi</div>
          </div>
          <div className="bg-game-bg rounded p-2">
            <div className="text-lg font-bold text-red-400">{region.militaryValue}</div>
            <div className="text-game-muted">Askeri</div>
          </div>
        </div>

        {/* Special resource */}
        {region.specialResource && (
          <div className="text-xs bg-gold-900/20 border border-gold-800 rounded p-2 text-gold-300">
            ✨ Özel Kaynak: <span className="font-medium">{region.specialResource}</span>
          </div>
        )}

        {/* Siege warning */}
        {region.isUnderSiege && (
          <div className="text-xs bg-red-900/20 border border-red-800 rounded p-2 text-red-300 font-bold">
            ⚔️ Bu bölge şu an kuşatma altında!
          </div>
        )}

        {/* Tax rate */}
        {region.stats && (
          <div className="text-xs text-game-muted">
            Vergi Oranı:{' '}
            <span className="text-game-text">%{region.stats.taxRate}</span>
            {' · '}
            Savunma Seviyesi:{' '}
            <span className="text-game-text">{region.stats.defenseLevel}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            className="btn-ghost text-xs"
            onClick={() => setHome.mutate()}
            disabled={setHome.isPending}
          >
            🏠 {setHome.isPending ? 'Ayarlanıyor...' : 'Ana Şehir Olarak Ayarla'}
          </button>
          <button className="btn-ghost text-xs">
            📦 Pazara Git
          </button>
          <button className="btn-danger text-xs">
            ⚔️ Savaş İlan Et
          </button>
        </div>
      </div>
    </div>
  );
}
