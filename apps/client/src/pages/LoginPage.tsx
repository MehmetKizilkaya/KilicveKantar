import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.player, data.accessToken, data.refreshToken);
      navigate('/game');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Giriş yapılamadı';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-3xl font-bold text-gold-400 font-game">Kılıç ve Kantar</h1>
          <p className="text-game-muted text-sm mt-1">Türkiye'nin Fetih ve Ticaret İmparatorluğu</p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-game-text">Giriş Yap</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-game-muted mb-1">E-posta veya Kullanıcı Adı</label>
              <input
                className="input"
                type="text"
                value={form.emailOrUsername}
                onChange={(e) => setForm((f) => ({ ...f, emailOrUsername: e.target.value }))}
                placeholder="kullanici@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-game-muted mb-1">Şifre</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-gold w-full" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <p className="text-center text-sm text-game-muted">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300">
              Kayıt Ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
