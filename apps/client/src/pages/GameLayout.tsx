import { Routes, Route } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import TurkeyMap from '../components/map/TurkeyMap';
import ChatPanel from '../components/chat/ChatPanel';
import PlayerHUD from '../components/hud/PlayerHUD';
import LaborPanel from '../components/labor/LaborPanel';
import NewsFeed from '../components/news/NewsFeed';
import RegionPanel from '../components/region/RegionPanel';
import NotificationToast from '../components/notifications/NotificationToast';
import MarketPage from './MarketPage';
import MercenaryPage from './MercenaryPage';
import NewsPage from './NewsPage';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';

const NAV = [
  { to: '/game', label: '🗺️ Harita', exact: true },
  { to: '/game/market', label: '📦 Pazar' },
  { to: '/game/mercenaries', label: '⚔️ Lonca' },
  { to: '/game/news', label: '📰 Gazete' },
  { to: '/game/profile', label: '👤 Profil' },
];

function TopBar() {
  const { player, logout } = useAuthStore();
  const location = useLocation();

  async function handleLogout() {
    const refreshToken = useAuthStore.getState().refreshToken;
    try { await api.post('/auth/logout', { refreshToken }); } catch { /* ok */ }
    logout();
    window.location.href = '/login';
  }

  return (
    <header className="bg-game-surface border-b border-game-border flex items-center h-12 px-4 gap-4 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-xl">⚔️</span>
        <span className="font-bold text-gold-400 text-sm hidden sm:block">Kılıç ve Kantar</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
        {NAV.map(({ to, label, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors',
                active
                  ? 'bg-gold-900/30 text-gold-400'
                  : 'text-game-muted hover:text-game-text',
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Balance quick view */}
      {player && (
        <div className="hidden md:flex items-center gap-3 text-xs">
          <span className="text-gold-400 font-medium">
            ⚙️ {player.akceBalance.toLocaleString('tr-TR')}
          </span>
          <span className="text-yellow-300 font-medium">
            🥇 {player.altinBalance}
          </span>
          <span className="text-game-muted">
            ⚡ {player.energy}
          </span>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-xs text-game-muted hover:text-red-400 transition-colors ml-2"
      >
        Çıkış
      </button>
    </header>
  );
}

function MapView() {
  return (
    <div className="flex-1 grid grid-cols-[1fr_300px] gap-3 min-h-0">
      {/* Main map */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="panel flex-1 overflow-hidden min-h-0">
          <TurkeyMap />
        </div>
        {/* News feed below map */}
        <div className="panel h-52 overflow-hidden">
          <NewsFeed />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
        <PlayerHUD />
        <LaborPanel />
        <RegionPanel />
        <ChatPanel />
      </div>
    </div>
  );
}

function MarketView() {
  return <MarketPage />;
}

function MercenaryView() {
  return <MercenaryPage />;
}

function NewsView() {
  return <NewsPage />;
}

function ProfileView() {
  const player = useAuthStore((s) => s.player);
  return (
    <div className="panel p-6 max-w-md mx-auto space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">👤</div>
        <h2 className="text-xl font-bold text-game-text">{player?.username}</h2>
        <p className="text-game-muted text-sm">{player?.email}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-game-bg rounded-md p-3">
          <div className="text-game-muted text-xs">Ticaret Seviyesi</div>
          <div className="text-gold-400 font-bold text-lg">{player?.tradeLevel}</div>
        </div>
        <div className="bg-game-bg rounded-md p-3">
          <div className="text-game-muted text-xs">Askeri Seviye</div>
          <div className="text-gold-400 font-bold text-lg">{player?.militaryLevel}</div>
        </div>
        <div className="bg-game-bg rounded-md p-3">
          <div className="text-game-muted text-xs">Akçe</div>
          <div className="text-gold-400 font-bold">{player?.akceBalance?.toLocaleString('tr-TR')}</div>
        </div>
        <div className="bg-game-bg rounded-md p-3">
          <div className="text-game-muted text-xs">Altın</div>
          <div className="text-yellow-300 font-bold">{player?.altinBalance}</div>
        </div>
      </div>
      <div className="text-xs text-game-muted text-center">
        VIP Plan: <span className="text-gold-400 font-medium">{player?.vipPlan}</span>
      </div>
    </div>
  );
}

export default function GameLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-game-bg">
      <TopBar />
      <NotificationToast />

      <main className="flex-1 p-3 min-h-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/market" element={<MarketView />} />
          <Route path="/mercenaries" element={<MercenaryView />} />
          <Route path="/news" element={<NewsView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </main>
    </div>
  );
}
