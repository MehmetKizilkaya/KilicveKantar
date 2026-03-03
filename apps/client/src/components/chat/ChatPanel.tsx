import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/game.store';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/auth.store';
import clsx from 'clsx';

const CHANNELS = [
  { id: 'global',           label: '🌍 Dünya' },
  { id: 'trade',            label: '📦 Pazar' },
  { id: 'mercenary_guild',  label: '⚔️ Lonca' },
];

export default function ChatPanel() {
  const { chatMessages, activeChannel, setActiveChannel } = useGameStore();
  const player = useAuthStore((s) => s.player);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = chatMessages[activeChannel] ?? [];

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    try {
      const socket = getSocket();
      socket.emit('chat:send', { channel: activeChannel, content });
      setInput('');
      setError('');
    } catch {
      setError('Mesaj gönderilemedi');
    }
  }

  return (
    <div className="panel flex flex-col h-full overflow-hidden">
      {/* Channel tabs */}
      <div className="flex border-b border-game-border overflow-x-auto flex-shrink-0">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            className={clsx(
              'px-3 py-2 text-xs whitespace-nowrap transition-colors',
              activeChannel === ch.id
                ? 'text-gold-400 border-b-2 border-gold-500 bg-game-bg/50'
                : 'text-game-muted hover:text-game-text',
            )}
            onClick={() => setActiveChannel(ch.id)}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {messages.length === 0 && (
          <p className="text-game-muted text-xs text-center pt-4">Henüz mesaj yok</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'text-xs fade-in',
              `chat-message-vip-${msg.playerVip}`,
              msg.playerId === player?.id && 'opacity-90',
            )}
          >
            <span className={clsx(
              'player-name font-semibold',
              msg.playerVip === 'SULTAN' && 'text-gold-400',
              msg.playerVip === 'COMMANDER' && 'text-indigo-400',
              msg.playerVip === 'TRADER' && 'text-emerald-400',
              msg.playerVip === 'FREE' && 'text-game-muted',
            )}>
              {msg.playerVip === 'SULTAN' && '👑 '}
              {msg.playerVip === 'COMMANDER' && '⚔️ '}
              {msg.playerName}
            </span>
            <span className="text-game-muted">: </span>
            <span className="text-game-text">{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-game-border flex gap-2 flex-shrink-0">
        <input
          className="input text-xs flex-1"
          placeholder="Mesajınızı yazın..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="btn-gold px-3 py-1.5 text-xs">
          Gönder
        </button>
      </form>
      {error && <p className="text-xs text-red-400 px-2 pb-1">{error}</p>}
    </div>
  );
}
