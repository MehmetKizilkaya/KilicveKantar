# ⚔️ Kılıç ve Kantar

Türkiye'nin 81 iline yayılmış gerçek zamanlı savaş, ticaret ve siyaset simülasyonu.

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS |
| State | Zustand + React Query |
| Map | D3.js + SVG |
| Real-time | Socket.io |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Queue | Bull (tick engine) |

## Proje Yapısı

```
kılıç-ve-kantar/
├── apps/
│   ├── server/          # Node.js backend
│   │   ├── prisma/      # Veritabanı şeması
│   │   └── src/
│   │       ├── config/      # env, prisma, redis
│   │       ├── middleware/  # auth (JWT)
│   │       ├── routes/      # REST API endpoints
│   │       ├── services/    # iş mantığı
│   │       ├── socket/      # Socket.io sunucusu
│   │       ├── tick/        # Tick engine (MicroTick, MacroTick, WarTick)
│   │       └── seed.ts      # 81 il seed verisi
│   └── client/          # React frontend
│       └── src/
│           ├── components/  # UI bileşenleri
│           │   ├── chat/    # Sohbet paneli
│           │   ├── hud/     # Oyuncu HUD
│           │   ├── labor/   # Çalışma döngüsü
│           │   ├── map/     # Türkiye haritası (SVG)
│           │   ├── news/    # Haber akışı
│           │   ├── notifications/ # Toast bildirimler
│           │   └── region/  # Bölge detay paneli
│           ├── lib/         # api client, socket
│           ├── pages/       # Login, Register, GameLayout
│           └── store/       # Zustand stores
└── packages/
    └── shared/          # Paylaşılan TypeScript tipleri & sabitler
```

## Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### 1. Bağımlılıkları Kur

```bash
npm install
```

### 2. Ortam Değişkenleri

```bash
cp apps/server/.env.example apps/server/.env
# .env dosyasını kendi değerlerinizle doldurun
```

### 3. Veritabanı Hazırla

```bash
# Prisma client oluştur
npm run db:generate

# Tabloları oluştur
npm run db:migrate

# 81 il seed verisini yükle
npm run db:seed
```

### 4. Geliştirme Sunucusu

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: `npm run db:studio`

## API Endpoints

### Auth
| Method | Path | Açıklama |
|--------|------|----------|
| POST | /api/auth/register | Kayıt |
| POST | /api/auth/login | Giriş |
| POST | /api/auth/refresh | Token yenile |
| POST | /api/auth/logout | Çıkış |
| GET  | /api/auth/me | Profil bilgisi |

### Labor (Çalışma)
| Method | Path | Açıklama |
|--------|------|----------|
| GET  | /api/labor/active | Aktif döngü |
| POST | /api/labor/start | Döngü başlat |
| POST | /api/labor/:id/collect | Akçe topla |
| POST | /api/labor/:id/extend | Döngü uzat (Altın) |
| POST | /api/labor/instant-restart | Anında yenile (Altın) |

### Regions (Bölgeler)
| Method | Path | Açıklama |
|--------|------|----------|
| GET  | /api/regions | Tüm 81 il |
| GET  | /api/regions/:id | Bölge detayı |
| GET  | /api/regions/:id/prices | Piyasa fiyatları |
| GET  | /api/regions/:id/orders | Açık siparişler |
| POST | /api/regions/:id/set-home | Ana şehir ayarla |

### Mercenaries (Paralı Askerler)
| Method | Path | Açıklama |
|--------|------|----------|
| GET  | /api/mercenaries | Müsait paralı askerler |
| PUT  | /api/mercenaries/profile | Profil oluştur/güncelle |
| POST | /api/mercenaries/contracts | Sözleşme teklifi gönder |
| POST | /api/mercenaries/contracts/:id/respond | Kabul/ret |
| POST | /api/mercenaries/contracts/:id/rate | Değerlendir |

### News (Haberler)
| Method | Path | Açıklama |
|--------|------|----------|
| GET  | /api/news/feed | Haber akışı |
| GET  | /api/news/:id | Makale detayı |
| POST | /api/news | Makale yaz |
| POST | /api/news/:id/like | Beğen |

## Socket.io Olayları

### Sunucu → İstemci
- `war:declared` — Savaş ilan edildi
- `chat:message` — Yeni sohbet mesajı
- `news:published` — Yeni haber
- `labor:completed` — Çalışma tamamlandı
- `region:captured` — Bölge el değiştirdi
- `auction:won` — Açık artırma kazanıldı
- `notification` — Genel bildirim

### İstemci → Sunucu
- `chat:send` — Mesaj gönder
- `chat:join_channel` / `leave_channel`
- `region:subscribe` / `unsubscribe`

## Geliştirme Fazları

- **Faz 0** ✅ Altyapı — Monorepo, auth, veritabanı, tick engine
- **Faz 1** 🔄 MVP Ekonomi — Piyasa, çalışma, temel UI
- **Faz 2** Savaş Sistemi
- **Faz 3** Sosyal — Lonca, gazete, kafile
- **Faz 4** Ekonomi Derinliği — Borsa, hisse
- **Faz 5** Canlı & Büyüme
