# Enterprise Agentic Boilerplate - Agent Operating Instructions

> **Bu dosya, bu repoda çalışan tüm yapay zekâ kodlama ajanları (Antigravity, Cursor, Codex, Claude vb.) için bağlayıcı ve zorunlu çalışma anayasasıdır.**

---

## 1. AJAN GİRİŞ VE BAŞLANGIÇ PROTOKOLÜ (ONBOARDING)

Kullanıcı bu repoyu yeni bir proje için açtığında ve sana *"AGENTS.md'yi oku ve benden bilgileri al"* veya benzeri bir başlangıç komutu verdiğinde **ASLA RASTGELE KOD YAZMAYA BAŞLAMA**. 

İlk olarak aşağıdaki **Keşif Mülakatını (Discovery Interview)** başlat ve kullanıcıya sırasıyla şu soruları sor:

1. **Projenin Adı ve Amacı:** Bu sistem ne işe yarar, hangi problemi çözer?
2. **Kullanıcı Rolleri:** Keycloak üzerinde tanımlanacak roller nelerdir? (Örn: `ADMIN`, `MANAGER`, `CUSTOMER`)
3. **Temel Varlıklar (Entities):** Sistemin yönettiği ana veri nesneleri nelerdir? (Örn: `Product`, `Order`, `Invoice`)
4. **İlişkiler ve İş Kuralları:** Bu varlıklar arasında nasıl bir ilişki var? (Örn: "Bir Müşterinin birden fazla Siparişi olabilir, Stok 0 ise Sipariş onaylanamaz")
5. **Öncelikli Ekranlar / Modüller:** İlk aşamada (MVP) hangi ekranlar ve listeler inşa edilecek?

Kullanıcı bu soruları yanıtladıktan sonra:
- Önce bir **Uygulama Planı (Specification & Architecture Plan)** sun.
- Kullanıcıdan onay aldıktan sonra aşağıdaki **İnşa Protokolü** sırasını takip et.

---

## 2. KESİN VE DEĞİŞMEZ KODLAMA KURALLARI

### A. TypeScript ve Tip Güvenliği
- **`any` TİPİ KESİNLİKLE YASAKTIR.** Hiçbir değişkende, parametrede, dönüş tipinde veya jenerikte `any` kullanılamaz.
- Tip daraltması gerekiyorsa `unknown` + type guard veya generic interface'ler kullan.
- Her yeni backend DTO/Entity için karşılık gelen frontend tipi `frontend/src/types/` altında tanımlanmalı ve senkronize tutulmalıdır.

### B. Veritabanı ve TypeORM Disiplini
- Tüm yeni entity'ler `backend/src/core/entities/base.entity.ts` içindeki `BaseEntity` sınıfından türetilmelidir (`id` [UUID], `createdAt`, `updatedAt`, `isDeleted`).
- **`synchronize: false` kabul edilir.** Veritabanı şema değişiklikleri ASLA elle yapılmaz. Her entity değişikliğinde TypeORM migration oluşturulmalıdır:
  ```bash
  npm run migration:generate --name=AddProductTable
  npm run migration:run
  ```

### C. Backend ve Güvenlik Standartları (NestJS)
- **Yetkilendirme:** Tüm controller metodları Keycloak guard'ları ile korunmalıdır.
  - Açık endpoint'ler için: `@Public()`
  - Rol korumalı endpoint'ler için: `@Roles('ADMIN', 'MANAGER')`
  - İstek yapan kullanıcı bilgisi için: `@CurrentUser()` decorator'ı kullanılmalıdır.
- **Validasyon:** Tüm request body'ler için `class-validator` ve `class-transformer` ile DTO yazılmalıdır. Global `ValidationPipe` aktif olduğu için DTO'da tanımlanmayan alanlar otomatik reddedilir.
- **Hata Yönetimi:** Standart NestJS `HttpException` sınıfları (`NotFoundException`, `BadRequestException`) kullanılmalıdır.

### D. Frontend Standartları (React + Vite)
- **Bileşen Tekrarı YASAKTIR:** Sıfırdan buton, tablo, modal, input yazma! `frontend/src/components/ui/` altında hazır bulunan bileşenleri kullan:
  - `Button`, `Input`, `Select`, `Modal`, `Table`, `Badge`, `Card`, `Toast`.
- **API İstemcisi:** Component içinde asla ikinci bir `axios` instance oluşturma. `src/api/client.ts` kullan. Token ekleme ve hata yakalama bu istemcide otomatiktir.
- **State Yönetimi:** Feature bazlı Zustand store slice'ları oluştur (`src/store/slices/*Slice.ts`).

### E. Hardcoding Yasağı & Dinamik Ayarlar (SystemSettings)
- **Kod İçine Değer Gömmek KESİNLİKLE YASAKTIR:** Limitler, para tutarları, max dosya boyutları, periyotlar veya harici servis URL'leri asla TypeScript kodunun içine hardcode edilemez.
- **Statik Yapılandırma:** Sadece ortam değişkenleri (`.env` ve `ConfigService`) üzerinden okunur.
- **Dinamik İş Kuralları:** Admin tarafından değiştirilebilir olmalı ve `SystemSettingsService` (`src/core/settings/`) üzerinden çekilmelidir (`this.settingsService.getNumber('MAX_LIMIT')`).

