# Enterprise Agentic Boilerplate 🚀

React (Vite) + NestJS + TypeORM + PostgreSQL + Keycloak IAM + Nginx mimarisiyle hazırlanmış, **yapay zekâ kodlama ajanları (Antigravity, Cursor, Codex, Claude Code)** için optimize edilmiş kurumsal yazılım başlangıç şablonu.

---

## ⚡ Hızlı Başlangıç (Tek Komutla Çalıştırma)

Tüm servisleri (Postgres, Keycloak, Backend, Frontend, Nginx) Docker Compose ile ayağa kaldırın:

```bash
docker compose up --build -d
```

### Servis Erişim Bilgileri:

| Servis | URL | Varsayılan Kullanıcı / Şifre |
| :--- | :--- | :--- |
| **Ana Uygulama (Nginx Entrypoint)** | `http://localhost:80` | `admin@boilerplate.local` / `admin` |
| **Standart Test Kullanıcısı** | `http://localhost:80` | `user@boilerplate.local` / `user` |
| **Swagger API Dokümantasyonu** | `http://localhost:80/api/docs` | Keycloak Bearer Token ile yetkilendirilir |
| **Keycloak Yönetim Paneli** | `http://localhost:8080/auth` | `admin` / `admin` |
| **PostgreSQL Veritabanı** | `localhost:5432` | `postgres` / `postgres` (DB: `app_db`, `keycloak_db`) |

---

## 🤖 Yapay Zekâ Ajanı ile Projeye Başlama (Agentic Kickoff)

Yeni bir proje geliştireceğiniz zaman bu repoyu klonlayın ve ajana yalnızca şu komutu verin:

```text
AGENTS.md dosyasını oku, benden yeni projenin bilgilerini al ve projeyi adım adım inşa et.
```

Ajan bu talimatı aldığında:
1. Size projenin amacı, rolleri, varlıkları ve iş kuralları hakkında **keşif soruları** soracaktır.
2. Verdiğiniz cevaplara göre bir **Uygulama Planı** çıkarıp sizden onay isteyecektir.
3. Onay sonrası **Entity -> Migration -> Backend API -> Frontend Store & UI** sırasıyla projeyi uçtan uca inşa edecektir.

---

## 📁 Mimari ve Klasör Yapısı

```text
enterprise-agent-boilerplate/
├── .agents/
│   └── AGENTS.md                  # Ajanın anayasası ve zorunlu kuralları
├── AGENTS.md                      # Ajan çalışma talimatları (Kök dizin)
├── docker-compose.yml             # Tüm servislerin orkestrasyonu
├── docker/
│   ├── nginx/default.conf         # / (Frontend), /api (Backend), /auth (Keycloak) reverse proxy
│   ├── keycloak/realm-export.json # Hazır realm, client ve test kullanıcıları
│   └── postgres/init-multi-db.sh  # Çoklu veritabanı başlatıcı
├── backend/                       # NestJS 10 + TypeORM + Keycloak Guard'ları
│   ├── src/
│   │   ├── core/                  # BaseEntity, Keycloak Auth Guards, TypeORM DataSource
│   │   ├── modules/health/        # Sağlık kontrolü (/api/health)
│   │   └── migrations/            # TypeORM veritabanı göçleri
├── frontend/                      # React 18 + Vite + Tailwind + Keycloak-js
│   ├── src/
│   │   ├── auth/                  # Keycloak AuthProvider & useAuth hook'u
│   │   ├── api/client.ts          # Otomatik Bearer token enjekte eden Axios istemcisi
│   │   ├── components/ui/         # Hazır Button, Input, Modal, Table, Select, Badge, Card
│   │   ├── layout/                # Sidebar, Header, AppLayout
│   │   └── pages/dashboard/       # Başlangıç ve sağlık kontrol paneli
└── docs/
    ├── ARCHITECTURE.md            # Detaylı mimari ve ağ akış şeması
    └── AGENT_WORKFLOW.md          # Ajan için örnek dikey dilim (Vertical slice) rehberi
```

---

## 🛠️ Yerel Geliştirme (Docker Olmadan)

### Backend:
```bash
cd backend
npm install
npm run start:dev
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### TypeORM Migration Komutları (Backend):
```bash
# Entity değişikliklerinden sonra migration üret:
npm run migration:generate --name=AddYeniTablo

# Migration'ları veritabanına uygula:
npm run migration:run

# Son migration'ı geri al:
npm run migration:revert
```
