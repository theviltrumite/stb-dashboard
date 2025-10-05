# 🌐 STB Kurumsal Yönetim Paneli

STB; organizasyon, proje ve istek (request) yönetimini bir araya getiren modern, **Next.js + Supabase** tabanlı bir yönetim panelidir.  
Mobil uyumlu arayüz, gerçek‑zamanlı sayaçlar, animasyonlar ve shadcn/ui bileşenleri içerir.

---

## ✨ Özellikler

- ⚡ **Next.js 15 (App Router)**, React Server/Client Components
- 🧰 **Supabase**: Kimlik doğrulama, Postgres, Realtime
- 🧩 **shadcn/ui** + **Tailwind CSS**
- 🌀 **Framer Motion** animasyonları
- 🔔 Gerçek zamanlı **request_count** artışı ve **proje listesi** senkronizasyonu
- 🔎 SEO meta & **JSON‑LD** yapılandırılmış veri

---

## 🧭 Proje Yapısı (özet)

```
stb-dashboard/
├── app/
│   ├── (auth)/                # login/register layout & pages
│   ├── dashboard/             # korumalı alan
│   │   ├── (overview)/page.tsx
│   │   ├── no-org/page.tsx
│   │   └── projects/create/page.tsx
│   ├── api/                   # route handlers (REST)
│   │   ├── test/route.ts
│   │   ├── projects/route.ts
│   │   └── projects/[id]/route.ts
│   ├── context/AuthContext.tsx
│   └── ui/                    # UI bileşenleri
│       ├── dashboard/
│       │   ├── projects-list.tsx
│       │   ├── request-count-card.tsx
│       │   └── test-button.tsx
│       ├── stb-logo.tsx
│       └── …
├── components/ui/             # Globe / WorldMap gibi bağımsız UI
├── public/                    # statik dosyalar (stb-logo.png vb.)
├── lib/                       # tipler, yardımcılar
│   ├── definitions.ts
│   └── utils.ts
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🚀 Hızlı Başlangıç

### 1) Gereksinimler
- **Node.js 18+**
- **pnpm** (önerilir) / yarn / npm
- Bir **Supabase** projesi (URL ve anon key)

### 2) Bağımlılıkları kur
```bash
pnpm install
```

### 3) Ortam değişkenlerini ayarla
Kök dizinde `.env.local` oluşturun:

```bash
# Supabase - Public
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# (Opsiyonel) Vercel için özel ayarlar ekleyebilirsiniz
```

### 4) Geliştirme
```bash
pnpm dev
# http://localhost:3000
```

### 5) Build ve çalıştırma
```bash
pnpm build
pnpm start
```

> Yerelde Turbopack ile build sırasında Windows’ta nadiren `.next/trace` dosyası izni hatası görülebilir. Terminali yönetici yetkisiyle açmak veya `.next` klasörünü silip tekrar denemek genelde yeterlidir.

---

## 🗄️ Supabase Kurulumu (özet)

- **Tablolar**
  - `organizations`: `{ id, owner_id, name, is_active, created_at }`
  - `projects`: `{ id, organization_id, name, is_active, created_at }`
  - `organization_usage`: `{ organization_id, period_start_at, period_end_at, request_count }`

- **RLS Policy (örnek mantık)**
  - `organizations`: owner_id = current_user için **SELECT/INSERT/UPDATE/DELETE**
  - `projects`: ilgili organizasyonun sahibi için **SELECT/INSERT/UPDATE/DELETE**
  - `organization_usage`: ilgili organizasyon için **SELECT/UPDATE**
  - **Realtime** için `organization_usage` ve `projects` tablolarında “Enable Realtime” aktif olmalı.

> Not: İlk “Send Test Request” sırasında `organization_usage` satırı yoksa **INSERT**; varsa **UPDATE** yapılır. Realtime açık değilse sayaç artışı anlık görünmez.

---

## 🔐 Kimlik Doğrulama Akışı

- `AuthContext` ilk yüklemede `supabase.auth.getUser()` ile session’ı okur.  
- Kullanıcı yoksa `/dashboard` altına gitmeye çalıştığında **/login**’e yönlendirilir.  
- Organizasyonu yoksa `/dashboard/no-org` sayfasına yönlendirilir.  
- Organizasyon oluşturulduğunda `refreshOrganization()` tetiklenir ve kullanıcı **/dashboard**’a döner.

---

## 📡 Realtime & UI

- `request-count-card.tsx` → `organization_usage` için **INSERT/UPDATE** event’lerini dinler.
- `projects-list.tsx` → `projects` için **INSERT/UPDATE/DELETE** event’lerini dinler.
- shadcn/ui ile bildirimler, buton durumları ve modern kart tasarımları.

---

## 🔎 SEO & JSON‑LD

**Önemli:** `app/page.tsx` bir **client component** ise `export const metadata` kullanılamaz.  
SEO meta ve JSON‑LD’yi **`app/layout.tsx`** içinde tanımlayın.

Örnek (kısaltılmış):
```tsx
// app/layout.tsx
export const metadata = {
  title: "STB Kurumsal Yönetim Paneli",
  description: "STB dijital dönüşüm platformu…",
  openGraph: { title: "STB Panel", url: "https://stb.example.com", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "STB Kurumsal Yönetim Paneli",
              operatingSystem: "Web",
              applicationCategory: "BusinessApplication",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🧹 Lint / Tip İpuçları

Vercel’de build’i **lint hatalarına takılmadan** geçirmek isterseniz:
```ts
// next.config.ts
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};
export default nextConfig;
```

Yerelde lint çalıştırmak için:
```bash
pnpm lint
```

---

## ☁️ Vercel Deploy

Kök dizine opsiyonel bir `vercel.json` ekleyebilirsiniz:
```json
{
  "version": 2,
  "builds": [{ "src": "next.config.ts", "use": "@vercel/next" }],
  "routes": [{ "src": "/(.*)", "dest": "/" }]
}
```

> `next.config.ts` kullanıyorsanız **ESM** uyarısını kaldırmak için `package.json` içine `"type": "module"` ekleyebilirsiniz.

Deploy:
```bash
vercel
```

---