### F. Dinamik Özellik Yönetimi (Feature Flags)
- Yeni eklenen veya opsiyonel modüller/yetenekler veritabanı üzerinden admin tarafından açılıp kapatılabilir olmalıdır:
  - Backend controller veya metodu: `@RequireFeature('FEATURE_KEY')` ile korunmalıdır.
  - Frontend arayüzü: `<FeatureGate flag="FEATURE_KEY">` bileşeni ile sarmalanmalıdır.

### G. Güvenlik, Şifre Hijyeni ve Denetim İzi (Audit Logging)
- **Zayıf Şifre Yasağı:** `.env` dosyalarında veya yapılandırmalarda asla sıradan/default şifreler (`postgres`, `admin`, `123456`, `backend-secret`) kullanılamaz. Üretim ortamında (`NODE_ENV=production`) sistem zayıf şifreleri otomatik olarak reddeder.
- **Denetim İzi (Audit Log):** Admin tarafından yapılan tüm ayar değişiklikleri, özellik bayrakları veya kritik domain güncellemeleri `AuditLogService.log(...)` ile kayıt altına alınmalıdır.

---

## 3. ADIM ADIM FEATURE İNŞA PROTOKOLÜ (VERTICAL SLICE)

Yeni bir modül veya özellik eklerken şu zinciri **sırasıyla ve eksiksiz** tamamla:

```text
1. Entity & Migration:
   backend/src/modules/<feature>/entities/<feature>.entity.ts
   -> Migration oluştur ve çalıştır

2. Backend API:
   backend/src/modules/<feature>/dto/create-<feature>.dto.ts
   backend/src/modules/<feature>/dto/update-<feature>.dto.ts
   backend/src/modules/<feature>/<feature>.service.ts
   backend/src/modules/<feature>/<feature>.controller.ts (Keycloak @Roles ile)
   backend/src/modules/<feature>/<feature>.module.ts (AppModule'e ekle)

3. Frontend Type & API:
   frontend/src/types/<feature>.ts (Backend DTO/Entity ile tam uyumlu)
   frontend/src/api/<feature>.api.ts (Endpoints)

4. Frontend State & UI:
   frontend/src/store/<feature>Store.ts (Zustand)
   frontend/src/pages/<feature>/<Feature>ListPage.tsx
   frontend/src/pages/<feature>/<Feature>FormModal.tsx
   frontend/src/router/index.tsx (Rol korumalı rota tanımla)
   frontend/src/layout/navigation.ts (Sidebar menüsüne link ekle)

5. Doğrulama (Self-Check):
   Backend: npm run build (veya npx tsc --noEmit)
   Frontend: npm run build (veya npx tsc --noEmit)
```

---

## 4. DOCKER & SERVİS PORTLARI

- **Nginx Reverse Proxy:** `http://localhost:80` (Tüm dış dünya buraya bağlanır)
  - `/` -> Frontend React (:3000)
  - `/api` -> Backend NestJS (:5000)
  - `/auth` -> Keycloak (:8080)
- **Keycloak Admin:** `http://localhost:8080` (admin / admin)
- **PostgreSQL:** `localhost:5432` (postgres / postgres)
- **Swagger Dokümantasyonu:** `http://localhost:80/api/docs`

---

## 5. TOKEN TASARRUFU & UZMAN MİMAR VİBE CODİNG İLKELERİ

Yapay zekâ bağlam penceresini (context window) korumak ve token tüketimini minimuma indirmek için şu kurallara kesinlikle uyulmalıdır:

1. **Bağlam Filtreleme (.agentignore Uyumu):**
   - `realm-export.json`, lock dosyaları, `.git`, `dist`, loglar ve build çıktılarını ASLA chat bağlamına alma veya okuma.
2. **Cerrahi Düzenleme (Surgical Edits):**
   - 200 satırlık bir dosyada 5 satır değişecekse tüm dosyayı baştan üretme (`overwrite` yerine hedefli `replace_file_content` veya diff kullan). Bu, çıktı tokenlarını %80 azaltır.
3. **Derleyici Odaklı Hızlı Geri Bildirim (Compiler-Driven Loop):**
   - Dosyaları tekrar tekrar okuyarak "acaba hata var mı" diye tahmin etme. Kök dizindeki `npm run check` komutunu çalıştır ve sadece derleyicinin verdiği spesifik satır hatasını hedefe yönelik düzelt.
4. **Few-Shot Referans Kullanımı:**
   - Yeni bir CRUD yazarken sıfırdan mimari uydurmak yerine `docs/AGENT_WORKFLOW.md` içindeki hazır şablonu referans al.
5. **Öz ve Net İletişim (Concise Output):**
   - Kod yazarken gereksiz uzun teorik açıklamalar, tekrarlı özetler üretme. Doğrudan uygulanabilir, temiz ve test edilmiş çözümü sun.
