import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { connectSocket, disconnectSocket } from './lib/socket';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameLayout from './pages/GameLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const player = useAuthStore((s) => s.player);
  if (!player) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const player = useAuthStore((s) => s.player);
  if (player) return <Navigate to="/game" replace />;
  return <>{children}</>;
}

export default function App() {
  const player = useAuthStore((s) => s.player);

  useEffect(() => {
    if (player) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [player]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/game/*" element={<ProtectedRoute><GameLayout /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={player ? '/game' : '/login'} replace />} />
    </Routes>
  );
}
