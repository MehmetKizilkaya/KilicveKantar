# ⚔️ KILIÇ VE KANTAR
## Türkiye'nin Fetih, Ticaret ve Siyaset İmparatorluğu
### GAME DESIGN DOCUMENT — v3.0 — Mart 2026
**GİZLİ — İÇ KULLANIM**

---

## İÇİNDEKİLER

1. [Oyun Genel Bakış](#1-oyun-genel-bakış)
2. [Hedef Kitle](#2-hedef-kitle)
3. [Para Birimi ve Ekonomi Temeli](#3-para-birimi-ve-ekonomi-temeli)
4. [Temel Oyun Mekanikleri](#4-temel-oyun-mekanikleri)
5. [Savaş Sistemi](#5-savaş-sistemi)
6. [Paralı Asker (Sefer Lonca) Sistemi](#6-paralı-asker-sefer-lonca-sistemi)
7. [Gelişmiş Ticaret Sistemi](#7-gelişmiş-ticaret-sistemi)
8. [Sosyal Sistem — Global Sohbet & Haberler](#8-sosyal-sistem--global-sohbet--haberler)
9. [Gazete & Propaganda Sistemi](#9-gazete--propaganda-sistemi)
10. [Siyaset ve Yönetim Sistemi](#10-siyaset-ve-yönetim-sistemi)
11. [Fraksiyon Sistemi](#11-fraksiyon-sistemi)
12. [Oyuncu İlerlemesi](#12-oyuncu-i̇lerlemesi)
13. [Premium Sistemi](#13-premium-sistemi)
14. [Event Sistemi](#14-event-sistemi)
15. [Harita ve Stratejik Bölgeler](#15-harita-ve-stratejik-bölgeler)
16. [Kullanıcı Arayüzü](#16-kullanıcı-arayüzü)
17. [Teknik Mimari](#17-teknik-mimari)
18. [Geliştirme Fazları](#18-geliştirme-fazları)
19. [Monetizasyon ve Etik Sınırlar](#19-monetizasyon-ve-etik-sınırlar)
20. [Terimler Sözlüğü](#20-terimler-sözlüğü)

---

## 1. OYUN GENEL BAKIŞ

### 1.1 Konsept Özeti

**Kılıç ve Kantar**, Türkiye'nin 81 iline yayılmış, gerçek zamanlı bir **savaş, siyaset, ticaret ve sosyal etkileşim** simülasyonudur. Oyuncular; şehirler kurar, ordu toplar, rakip bölgelere saldırır, darbeler planlar, ekonomik imparatorluk inşa eder — ve en önemlisi **birbirleriyle derin, çok katmanlı ekonomik ve sosyal bağlar kurar**.

Oyun, Rival Regions'ın coğrafi hakimiyet sistemini referans alır ancak onu çok geride bırakan bir derinlikle yeniden tasarlar:

| Özellik | Rival Regions | Kılıç ve Kantar |
|---|---|---|
| Bölge sistemi | ✓ | ✓ (81 il) |
| Savaş | ✓ | ✓ (çok daha derin) |
| Ekonomi | Temel | Borsa + Lonca + Kafile |
| Oyuncu etkileşimi | Sınırlı | Global sohbet, gazete, pazaryeri |
| Paralı asker | ✗ | ✓ (Sefer Loncası) |
| Haber sistemi | ✗ | ✓ (canlı gazete, propaganda) |
| Oyuncu ticareti | ✗ | ✓ (P2P + açık artırma) |
| Altın ekonomisi | ✗ | ✓ (çift para birimi) |
| Premium esnekliği | ✗ | ✓ (süre uzatma, enerji yenileme) |

### 1.2 Temel Vizyon

- Türkiye coğrafyasına özgü, otantik savaş ve ticaret deneyimi
- Her şehrin hem ekonomik hem askeri değeri olan **canlı, nefes alan bir dünya**
- Baskınlar, darbeler, savaş ilanları: gerçek siyasi dinamikler
- Rekabetçi çok oyunculu ortamda strateji, diplomasi ve sabır ödüllendirilmeli
- **Oyuncular birbirlerinin en önemli etkileşim noktası olmalı** — NPC değil, insan
- Global sohbet, gazete, paralı askerler ve borsa ile **topluluk oyunun kalbinde**

### 1.3 Benzersiz Satış Noktaları (USP)

1. **Çift Para Birimi**: Akçe (kazanılır) + Altın (premium, sınırlı kazanılabilir)
2. **Sefer Loncası**: Oyuncuların birbirini kiralayabildiği tam paralı asker sistemi
3. **Kılıç Gazetesi**: Oyuncu yazarlı, propaganda etkili canlı haber sistemi
4. **Kafile Ticareti**: Şehirler arası fiziksel ticaret yolu simülasyonu
5. **Borsa**: Fraksiyon hisseleri ve emtia ticareti
6. **Oyuncu-Oyuncu Ekonomisi**: Her şey P2P — piyasa tamamen oyuncular tarafından oluşturulur
7. **Premium Yenileme**: Çalışma süresi bitse bile premium ile yeniden aktif et

---

## 2. HEDEF KİTLE

### 2.1 Birincil Hedef Kitle

- **Yaş**: 18–35
- **Profil**: Strateji oyunu oynayanlar, Rival Regions/Travian/OGame kullanıcıları
- **Motivasyon**: Güç, rekabet, topluluk, ekonomik zekilik
- **Platform**: Web tarayıcısı (masaüstü öncelikli, mobil ikincil)
- **Dil**: Türkçe (uluslararası sürüm sonraki fazda)

### 2.2 İkincil Hedef Kitle

- Strateji oyunu oynamamış ama ekonomi/siyaset ilgisi olan yetişkinler
- Türkiye tarihini seven oyuncular (Osmanlı-modern bağlantısı)
- Mobil strateji oyuncuları (Rise of Kingdoms, Clash of Clans)

### 2.3 Retention Stratejisi

- **Günlük giriş bonusu** (Akçe + nadir Altın)
- **Haftalık Bölge Ligi** — rekabetçi sezon döngüsü
- **Gazete ve sohbet** — sosyal bağlar oyuncuyu tutar
- **Uzun vadeli ticaret sözleşmeleri** — oyundan çıkmak pahalıya malolur
- **Fraksiyon sorumluluğu** — takım arkadaşları bekliyor

---

## 3. PARA BİRİMİ VE EKONOMİ TEMELİ

### 3.1 Çift Para Birimi Sistemi

Oyun iki ayrı para birimi üzerine kurulmuştur. Bu sistem hem özgür oyuncu ekonomisini hem de sürdürülebilir monetizasyonu sağlar.

#### 3.1.1 Akçe (⚙️)

**Kılıç ve Kantar'ın temel oyun içi para birimidir.**

| Özellik | Detay |
|---|---|
| Sembol | ⚙️ veya "A" |
| Nasıl kazanılır | Çalışma, üretim, savaş ganimeti, ticaret, paralı askerlik, görevler |
| Nasıl harcanır | Birlik eğitimi, bina inşaatı, ticaret, liman vergileri, lonca ücretleri |
| Oyuncu transferi | ✓ (serbest P2P transfer) |
| Satın alınabilir mi | ✗ (hiçbir gerçek para ile doğrudan Akçe alınamaz) |
| Max depolama | Seviyeye göre sınırlı; kasa yükseltme ile artar |

**Akçe Üretim Yolları:**
- **Çalışma (Labor)**: Her tick oyuncu bilinçli aksiyon almadan Akçe kazanır. Premium ile süre uzatılır veya yenilenir.
- **Hammadde Üretimi**: Tarım, maden, ahşap — Akçe + mal üretir
- **Ticaret Kârı**: Ucuza al, pahalıya sat
- **Vergi Geliri**: Şehir valileri vergi toplar
- **Savaş Ganimeti**: Başarılı baskın veya savaş sonrası
- **Paralı Askerlik**: Sözleşme geliri
- **Gazete Geliri**: Yüksek okunma oranı olan makalelere reklam bonusu
- **Günlük Görevler**: Küçük Akçe paketleri
- **Bölge Ligi Ödülü**: Haftalık sezon sonunda büyük Akçe ödülü

#### 3.1.2 Altın (🥇)

**Oyunun premium para birimidir. Hem satın alınabilir hem de oyun içinde sınırlı biçimde kazanılabilir.**

| Özellik | Detay |
|---|---|
| Sembol | 🥇 veya "AL" |
| Nasıl satın alınır | Web sitesi üzerinden (kredi kartı, Google Pay, havale) |
| Nasıl oyunda kazanılır | Bölge Ligi şampiyonluğu, özel etkinlikler, günlük giriş çark-ı felek, nadir görevler |
| Oyuncu transferi | ✓ (P2P transfer — bu kritik bir sosyal ekonomi aracıdır) |
| Akçe dönüşümü | ✓ Altın → Akçe (kurs oyuncularca belirlenir, borsa üzerinden) |
| Akçe → Altın dönüşümü | ✗ (tek yönlü, pay-to-win önlemi) |

**Altın Kullanım Alanları (Oyun Avantajı İÇERMEZ):**
- Çalışma süresi yenileme (en kritik kullanım)
- Enerji yenileme
- Hız bonusu (üretim veya inşaat ~%20 hız, değil bedava)
- Ekstra depolama yuvası
- Özel kozmetik (birlik görünümü, şehir bayrağı)
- Gazete ön sayfa reklam yeri (rekabet bonusu değil, görünürlük)
- Paralı asker sözleşmesini hızlandırma
- Özel lonca etkinliğine katılım hakkı
- Kafile sigortası (riski azaltır, kâr artırmaz)

**Altın Borsa (Döviz Takası):**
- Oyuncular Altın satışa koyabilir, alıcı Akçe ile öder
- Kur piyasa tarafından belirlenir — fiyat sabit değildir
- Borsa üzerinden Altın-Akçe akışı, oyunun "dolar kuru" gibi işler
- Kur bilgisi tüm oyunculara açıktır; bu ekonomik bir gösterge haline gelir

### 3.2 Çalışma (Labor) Sistemi

Oyuncunun zaman içinde pasif olarak Akçe ve hammadde kazandığı temel döngü.

```
[Oyuncu Çalışma Aksiyonu Başlatır]
         ↓
[Süre sayacı başlar — örn. 4 saat]
         ↓
[Süre dolduğunda üretim tamamlanır]
         ↓
[Oyuncu toplar veya otomatik kasaya gider]
         ↓
[Yeni çalışma aksiyonu başlatılabilir]
```

**Çalışma Süreleri (Varsayılan):**

| Çalışma Türü | Normal Süre | Premium Süre |
|---|---|---|
| Temel İşçi | 4 saat | 3 saat |
| Zanaatkar | 6 saat | 4 saat |
| Tüccar | 8 saat | 5 saat |
| Asker | 3 saat | 2 saat |
| Paralı Asker (sözleşmeli) | Sözleşmeye göre | — |

**Premium ile Çalışma Yenileme:**
- Süre dolmadan önce Altın harcayarak süreyi uzatabilirsin (maks. 2× uzatma)
- Süre tamamen bittikten sonra Altın harcayarak yeni çalışma döngüsü **anında başlar** (normal bekleme olmadan)
- Süre dolmadan mevcut döngüyü tamamlayıp yeni döngü başlatmak için Altın harcayabilirsin (otomatik zincir)
- **Çalışma Zinciri**: Premium oyuncular 24 saatlik çalışma zinciri kurabilir (5 döngü üst üste)

---

## 4. TEMEL OYUN MEKANİKLERİ

### 4.1 Zaman Sistemi (Tick Engine)

| Tick Türü | Süre | Ne Yapar |
|---|---|---|
| **MicroTick** | 15 dakika | Üretim güncellemesi, piyasa fiyat güncellemesi, sohbet temizliği |
| **MacroTick** | 6 saat | Vergi toplama, bölge geliri, fraksiyon puanı hesaplama |
| **WarTick** | 30 dakika | Aktif savaşların çözümlenmesi |
| **WeeklyTick** | Pazar 23:59 | Bölge Ligi sonu, sezon ödülleri, fraksiyon sıralaması sıfırlama |

### 4.2 Bölge / Şehir Sistemi

- Türkiye'nin 81 ili birer bölgedir
- Her bölge bir Vali tarafından yönetilir
- Bölgeler ekonomik özelliklerine göre sınıflandırılmıştır (tarım, sanayi, ticaret, askeri)
- Bir bölgenin kontrolü askeri güçle kazanılır, ekonomik güçle korunur
- **Stratejik Geçitler**: Boğaz şehirleri (İstanbul, Çanakkale), bölge lojistiğini kontrol eder

### 4.3 Enerji Sistemi

Her oyuncunun anlık aksiyon kapasitesini belirler.

| Özellik | Normal | Premium |
|---|---|---|
| Max Enerji | 100 | 150 |
| Yenilenme | 5/saat | 8/saat |
| Altın ile yenileme | 10 Altın = 50 enerji | 10 Altın = 75 enerji |

**Enerji Harcayan Aksiyonlar:**

| Aksiyon | Enerji Maliyeti |
|---|---|
| Saldırı başlatma | 30 |
| Baskın | 20 |
| Gazeteye makale yazma | 5 |
| Diplomatik mesaj gönderme | 2 |
| Borsa işlemi | 1 |
| Paralı asker sözleşmesi imzalama | 10 |
| Darbe girişimi | 40 |

---

## 5. SAVAŞ SİSTEMİ

### 5.1 Birlik Türleri

| Birlik | Güç | Hız | Maliyet (Akçe) | Özel |
|---|---|---|---|---|
| Piyade | 10 | Yavaş | 500 | Temel, kitlesel |
| Süvari | 25 | Hızlı | 1.500 | Baskın uzmanı |
| Okçu | 15 | Orta | 800 | Uzak mesafe, kuşatma karşıtı |
| Topçu | 40 | Çok Yavaş | 3.000 | Bina hasarı, moral kırma |
| Özel Kuvvet | 50 | Hızlı | 5.000 | Darbe ve casusluk |
| Denizci | 20 | Denizde hızlı | 1.200 | Kıyı bölgeler arası geçiş |
| Paralı Asker | Değişken | Değişken | Sözleşme | Kiralık oyuncu kontrolü |

### 5.2 Savaş İlanı

- Komşu bölgeye savaş ilan edilir (cooldown: 2 MacroTick sonra tekrar)
- Savaş ilanı 30 dakika önceden duyurulur — savunma tarafı hazırlanma süresi alır
- Savaş ilanı **Global Haber Akışına otomatik düşer**
- Savaş ilanı için minimum askeri güç eşiği gerekir (newbie koruması: ilk 7 gün)
- Fraksiyon üyeleri savaşa destek kuvveti gönderebilir
- **Kiralık askerler savaşa katılabilir** (bkz. Bölüm 6)

### 5.3 Savaş Çözümleme (WarTick)

```
Her 30 dakikada:

Saldırı Gücü = Σ(Saldıran birlikler) × Komutan_bonusu × Moral_çarpanı × Ajan_bonusu
Savunma Gücü = Σ(Savunan birlikler) × Kale_bonusu × Moral_çarpanı × Bölge_bilinirliği

Eğer Saldırı > Savunma × 1.2  → Saldırgan avantajlı ilerler
Eğer Savunma > Saldırı × 1.5  → Saldırgan geri çekilir, cooldown başlar
Aksi halde                     → Çatışma devam eder, her iki taraf kayıp verir
```

**Moral Sistemi:**

| Moral Aralığı | Etki |
|---|---|
| 80–100 | +%20 muharebe gücü |
| 60–79 | Normal |
| 40–59 | -%10 muharebe gücü |
| 20–39 | -%30, firar riski |
| 0–19 | Birlikler savaşmayı reddeder |

**Morali etkileyen faktörler:**
- Geçmiş savaş galibiyet/mağlubiyeti
- Şehrin ekonomik durumu
- Gazete propagandası (olumlu veya olumsuz)
- Fraksiyon desteği
- Vali liderlik becerisi

### 5.4 Savaş Sonuçları

| Sonuç | Etkisi |
|---|---|
| **Galibiyet** | Bölge el değiştirir; savunma birlikleri yok/geri çekilir; ganimet |
| **Mağlubiyet** | Saldıran kayıp verir, cooldown; moral düşer |
| **Beraberlik** | Her iki taraf kayıp; bölge el değiştirmez; müzakere penceresi |
| **Yağma** | Ele geçirmeden depoyu soymak; hızlı, az kayıplı |
| **Geri Çekilme** | Saldıran gönüllü çekilir; kısmi kayıp, kısmi moral kaybı |

### 5.5 Baskın Sistemi

Savaş ilan etmeden gerçekleştirilen hızlı, gizli operasyonlar.

- Süvari veya Özel Kuvvet gerektirir
- Baskın hedefi: depo yağma, köy yakma, ticaret kervanı engelleme
- 30 dakika süreli (savaş 6 saat sürebilir)
- Başarı %'si: Hız, keşif seviyesi ve savunma hazırlığına göre hesaplanır
- **Baskın haberi gazeteye düşer** (gizli tutmak için Altın harcanabilir)

### 5.6 Darbe Sistemi

Bir şehrin yöneticisini devirme mekanizması. Savaş gerektirmez; siyasi entrika üzerinden çalışır.

**Darbe Koşulları:**
- Hedef şehrin moral puanı 30'un altında olmalı
- Organizatörün o şehirde en az 5 MacroTick boyunca faaliyet kaydı olmalı
- Fraksiyon hazinesinden kaynak harcanır
- 3 MacroTick olgunlaşma süresi (ani gerçekleşmez)
- Gazete propagandası ile moral düşürme desteklenir

**Darbe Karşı Önlemleri:**
- Yüksek moral (70+) darbe olasılığını %80 azaltır
- Özel kuvvetleri 'koruyucu mod'a alan yönetici darbe riskini düşürür
- İstihbarat servisi aktif olan yönetici hazırlığı önceden algılar
- Büyük fraksiyonlar çatı bölgelerini koruyabilir

### 5.7 Komutan Sistemi

Her oyuncu birden fazla komutan atayabilir. Komutanlar birliklerini güçlendirir ve özel yetenekler kazandırır.

| Komutan Türü | Bonus | Kilit Seviye |
|---|---|---|
| Savaş Komutanı | +%15 piyade gücü | Askeri XP Lvl 5 |
| Süvari Komutanı | +%20 baskın hızı | Askeri XP Lvl 8 |
| İstihbarat Şefi | Casusluk başarısı +%25 | Askeri XP Lvl 10 |
| Lojistik Generali | Birlik taşıma kapasitesi +%30 | Askeri XP Lvl 12 |

---

## 6. PARALI ASKER (SEFER LONCA) SİSTEMİ

**Bu sistem Kılıç ve Kantar'ı Rival Regions'tan radikal biçimde ayıran, oyunculararası etkileşimin en derin katmanıdır.**

### 6.1 Sistem Özeti

Herhangi bir oyuncu kendini **paralı asker** olarak piyasaya sürebilir. Başka oyuncular veya fraksiyonlar bu kişiyi **Akçe veya Altın karşılığı kiralayabilir**. Kiralanan oyuncu, işverenin birliği gibi davranır — ama kendi karakteri ve seviyeleriyle.

### 6.2 Paralı Asker Profili Açma

Bir oyuncunun paralı asker olması için:
1. Askeri XP Lvl 3 veya üzerinde olmalı
2. "Sefer Loncası" binasını şehrinde inşa etmeli veya mevcut bir loncaya kayıt olmalı
3. "Sefer İlanı" yayınlamalı (lonca panosuna düşer)

**Sefer İlanı İçeriği:**

```
[OYUNCU ADI] — Seviye 12 Komutan
Uzmanlık: Süvari Baskın, Savunma Koordinasyonu
Mevcut Sözleşme: Açık
Fiyat: 5.000 Akçe/gün VEYA 3 Altın/gün
Minimum Sözleşme: 3 gün
Referanslar: İzmir Savaşı (3 zafer), Konya Savunması (2 başarı)
İtibar Puanı: ★★★★☆ (47 değerlendirme)
```

### 6.3 Lonca Panosu (Pazaryeri)

Sefer Loncası panosunda:
- Aktif sefere açık oyuncular listelenir
- Filtre: Uzmanlık, fiyat aralığı, itibar puanı, bölge
- **Anlık uygunluk** görünür (müsait / sözleşmeli / savaşta)
- Sözleşme teklifi doğrudan panelden gönderilir

### 6.4 Sözleşme Türleri

| Sözleşme | Süre | Ödeme | Açıklama |
|---|---|---|---|
| **Günlük Sefer** | 1–7 gün | Günlük ödeme | Kısa süreli savaş desteği |
| **Savunma Pakti** | 1–4 hafta | Haftalık ödeme | Bölge savunması garantisi |
| **Keşif Sözleşmesi** | 3–10 gün | Proje bazlı | Casusluk ve istihbarat toplama |
| **Fraksiyon Anlaşması** | 1 ay | Aylık + bonus | Fraksiyona tam entegrasyon |
| **Özel Görev** | Tanımlanır | Sonuç bazlı | Darbe, baskın, ticaret koruma |

### 6.5 Sözleşme Mekanizması

```
[İşveren Teklif Gönderir]
         ↓
[Paralı Asker 24 saat içinde kabul/ret]
         ↓
[Kabul → Akçe/Altın kasadan bloke edilir]
         ↓
[Sözleşme başlar — paralı asker "hizmet modunda"]
         ↓
[Her gün/hafta ödeme otomatik transfer]
         ↓
[Sözleşme tamamlanır → son ödeme + bonus (varsa)]
         ↓
[Her iki taraf birbirini değerlendirir]
```

**Sözleşme İhlali:**
- İşveren erken bozarsa: İşveren kalan ödemeyi tazminat olarak öder
- Paralı asker erken bozarsa: Para cezası (10% deposit) ve itibar düşüşü

### 6.6 Paralı Asker İtibar Sistemi

- Her sözleşme sonunda 1–5 yıldız değerlendirme
- İtibar puanı tüm oyunculara açık
- Yüksek itibar → daha yüksek ücret talep edebilir
- Düşük itibar → az sözleşme, zor müzakere

**İtibar Milestoneları:**

| İtibar | Unvan | Bonus |
|---|---|---|
| 0–20 | Acemi | — |
| 21–40 | Sefer Er | +%5 savaş gücü (sözleşmeli) |
| 41–60 | Güvenilir Kılıç | +%10, özel sözleşme erişimi |
| 61–80 | Efsane Komutan | +%20, fraksiyon anlaşması önceliği |
| 81–100 | Kantar Ağası | +%30, özel lonca başkanlığı |

### 6.7 Sefer Lonca Binaları

- **Lonca Binası** (Şehir yapısı): Paralı asker kayıt merkezi, toplantı noktası
- **Kışla**: Kiralık asker eğitim hız bonusu
- **Sefer Bankası**: Sözleşme ödemelerini güvence altına alan emanet kasası

### 6.8 Fraksiyon Paralı Askeri

Bir fraksiyon kendi bünyesinde "paralı asker birimi" kurabilir:
- Üyeler fraksiyon adına kiralık sözleşme alabilir
- Gelir fraksiyonla paylaşılır (oran üyeler arasında belirlenir)
- Fraksiyon itibar puanı — bütün üyelerin ortalaması

---

## 7. GELİŞMİŞ TİCARET SİSTEMİ

### 7.1 Üretim Zinciri

Her şehrin coğrafi konumuna göre üretebileceği hammaddeler vardır.

**Hammadde Katmanı (Tier 1):**

| Hammadde | Tipik Bölge | Kullanım |
|---|---|---|
| Buğday | İç Anadolu | Asker beslemesi, ekmek |
| Demir | Doğu Anadolu, Karadeniz | Silah, araç, yapı |
| Kereste | Karadeniz, Ege dağları | Gemi, kışla, kale |
| Taş | Tüm bölgeler (az) | Bina, kale duvarı |
| Koyun | Doğu Anadolu | Yün, deri, et |
| Pamuk | Ege, Akdeniz | Kumaş, kıyafet |
| Bakır | Orta Anadolu | Piyasa aracı, silah alaşımı |
| Tuz | Kıyı bölgeleri | Gıda koruma, ticaret |
| Zeytinyağı | Ege, Akdeniz | Beslenme, aydınlatma |
| Madeni Para | Üretilmez, ticaretten oluşur | Para |

**İşlenmiş Mal Katmanı (Tier 2):**

| Ürün | Gerekli Hammadde | Tesis |
|---|---|---|
| Kılıç | Demir × 3 + Kömür × 1 | Demirci |
| Kalkan | Demir × 2 + Kereste × 1 | Silah Atölyesi |
| Zırh | Demir × 5 + Deri × 2 | Zırh Atölyesi |
| Ekmek | Buğday × 2 | Fırın |
| Kumaş | Pamuk × 4 | Dokuma Tezgahı |
| Gemi | Kereste × 10 + Demir × 5 | Tersane |
| Barut | Kükürt × 3 + Kömür × 2 | Ateş İmalathanesi |

**Lüks Mal Katmanı (Tier 3):**

| Ürün | Gerekli | Tesis |
|---|---|---|
| İpek Kumaş | Pamuk × 8 + Boyar × 2 | Gelişmiş Dokuma |
| Altın Süsleme | Bakır × 3 + Altın madeni × 1 | Kuyumcu |
| Barutlu Silah | Barut × 5 + Demir × 4 | İleri Silah Atölyesi |

### 7.2 Dinamik Piyasa (Şehir Bazlı)

Her şehirde fiyatlar arz-talep motoru ile belirlenir.

```
Fiyat = Temel_Fiyat × (Talep / Arz)^0.7

Savaş kuşatması → Arz düşer → Fiyat fırlar (x3–x5)
Bol hasat → Arz artar → Fiyat düşer (÷2)
Ticaret yolu kesilirse → Talep düşer → Fiyat düşer
```

**Fiyat Bilgisi:**
- Tüm şehirlerin fiyatları piyasa ekranında görünür
- Arbitraj fırsatları (ucuz al, pahalı sat) oyunun ekonomik motorunu oluşturur
- Premium oyuncular 7 günlük fiyat grafiklerini görebilir (normal: 1 gün)
- "Piyasa Uyarısı" özelliği: Belirlenen fiyat aşılırsa bildirim gönderilir

### 7.3 Açık Artırma Evi (Auction House)

Oyuncuların nadide eşyaları ve büyük miktarlardaki malları sattığı platform.

**Listeleme:**
- Her oyuncu aynı anda maks. 10 aktif ilan açabilir (premium: 25)
- İlan süresi: 4 / 12 / 24 / 48 saat seçenekleri
- Başlangıç fiyatı + isteğe bağlı "Hemen Al" fiyatı
- İlan ücreti: Satış değerinin %2'si (başarılı satıştan alınır)

**Açık Artırma Türleri:**

| Tür | Açıklama |
|---|---|
| **Standart Açık Artırma** | En yüksek teklif alır |
| **Hemen Al** | Belirtilen fiyata anında satış |
| **Gizli Artırma** | Teklifler gizli, süre sonunda kazanan belirlenir |
| **Süreli Flash Satış** | 1 saat, düşük fiyat — anlık satış heyecanı |
| **Lonca Özel Satışı** | Yalnızca fraksiyon üyelerine |

### 7.4 Oyuncu-Oyuncu (P2P) Takas

İki oyuncu arasında direkt takas sistemi.

- Oyuncu A, Oyuncu B'ye takas teklifi gönderir
- Teklif içeriği: Her türlü mal, Akçe veya Altın kombinasyonu
- B taraf 48 saat içinde kabul, ret veya karşı teklif yapabilir
- Kabul → Her iki tarafın envanterinden eşzamanlı transfer
- **Takas geçmişi** oyuncunun profilinde görünür (şeffaflık)

### 7.5 Kafile Ticaret Sistemi

Şehirler arası fiziksel ticaret simülasyonu — oyunun en derin ticaret mekanizması.

**Kafile Kurma:**
1. Kaynak şehirde mal yükle
2. Hedef şehri seç
3. Güzergah belirlenir — kafile haritalarda görünür
4. Koruma birliği eklenebilir (veya paralı asker tutulur)
5. Kafile yola çıkar

**Kafile Süresi:**
- İki şehir arasındaki coğrafi mesafeye göre değişir
- İstanbul → Ankara: ~3 saat
- Trabzon → Antalya: ~8 saat
- Yol güvenliği şehrin kontrolüne ve savaş durumuna göre değişir

**Kafile Riskleri:**
- Rakip oyuncular kafileyi soyabilir (baskın benzeri mekanik)
- Doğal afet olayı (fırtına, sel) — rastgele %10 mal hasarı
- Eşkıya NPC saldırısı — güvenli güzergahlarda düşük risk

**Kafile Koruma:**
- Silahlı birlik eklemek soygun riskini düşürür
- Paralı asker kiralayarak kafile koruması yaptırılabilir
- Sözleşmeli koruma: Kafile güvenle varırsa ödeme, varmazsa kısmi tazminat

**Kafile Sigortası (Altın ile):**
- Olası kayıpların %60'ını karşılar
- Premium oyuncular %80 kapsamlı sigorta alabilir

### 7.6 Emtia Borsası

Fiyatların ileri vadeli alınıp satıldığı, daha derin bir ekonomik araç.

**Vadeli Sözleşme (Futures):**
- "3 gün sonra 100 birim demir, 500 Akçe'den" şeklinde sözleşme
- Alıcı ve satıcı anlaşır; fiyat kilitlenir
- Şu anki fiyat düşse de sözleşme geçerlidir (risk yönetimi)

**Emtia Endeksi:**
- Oyunun genel ekonomik sağlığını gösteren bir endeks
- Savaş → demir fiyatı artar → endeks değişir
- Oyuncular endeksi okuyarak ticaret stratejisi geliştirir

### 7.7 Fraksiyon Hisse Senedi

Her büyük fraksiyon hisse ihraç edebilir.

- Fraksiyon kurucusu hisse miktarını belirler (örn. 1.000 hisse)
- Hisseler borsaya arz edilir; oyuncular Akçe ile satın alır
- Fraksiyon başarısına göre hisse değeri değişir (bölge sayısı, ticaret hacmi)
- Hisse sahibi oyuncular fraksiyon kârından pay alır
- Hisseler ikincil piyasada P2P veya açık artırma ile satılabilir

---

## 8. SOSYAL SİSTEM — GLOBAL SOHBET & HABERLER

**Bu sistem oyunun topluluk ruhunun kalbidir. Rival Regions'ta neredeyse yoktur. Kılıç ve Kantar'da merkezi öneme sahiptir.**

### 8.1 Sohbet Kanalları

#### 8.1.1 Global Kanal (#dünya)

- Tüm oyunculara açık
- Dil filtresi: Türkçe (varsayılan) / diğer diller
- Moderasyon: Oyuncu raporlama + otomatik spam filtresi
- Mesaj geçmişi: 500 mesaj (premium: 2.000 mesaj)
- Rate limit: Normal oyuncu 1 mesaj/10 sn (premium: 1 mesaj/3 sn)
- **Savaş duyuruları otomatik olarak global kanala düşer** (özel format)

#### 8.1.2 Bölge Kanalları (#istanbul, #ankara, ...)

- O bölgede faaliyet gösteren oyunculara otomatik erişim
- Valinin özel duyuru yapabileceği kanal
- Ticaret ilanları bu kanalda öne çıkar
- Bölge savunma koordinasyonu

#### 8.1.3 Fraksiyon Kanalı (Özel)

- Yalnızca fraksiyon üyeleri görebilir
- Alt kanallar: #genel, #savaş-koordinasyon, #ticaret, #diplomasi, #komutan-toplantısı
- Fraksiyon lideri kanallar oluşturabilir ve silebilir
- Mesaj arşivi 30 gün saklanır (premium fraksiyon: sınırsız)

#### 8.1.4 Ticaret Kanalı (#pazar)

- Alım/satım ilanlarına özel kanal
- Özel format: `[SATILIK] 500 Demir — 400 Akçe/birim — Ankara`
- Otomatik ilan botu: Açık artırma listelendiğinde buraya otomatik bildirim

#### 8.1.5 Özel Mesaj (DM)

- İki oyuncu arasında özel mesajlaşma
- Blok, şikayet sistemi
- Ticaret teklifi DM'den gönderilebilir (entegre takas penceresi açılır)
- Mesaj geçmişi 7 gün (premium: 30 gün)

#### 8.1.6 Lonca Kanalı (#sefer-loncası)

- Paralı asker tekliflerinin özelleştirilmiş kanalı
- Standart format: Sefer ilanı otomatik olarak buraya düşer
- Arama ve filtre: Uzmanlık, fiyat, bölge

### 8.2 Bildirim Sistemi

- **Anlık bildirimler** (tarayıcı bildirimi, oyun içi pop-up):
  - Savaş ilan edildi (senin bölgene)
  - Kafile saldırıya uğradı
  - Sözleşme teklifi geldi
  - Açık artırma kazanıldı / kaybedildi
  - Fraksiyon acil mesajı
- **Özet bildirimler** (her MacroTick):
  - Üretim tamamlandı
  - Vergi toplandı
  - Haftalık sıralama değişti

### 8.3 Oyuncu Profili

Her oyuncunun kamuya açık profili:

```
╔══════════════════════════════════════╗
║  [OYUNCU ADI]  ★★★★☆               ║
║  Seviye: 18 | Ticaret / Askeri      ║
║  Fraksiyon: Anadolu İmparatorluğu  ║
║  Ana Şehir: Bursa                   ║
║  Aktif Sözleşme: Kapalı            ║
╠══════════════════════════════════════╣
║  Toplam Savaş: 47 | Galibiyet: 31  ║
║  Ticaret Hacmi (7 gün): 142.000 A  ║
║  Paralı Asker İtibarı: 78/100      ║
║  Gazete Makaleleri: 12             ║
╠══════════════════════════════════════╣
║  Rozetler: [Baskın Ustası] [Tüccar]║
╚══════════════════════════════════════╝
```

---

## 9. GAZETE & PROPAGANDA SİSTEMİ

**Kılıç ve Kantar'ın en özgün özelliklerinden biri. Oyundaki her büyük olay haberleştirilir — hem otomatik sistem hem de oyuncu gazeteciler tarafından.**

### 9.1 Sistem Mimarisi

İki tür haber akışı mevcuttur:

1. **Otomatik Haber Akışı** — Sistem tarafından üretilir, her büyük oyun olayı
2. **Oyuncu Gazeteciliği** — Oyuncular makale, köşe yazısı ve propaganda yayınlar

### 9.2 Otomatik Haber Akışı (Haber Teli)

Her büyük oyun olayı standart bir haber formatında tüm oyunculara iletilir.

**Otomatik Haber Örnekleri:**

```
🗡️ SAVAŞ İLANI — Ankara → İzmir
"Anadolu İmparatorluğu fraksiyonu, İzmir'e savaş ilan etti!
Savunma tarafında: Ege Birliği. Savaş 30 dakika içinde başlayacak."

📦 BÜYÜK TİCARET — Rekor Kafile
"Tarihin en büyük kafilesi yola çıktı: 10.000 birim Demir,
İstanbul'dan Diyarbakır'a hareket halinde. Değer: 2.4 Milyon Akçe."

🏛️ DARBE — Konya'da İktidar El Değiştirdi
"Konya Valisi [ESKİ VALİ], gerçekleştirilen darbe sonucunda görevden uzaklaştırıldı.
Yeni Vali: [YENİ VALİ]. Bölge sakinleri tepkisini sosyal medyada paylaşıyor."

⚔️ SAVAŞ SONUCU — Ankara Çatışması
"Şiddetli çatışmaların ardından Eskişehir, [FRAKSIYON] kontrolüne geçti.
Kayıplar: Saldıran 340, Savunan 520 birlik. Ganimet: 85.000 Akçe."
```

**Haber Teli Özellikleri:**
- Son 50 haber listelenir (premium: son 200)
- Filtre: Savaş haberleri, ticaret haberleri, siyaset haberleri, bölge haberleri
- Abone ol: Belirli bölge veya oyuncunun haberlerini takip et
- **Global Kanala otomatik yansıtılır** (önemli olaylar)

### 9.3 Oyuncu Gazeteciliği

Herhangi bir oyuncu gazete makalesi yazabilir.

**Makale Türleri:**

| Tür | Açıklama | Etki |
|---|---|---|
| **Haber Makalesi** | Objektif olay aktarımı | Bilgi amaçlı, güvenilirlik puanı artar |
| **Köşe Yazısı** | Analiz ve yorum | Okuyucu bağlılığı, oy verebilir |
| **Propaganda** | Kasıtlı yönlendirici içerik | Hedef şehrin moralini etkiler |
| **İlan** | Ticaret veya işe alım | Pazar kanalına da düşer |
| **Röportaj** | Başka oyuncuyla yapılan röportaj | Yüksek etkileşim |

**Makale Yazma:**
1. Gazetehane menüsüne gir
2. Başlık, içerik, tür, hedef şehir (varsa) gir
3. Yayınla → 5 Enerji harcanır
4. Makale moderasyon kuyruğuna düşer (otomatik hız filtresi + spam kontrolü)
5. Onaylanınca haber akışına ve gazete sayfasına düşer

**Okuma Mekanizması:**
- Her makale okunma sayısı, beğeni ve yorum alabilir
- Yüksek okunma → Yazar "Başyazar" seviyesine çıkar → bonus Akçe
- Gazeteler arasında birlik: Birden fazla gazeteci "gazete evi" kurabilir

### 9.4 Propaganda Mekaniği

**Propaganda, oyunun siyasi savaş aracıdır.**

Bir oyuncu bir şehri hedef alarak propaganda makalesi yazarsa:

```
Hedef şehrin moralini etkiler:
- Zayıf propaganda (1–2 yıldız makale): -%2 moral
- Güçlü propaganda (4–5 yıldız makale): -%8 moral
- Viral propaganda (1.000+ okuma): -%15 moral
- Karşı propaganda: Etki nötralize edilir
```

**Propaganda Savunması:**
- Şehrin "İstihbarat Servisi" binası aktifse, propagandanın kaynağı tespit edilebilir
- Vali "Yalanlama" makalesi yayınlarsa propaganda etkisi %50 azalır
- Yüksek moralli şehirler propagandaya dirençlidir (%80 azalma)

### 9.5 Kılıç Gazetesi (Ulusal Yayın)

Tüm oyun sunucusunun resmi gazetesi.

**Haftalık Yayın İçeriği (Otomatik Oluşturulan):**
- Haftanın savaşları — istatistiklerle birlikte
- Haftanın en büyük ticaret işlemleri
- Bölge Ligi sıralamaları
- Haftanın en çok okunan oyuncu makaleleri
- Piyasa özeti (hangi mal ne kadar değer kazandı/kaybetti)
- Yeni lonca sözleşmeleri ve dikkat çekici paralı asker ilanları

**Ön Sayfa:**
- Haftanın en büyük olayı otomatik seçilir
- Oyuncular Altın harcayarak ön sayfaya reklam verebilir

---

## 10. SİYASET VE YÖNETİM SİSTEMİ

### 10.1 Şehir Yönetimi

Her şehrin bir Valisi vardır. Vali hem ekonomik hem askeri kararları yönetir.

**Vali Yetkileri:**
- Vergi oranını belirleme (%0–30)
- Şehir binalarına yatırım emri
- Savaş ilanı (fraksiyon onayı gerekebilir)
- Diplomatik anlaşma
- Gazete kanalı denetimi
- Kafile ticaret sözleşmelerini onaylama
- Paralı asker sözleşmesini onaylama (şehir adına)

### 10.2 Valilik Kazanma Yolları

| Yol | Açıklama |
|---|---|
| **Seçim** | Bölge sakinleri oy kullanır; çoğunluk kazanır |
| **Askeri Fetih** | Savaşla bölge el geçirilir; kazanan Vali olur |
| **Darbe** | Yönetici devrilir; darbe organizatörü veya önerdiği kişi Vali olur |
| **Fraksiyon Ataması** | Fraksiyon, kontrol ettiği bölgeye üyesini Vali atar |

### 10.3 Diplomatik Sistem

**Anlaşma Türleri:**

| Anlaşma | Etki |
|---|---|
| **Ateşkes** | Belirlenen süre boyunca savaş yasak |
| **Serbest Ticaret** | Bölge pazarlarında vergi indirimi |
| **Askeri İttifak** | Birbirinin savaşına otomatik destek |
| **Hammadde Anlaşması** | Belirlenen fiyat ve miktarda düzenli hammadde satışı |
| **Kafile Geçiş Hakkı** | Bölge üzerinden güvenli kafile geçişi |
| **Tarafsızlık Pakti** | Birbirinin savaşlarına katılmama taahhüdü |

Diplomatik anlaşmalar **hem bireysel oyuncular hem fraksiyonlar arasında** yapılabilir.

---

## 11. FRAKSİYON SİSTEMİ

### 11.1 Fraksiyon Yapısı

| Rol | Yetki |
|---|---|
| **Kağan (Lider)** | Tam yetki; savaş ilanı, hisse ihracı, fraksiyon sözleşmesi |
| **Bey (Yardımcı)** | Üye kabulü/çıkarımı, kişel sözleşme onayı |
| **Komutan** | Savaş koordinasyonu, birlik atama |
| **Tüccar** | Fraksiyon hazinesi adına ticaret |
| **Gazeteci** | Fraksiyon gazetesi yönetimi |
| **Üye** | Temel fraksiyon aktiviteleri |

### 11.2 Fraksiyon Savaş Yetenekleri

- **Koordineli saldırı**: 5 üye aynı anda aynı bölgeye saldırırsa +%40 bonus
- **Ortak savunma**: Tehdit altındaki üye otomatik destek isteği gönderir
- **Fraksiyon kışlası**: Merkez şehirde; ücretsiz birlik eğitimi hakkı
- **İstihbarat paylaşımı**: Üyeler arasında casusluk bilgisi ortaklanır
- **Fraksiyon ittifakı**: İki fraksiyon ortak düşmana karşı birleşebilir
- **Toplu paralı asker kiralama**: Fraksiyon adına 10 paralı askere kadar aynı anda sözleşme

### 11.3 Fraksiyon Ekonomisi

- **Fraksiyon Hazinesi**: Üyelerden vergi (oran oylamayla belirlenir)
- **Fraksiyon Marketyeri**: Yalnızca üyelere özel ticaret kanalı
- **Hisse Sistemi**: Fraksiyon hissesi ihracı (bkz. Bölüm 7.7)
- **Fraksiyon Bankası**: Üyeler fraksiyon bankasından düşük faizli Akçe borç alabilir
- **Ortak Kafile**: Fraksiyon adına devasa ticaret kafileleri düzenlenebilir

### 11.4 Bölge Ligi (Haftalık Sezon)

Her hafta fraksiyonlar kontrol ettikleri bölge sayısı ve ekonomik güce göre puanlanır.

**Puan Hesabı:**
```
Fraksiyon Puanı = (Kontrol edilen bölge × 100)
                + (Toplam ticaret hacmi / 10.000)
                + (Savaş galibiyet sayısı × 50)
                + (Paralı asker sözleşme sayısı × 25)
                - (Kaybedilen bölge × 80)
```

**Sezon Ödülleri:**

| Sıra | Ödül |
|---|---|
| 1. | 50.000 Akçe/üye + 50 Altın/üye + "Şampiyon" unvanı |
| 2. | 30.000 Akçe/üye + 25 Altın/üye |
| 3. | 15.000 Akçe/üye + 10 Altın/üye |
| 4–10. | 5.000 Akçe/üye |

---

## 12. OYUNCU İLERLEMESİ

### 12.1 Çift XP Sistemi

| XP Türü | Nasıl Kazanılır | Ne Açar |
|---|---|---|
| **Ticaret XP** | Ticaret işlemi, kafile, üretim, lonca geliri | Ticaret beceri ağacı |
| **Askeri XP** | Savaş, baskın, paralı askerlik, darbe | Savaş beceri ağacı |

Her XP türü 1–20 seviye arasındadır. Toplam seviye = ikisinin ortalaması (görsel gösterim).

### 12.2 Beceri Ağaçları

**Ticaret Ağacı:**

```
Seviye 1–3   → Pazar Erişimi (daha fazla şehirde alım satım)
Seviye 4–6   → Kafile Kapasitesi (+%30 yük)
Seviye 7–9   → Fiyat Analizi (5 günlük grafik görünümü)
Seviye 10–12 → Arbitraj Alarmı (otomatik fiyat uyarısı)
Seviye 13–15 → Fraksiyon Bankacısı (borç verme/alma faiz avantajı)
Seviye 16–18 → Emtia Uzmanı (vadeli sözleşmede bonus)
Seviye 19–20 → Piyasa Hâkimi (kendi şehrinde fiyatı %10 yönlendirebilir)
```

**Askeri Ağaç:**

```
Seviye 1–3   → Birlik Kapasitesi (+50 birlik üretim limiti)
Seviye 4–6   → Baskın Ustası (baskın başarı şansı +%20)
Seviye 7–9   → Komutan Efendisi (2 komutan yerine 4 komutan)
Seviye 10–12 → Paralı Asker Şöhreti (itibar kazanımı 2× hızlı)
Seviye 13–15 → Stratejist (savaş planı önceden görüntüleme)
Seviye 16–18 → İstihbarat Ağı (rakip üretimi gözetleme)
Seviye 19–20 → Efsane Komutan (+%30 tüm birlik bonusu)
```

### 12.3 Rozet Sistemi

Özel başarımlar için kazanılan rozetler — profilinde görünür, gerçek bonusları yoktur ama prestij sağlar.

| Rozet | Koşul |
|---|---|
| 🗡️ Baskın Ustası | 50 başarılı baskın |
| ⚖️ Büyük Tüccar | 1.000.000 Akçe ticaret hacmi |
| 📰 Başyazar | 50 makale, toplam 10.000 okuma |
| ⚔️ Savaş Efsanesi | 100 savaşta yer alma |
| 🏰 Kale Valisi | 30 gün kesintisiz bölge kontrolü |
| 🤝 Sefer Ağası | 25 başarılı paralı askerlik sözleşmesi |
| 📈 Borsa Tilkisi | 100 açık artırma işlemi |

---

## 13. PREMİUM SİSTEM

### 13.1 Premium Felsefesi

**Kılıç ve Kantar'ın temel prensibi: Hiçbir satın alma savaş veya ticaret mekaniğinde doğrudan avantaj vermez.**

Premium şunları satın alır: **Zaman tasarrufu, konfor ve görünürlük** — güç değil.

### 13.2 Altın Paketi Fiyatlandırması

| Paket | Altın Miktarı | Fiyat (TL) | Bonus |
|---|---|---|---|
| Küçük Kese | 100 Altın | 19,99 ₺ | — |
| Orta Kese | 300 Altın | 49,99 ₺ | +50 bonus Altın |
| Büyük Kese | 700 Altın | 99,99 ₺ | +150 bonus Altın |
| Hazine Sandığı | 1.500 Altın | 199,99 ₺ | +400 bonus Altın |
| Sultan Vakfı | 3.500 Altın | 399,99 ₺ | +1.000 bonus Altın |

### 13.3 VIP Abonelik Planları

Aylık abonelik sistemi — Altın ile de satın alınabilir.

| Plan | TL/ay | Altın/ay | Avantajlar |
|---|---|---|---|
| **Tüccar** | 29,99 ₺ | 60 AL | +50 enerji maks, +25 AL/gün giriş bonusu, 25 açık artırma ilan |
| **Komutan** | 59,99 ₺ | 120 AL | Tüccar + +75 enerji maks, 7 günlük fiyat grafiği, lonca öncelik listesi |
| **Sultan** | 99,99 ₺ | 200 AL | Komutan + özel profil çerçevesi, sonsuz mesaj geçmişi, haber akışı önceliği |

### 13.4 Çalışma Süresi Yenileme (En Kritik Premium Özellik)

Bu özellik kullanıcının sorusunda özellikle vurgulanmıştır.

**Senaryo 1 — Süre Bitmeden Uzatma:**
- Aktif çalışma döngüsü devam ederken Altın harcayarak süreyi uzat
- Maliyet: 5 Altın = +%50 süre uzatma
- Maksimum 2 uzatma (döngü başına)

**Senaryo 2 — Süre Bittikten Sonra Anında Yenileme:**
- Çalışma döngüsü tamamlandı, oyuncu makinenin başında değildi
- Normal: Yeni döngü başlatmak için giriş yapıp tıklamak gerekir
- **Premium ile**: 8 Altın harcayarak yeni döngü **anında otomatik başlar**
- Yani oyuncu geç kalsa bile kayıp olmaz — Altın harcayarak kaybedilen zamanı telafi eder

**Senaryo 3 — Otomatik Zincirleme:**
- Sultan VIP aboneleri çalışma döngülerini otomatik zincirleyebilir
- Döngü bitince 3 Altın mahsup edilerek yeni döngü anında başlar
- Sabah uyanınca tüm gece boyunca çalışma gerçekleşmiş olur

**Senaryo 4 — Toplu Yenileme:**
- Uzun süre çevrimdışı kalan oyuncu (örn. tatil)
- Birden fazla döngüyü toplu yenileme: 1 döngü = 8 Altın, 3 döngü = 20 Altın (indirimli)

### 13.5 Premium Özellikleri Tam Listesi

| Özellik | Ücretsiz | Tüccar | Komutan | Sultan |
|---|---|---|---|---|
| Max Enerji | 100 | 150 | 175 | 200 |
| Enerji Yenilenme | 5/saat | 7/saat | 9/saat | 12/saat |
| Açık Artırma Limiti | 10 | 25 | 40 | 60 |
| Fiyat Grafiği | 1 gün | 3 gün | 7 gün | 30 gün |
| Sohbet Rate Limit | 1/10sn | 1/5sn | 1/3sn | 1/sn |
| Mesaj Geçmişi | 500 | 1.000 | 1.500 | Sınırsız |
| Kafile Sigortası | %0 | %40 | %60 | %80 |
| Çalışma Otomatik Zincirleme | ✗ | ✗ | ✗ | ✓ (3 AL/döngü) |
| Çalışma Anında Yenileme | Hayır | 10 AL | 8 AL | 6 AL |
| Lonca Öncelik Listesi | ✗ | ✗ | ✓ | ✓ |
| Haber Uyarısı | ✗ | ✓ | ✓ | ✓ |
| Özel Profil Çerçevesi | ✗ | ✗ | ✗ | ✓ |
| Günlük Altın Giriş Bonusu | 1 AL | 3 AL | 5 AL | 10 AL |

### 13.6 Kozmetik Sistem

Altın ile satın alınabilen, oyun mekaniğini ETKİLEMEYEN görsel öğeler:

- **Birlik Kaplamaları**: Özel görsel tema (Osmanlı, Modern, Efsane)
- **Şehir Bayrağı**: Özel tasarım bayrak/arma
- **İsim Rengi/Çerçevesi**: Sohbette öne çıkma
- **Makale Şablonu**: Gazetede özel görsel tasarım
- **Lonca Logosu**: Paralı asker profilinde özel rozet
- **Kafile Görünümü**: Haritada özel kafile simgesi

---

## 14. EVENT SİSTEMİ

### 14.1 Savaş Eventleri

| Event | Tetikleyici | Etki |
|---|---|---|
| Büyük Savaş | 3+ fraksiyon aynı anda savaşta | Özel Altın ödüllü sezon görevi aktif olur |
| İstanbul Kuşatması | İstanbul'a saldırı | Tüm sunucuya duyuru; oyuncular taraf seçebilir |
| Gazavat | 10+ bölge el değiştirirse | Özel birlik tipi geçici olarak açılır |

### 14.2 Ekonomik Eventler

| Event | Tetikleyici | Etki |
|---|---|---|
| Kıtlık | 5 MicroTick boyunca arz düşük | Gıda fiyatları x3; acil ticaret fırsatı |
| Altın Çağ | Bölge Ligi sonu | Tüm üretim 24 saat boyunca +%50 |
| Büyük Pazar | Haftanın son MacroTick'i | Tüm ticaret işlemleri vergi sıfır |
| Sefer Günü | Aylık özel event | Paralı asker sözleşmeleri 2× itibar puanı |

### 14.3 Sosyal Eventler

| Event | Açıklama |
|---|---|
| Gazete Ödülleri (Aylık) | En çok okunan makale, propaganda, haber dalları — Altın ödül |
| Borsa Yarışması | 1 haftalık en iyi portföy getirisi — Altın ödül |
| Kafile Rekoru | Tek kafileyle en yüksek kâr — özel rozet |
| Lonca Şampiyonası | En başarılı paralı asker fraksiyon — Kantar Ağası unvanı |

---

## 15. HARİTA VE STRATEJİK BÖLGELER

### 15.1 81 İl Haritası

Türkiye'nin 81 ilini kapsayan interaktif SVG haritası oyunun görsel merkezidir.

**Harita Görselleri:**
- Her ilin renk kodu: Hangi fraksiyonun kontrolünde olduğunu gösterir
- Aktif savaş: Kırmızı titreyen ikon
- Kafile yolları: Hareket eden ikonlar
- Ekonomik değer: İl simgesi üzerine gelince gösterilir

### 15.2 Stratejik Değer Tablosu

| Şehir | Stratejik Önemi | Özel Kaynak |
|---|---|---|
| İstanbul | Boğaz kontrolü, lojistik merkezi | Deniz ticareti +%50 |
| Ankara | Siyasi merkez, darbe direnci | Devlet yapısı bonusu |
| İzmir | Ege kapısı, yoğun ticaret | İhracat limiti yüksek |
| Trabzon | Karadeniz limanı | Kereste + Balık |
| Diyarbakır | Doğu geçit noktası | Stratejik askeri konum |
| Erzurum | Doğu kalesi | Savunma bonusu %30 |
| Bursa | Sanayi merkezi | Üretim hızı +%20 |
| Konya | İç Anadolu merkezi | Buğday üretimi x2 |
| Adana | Akdeniz kapısı | Pamuk + Zeytinyağı |
| Samsun | Karadeniz merkezi | Liman geliri yüksek |

### 15.3 Coğrafi Avantajlar

- **Kıyı şehirleri**: Deniz kafileleri (5× daha hızlı, 2× daha büyük)
- **Dağ şehirleri**: Savunma bonusu, yavaş kafile
- **Ova şehirleri**: Tarım verimi +%40
- **Sınır şehirleri**: Dış tehdit bonusu, istihbarat avantajı (oyun genişlediğinde)

---

## 16. KULLANICI ARAYÜZÜ

### 16.1 Ana Ekran Düzeni

```
╔═══════════════════════════════════════════════════════════════╗
║  [KILIÇ VE KANTAR]    [HARITA] [PAZAR] [LONCA] [GAZETE] [BEN]║
╠═════════════════════╦═════════════════════╦═════════════════════╣
║   HABER AKIM        ║    ANA HARİTA       ║   SOHBET            ║
║   ─────────────     ║    (Türkiye 81 il)  ║   ─────────────     ║
║   ⚔️ Ankara→İzmir   ║                     ║   #dünya            ║
║   📦 Kafile rota    ║    [İnteraktif SVG] ║   [MESAJLAR...]     ║
║   📰 Yeni makale    ║                     ║   ─────────────     ║
║   🏛️ Konya darbesi  ║    Savaş ikonları   ║   [Mesaj gir...]    ║
║   ─────────────     ║    Kafile ikonları  ║                     ║
║   [DAHA FAZLA]      ║    Renk haritası    ║   LONCA PANOSУ      ║
║                     ║                     ║   ─────────────     ║
║   HIZLI ÇALIŞMA     ║                     ║   [Aktif İlanlar]   ║
║   [⚙️ 2s 14dk kaldı]║                     ║   3 Paralı Asker    ║
╚═════════════════════╩═════════════════════╩═════════════════════╝
║  [⚙️ 45.230 Akçe]  [🥇 12 Altın]  [Enerji: 75/100]  [XP: 14/15]║
╚═══════════════════════════════════════════════════════════════════╝
```

### 16.2 HUD Elemanları

- Anlık Akçe bakiyesi (⚙️)
- Altın bakiyesi (🥇)
- Enerji bar (renk değişimi: yeşil > sarı > kırmızı)
- Seviye + XP çift bar (Ticaret / Askeri)
- MicroTick ve WarTick geri sayım
- Aktif savaş sayacı (kırmızı uyarı, tık ile açılır)
- Bildirim zili (savaş olayları öncelikli)
- Çalışma geri sayımı (süre dolunca titreşimli uyarı)
- VIP rozeti (Tüccar/Komutan/Sultan)
- WebSocket bağlantı durumu

### 16.3 Mobil Uyumluluk

- Responsive tasarım; harita küçültülmüş ama kaydırılabilir
- Bildirimler anlık push notification olarak mobilde görünür
- Sohbet ve gazete mobilde tam erişilebilir
- Çalışma döngüsü başlatma/toplama mobil öncelikli tasarım

---

## 17. TEKNİK MİMARİ

### 17.1 Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend** | React + TypeScript | SPA, dinamik harita |
| **Harita** | D3.js + SVG | İnteraktif 81 il haritası |
| **Real-time** | WebSocket (Socket.io) | Sohbet, savaş güncellemesi, bildirim |
| **Backend** | Node.js (Express) veya Django | REST API + WebSocket sunucusu |
| **Veritabanı** | PostgreSQL | Ana veri tabanı |
| **Cache** | Redis | Oturum, sohbet, tick cache |
| **Kuyruk** | Bull (Redis tabanlı) | Tick engine, kafile hareketi, üretim |
| **CDN** | Cloudflare | Statik dosyalar, DDoS koruması |
| **Ödeme** | İyzico / Stripe | Altın paketi satışı |

### 17.2 Temel Veritabanı Tabloları

```sql
-- Oyuncular
players (id, username, email, akce_balance, altin_balance, energy,
         trade_xp, military_xp, vip_plan, vip_expires_at,
         reputation, created_at)

-- Çalışma Döngüleri
labor_cycles (id, player_id, type, started_at, ends_at,
              is_active, auto_chain_enabled, extended_count)

-- Paralı Asker Profilleri
mercenary_profiles (id, player_id, specialization, daily_rate_akce,
                    daily_rate_altin, is_available, reputation_score,
                    total_contracts, created_at)

-- Sözleşmeler
contracts (id, employer_id, mercenary_id, type, duration_days,
           total_akce, total_altin, status, started_at, ended_at,
           employer_rating, mercenary_rating)

-- Haberler
news_articles (id, author_id, title, content, type, target_region_id,
               read_count, like_count, propaganda_strength,
               published_at, is_approved)

-- Kafileler
caravans (id, owner_id, origin_region_id, destination_region_id,
          cargo_json, guard_count, status, departure_at, arrival_at,
          insurance_coverage, is_insured)

-- Açık Artırma
auction_listings (id, seller_id, item_type, item_data_json,
                  starting_price, buy_now_price, currency,
                  current_bid, current_bidder_id,
                  ends_at, status)

-- Sohbet Mesajları
chat_messages (id, player_id, channel, content, created_at)

-- Borsa
market_orders (id, player_id, commodity, order_type, quantity,
               price_per_unit, currency, filled_quantity, status, created_at)

-- Fraksiyon Hisseleri
faction_shares (id, faction_id, total_shares, available_shares,
                current_price_akce, issued_at)

share_holdings (id, player_id, faction_id, share_count, avg_buy_price)
```

### 17.3 WebSocket Olayları

```
// Sunucu → İstemci
'war:declared'         → Savaş ilanı bildirimi
'war:tick_result'      → WarTick sonucu
'chat:message'         → Yeni sohbet mesajı
'news:published'       → Yeni haber yayınlandı
'caravan:attacked'     → Kafile saldırıya uğradı
'caravan:arrived'      → Kafile ulaştı
'auction:bid'          → Yeni teklif
'auction:won'          → Açık artırma kazanıldı
'contract:offer'       → Paralı asker teklifi
'labor:completed'      → Çalışma döngüsü tamamlandı
'market:price_alert'   → Piyasa uyarısı (premium)

// İstemci → Sunucu
'chat:send'            → Mesaj gönder
'bid:place'            → Teklif ver
'contract:accept'      → Sözleşme kabul et
'labor:restart'        → Altın ile döngü yenile
```

---

## 18. GELİŞTİRME FAZLARI

### Faz 0 — Altyapı (2–3 Hafta)
- [ ] Proje kurulumu (monorepo, CI/CD, linting)
- [ ] Temel auth sistemi (JWT, oturum yönetimi)
- [ ] Veritabanı şeması ve migration altyapısı
- [ ] Tick Engine (MicroTick, MacroTick, WarTick) iskelet
- [ ] WebSocket sunucu altyapısı
- [ ] 81 il SVG haritası entegrasyonu

### Faz 1 — MVP Ekonomi (6–8 Hafta)
- [ ] Çalışma (Labor) sistemi + çift para birimi
- [ ] Üretim zinciri (Tier 1 mallar)
- [ ] Şehir piyasası (dinamik fiyat motoru)
- [ ] Oyuncu profili ve temel HUD
- [ ] Temel sohbet sistemi (#dünya, bölge, DM)
- [ ] Açık artırma evi (temel)
- [ ] Premium — Altın paketi + çalışma yenileme

### Faz 2 — Savaş Sistemi (8–10 Hafta)
- [ ] Birlik üretimi ve askeri XP
- [ ] Savaş ilanı ve WarTick çözümleyici
- [ ] Baskın sistemi
- [ ] Darbe sistemi
- [ ] Fraksiyon sistemi (temel)
- [ ] Otomatik haber akışı (savaş olayları)

### Faz 3 — Sosyal & Derinlik (8–10 Hafta)
- [ ] Paralı asker sistemi (Sefer Loncası) — tam implementasyon
- [ ] Gazete & propaganda sistemi
- [ ] Kafile ticaret sistemi
- [ ] P2P takas sistemi
- [ ] Fraksiyon kanalları ve sohbet genişletme
- [ ] Oyuncu profili rozetleri
- [ ] Kılıç Gazetesi (haftalık otomatik yayın)

### Faz 4 — Ekonomi Derinliği (6–8 Hafta)
- [ ] Emtia Borsası (vadeli sözleşmeler)
- [ ] Fraksiyon hisse senedi sistemi
- [ ] Altın borsa (Akçe ↔ Altın kur mekanizması)
- [ ] Kafile sigortası sistemi
- [ ] Tier 2–3 üretim zinciri
- [ ] Bölge Ligi (haftalık sezon) — tam implementasyon

### Faz 5 — Canlı & Büyüme (Süregelen)
- [ ] Event sistemi (savaş, ekonomi, sosyal)
- [ ] Mobil optimizasyon
- [ ] Moderasyon araçları (gazete, sohbet)
- [ ] Balans ayarı (tick süresi, fiyat motoru, savaş çözümleme)
- [ ] A/B testleri (premium paketler, UX)
- [ ] Topluluk geri bildirimi döngüsü

---

## 19. MONETİZASYON VE ETİK SINIRLAR

### 19.1 Gelir Modeli

| Kanal | Tahmini Gelir Payı |
|---|---|
| Altın paketi satışı (tek seferlik) | %45 |
| VIP abonelik | %35 |
| Kozmetik satışı | %15 |
| Özel etkinlik/sezon geçişi | %5 |

### 19.2 Pay-to-Win Önleme İlkeleri

1. **Savaş gücü** hiçbir şekilde para ile satın alınamaz
2. **Ticaret avantajı** yalnızca piyasa bilgisine (grafik vb.) uzanır — fiyat manipülasyonu değil
3. **Altın → Akçe dönüşümü** kur piyasa tarafından belirlenir; üretim gibi kazanılabilir değil
4. **Birlik gücü, baskın başarısı, kale direnci** gerçek oyun kararlarıyla kazanılır
5. **Loot box yok**, şans mekanizması yok, reklam yok
6. **Paralı asker sözleşmesi** yalnızca oyun içi Akçe veya oyuncu-oyuncu Altın transferi — doğrudan güç satışı değil

### 19.3 Topluluk Güveni

- Tüm premium avantajlar açıkça belgelenmiş ve şeffaf
- Ücretsiz oyuncu da tüm oyun mekaniğine tam erişimlidir
- Premium = konfor + hız + kozmetik; hiçbiri zafer garantisi değil

---

## 20. TERİMLER SÖZLÜĞÜ

| Terim | Tanım |
|---|---|
| **Akçe** | Oyunun temel para birimi; yalnızca oynayarak kazanılır |
| **Altın** | Premium para birimi; satın alınabilir veya az miktarda oyunda kazanılabilir |
| **MicroTick** | 15 dakikada bir gerçekleşen küçük güncelleme döngüsü |
| **MacroTick** | 6 saatte bir gerçekleşen büyük güncelleme döngüsü |
| **WarTick** | 30 dakikada bir savaşları çözen döngü |
| **Kafile** | Şehirler arası ticaret taşıma sistemi |
| **Sefer Loncası** | Paralı askerlerin kayıt ve sözleşme platformu |
| **Propaganda** | Hedef şehrin moralini etkileyen oyuncu yazılı içerik |
| **Haber Teli** | Otomatik sistem tarafından üretilen olay haberleri |
| **Kılıç Gazetesi** | Haftalık sunucu genelinde yayınlanan özet gazete |
| **Borsa** | Emtia ve fraksiyon hisselerinin alınıp satıldığı piyasa |
| **Bölge Ligi** | Fraksiyonların puan topladığı haftalık rekabetçi sezon |
| **Vali** | Bir şehri yöneten oyuncu rolü |
| **Kağan** | Fraksiyon lideri |
| **İtibar Puanı** | Paralı askerlerin güvenilirlik ölçütü |
| **Çalışma Döngüsü** | Oyuncunun Akçe/mal ürettiği zaman sayaçlı periyot |
| **Otomatik Zincirleme** | Sultan VIP: döngü bitince otomatik yeni döngü başlatma |

---

## 21. BELGE ÖZETİ

**Kılıç ve Kantar**, Rival Regions'ı temel referans alarak başlar ama onu çok daha derin, sosyal ve ekonomik olarak zengin bir deneyime dönüştürür.

**Üç büyük ayrışma noktası:**

1. **Sosyal Katman** — Global sohbet, fraksiyon kanalları, oyuncu gazeteciliği, propaganda. Oyuncular sadece birbirleriyle değil, **birbirleri hakkında** da oynuyor.

2. **Ekonomik Derinlik** — Kafile ticareti, açık artırma, P2P takas, emtia borsası, fraksiyon hissesi. Akçe ekonomisi tamamen oyuncular tarafından oluşturuluyor.

3. **İnsan-İnsan Etkileşimi** — Paralı asker sistemi, oyunculararası sözleşmeler, itibar ekonomisi. Her oyuncu başka oyuncunun potansiyel müşterisi veya işvereni.

---

*Kılıç ve Kantar GDD v3.0 — Tüm hakları saklıdır.*
*Bu belge gizli olup yetkisiz dağıtımı yasaktır.*
