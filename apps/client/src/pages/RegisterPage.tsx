import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setAuth(data.player, data.accessToken, data.refreshToken);
      navigate('/game');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Kayıt olunamadı';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-game-muted mb-1">{label}</label>
      <input
        className="input"
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        required
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-3xl font-bold text-gold-400 font-game">Kılıç ve Kantar</h1>
          <p className="text-game-muted text-sm mt-1">İmparatorluğunu kurmaya başla</p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-game-text">Kayıt Ol</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {field('username', 'Kullanıcı Adı', 'text', 'komutan_ali')}
            {field('email', 'E-posta', 'email', 'ali@email.com')}
            {field('password', 'Şifre', 'password', 'En az 8 karakter')}
            {field('confirm', 'Şifre Tekrar', 'password', '••••••••')}
          </div>

          <p className="text-xs text-game-muted">
            Kayıt olarak{' '}
            <span className="text-gold-500">Kullanım Koşullarını</span> kabul etmiş olursunuz.
          </p>

          <button type="submit" className="btn-gold w-full" disabled={loading}>
            {loading ? 'Kayıt yapılıyor...' : 'İmparatorluğunu Kur'}
          </button>

          <p className="text-center text-sm text-game-muted">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300">
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
