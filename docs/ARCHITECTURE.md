# Teknik Mimari ve Sistem Tasarımı

Bu doküman, sistemin ağ yapısını, kimlik doğrulama akışını, gerçek zamanlı olay iletimini ve arka plan iş kuyruğunu açıklar.

---

## 1. Ağ ve Tersine Vekil (Nginx Reverse Proxy)

Kullanıcı tarayıcısından gelen tüm HTTP ve WebSocket istekleri tek bir giriş noktası olan **Nginx (:80)** tarafından karşılanır. Bu sayede CORS (Cross-Origin Resource Sharing) karmaşası tamamen ortadan kalkar.

```text
                                [ Tarayıcı ]
                                     │
                                     ▼
                        [ Nginx Proxy (:80) ]
        ┌───────────────────┬────────┴───────────┬────────────────────┐
        │                   │                    │                    │
   location /         location /api/       location /socket.io/  location /auth/
        │                   │                    │                    │
        ▼                   └──────────┬─────────┘                    ▼
 [ React/Vite ]                 [ NestJS API & Ws ]              [ Keycloak ]
    (:3000)                          (:5000)                        (:8080)
                               ┌─────────┴─────────┐                  │
                               ▼                   ▼                  ▼
                    [ PostgreSQL 16 ]     [ Redis 7 (Alpine) ]  [ Postgres ]
                        (app_db)           (Cache & BullMQ)    (keycloak_db)
```

---

## 2. Kimlik Doğrulama ve Yetkilendirme Akışı (Keycloak OIDC + JWT)

Kimlik yönetimi tamamen Keycloak üzerinden OIDC (OpenID Connect) Authorization Code Flow + PKCE ile yürütülür.

```text
Tarayıcı                 Keycloak                 Nginx / NestJS
   │                        │                           │
   ├─── 1. Oturum Yok ─────>│ (Login Ekranı)            │
   │<── 2. Giriş Başarılı ──┤ (JWT Access Token)        │
   │                        │                           │
   ├─── 3. GET /api/data (Authorization: Bearer JWT) ──>│
   │                                                    ├── 4. Token Doğrulama
   │                                                    ├── 5. @Roles Guard Kontrolü
   │<── 6. JSON Yanıt (200 OK) ─────────────────────────┤
```

### NestJS Tarafında Token Denetimi:
1. `KeycloakConnectModule` gelen JWT'yi Keycloak public sertifikası ile doğrular.
2. `@Public()` ile işaretlenmemiş tüm endpoint'ler için geçerli bir token zorunludur.
3. `@Roles('ADMIN', 'MANAGER')` dekoratörü token içerisindeki `realm_access.roles` dizisini inceler. Eşleşme yoksa anında `403 Forbidden` döner.

---

## 3. Gerçek Zamanlılık (WebSocket) & Arka Plan Kuyrukları (BullMQ)

- **WebSocket (Socket.io):** Tarayıcılar `/socket.io/` geçidi üzerinden doğrudan `EventsGateway`'e bağlanır. Bir kayıt güncellendiğinde backend `broadcastEvent` veya `emitToRoom` ile anlık sinyal fırlatır. Frontend'deki `useLiveSync` hook'u bu sinyali yakalayarak TanStack Query cache'ini otomatik yeniler (sayfa yenileme gerekmez).
- **Arka Plan Kuyruğu (BullMQ + Redis):** E-posta gönderimi, PDF/rapor üretimi veya dış webhook çağrıları gibi bloklayıcı işlemler `AppQueueModule` üzerinden Redis kuyruklarına devredilir.

---

## 4. Veritabanı ve Migration Stratejisi

- PostgreSQL üzerinde iki bağımsız veritabanı bulunur:
  1. `keycloak_db`: Keycloak'ın kendi kullanıcı, oturum ve istemci verileri.
  2. `app_db`: Uygulamanın iş alanı (domain) verileri.
- Uygulama tarafında `synchronize: false` kuralı esastır.
- Şema güncellemeleri yalnızca `TypeORM` migration dosyaları ile gerçekleştirilir (`backend/src/migrations`).
- Tüm iş nesneleri (Entities) standart olarak `BaseEntity` sınıfını miras alır:
  - `id`: UUID (v4)
  - `createdAt`: `timestamp with time zone`
  - `updatedAt`: `timestamp with time zone`
  - `deletedAt`: Soft delete desteği
