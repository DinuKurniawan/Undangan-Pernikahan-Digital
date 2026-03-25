# Undangan Pernikahan Digital

Landing page undangan pernikahan digital sederhana berbasis HTML, CSS, dan TypeScript.

## Fitur

- Tampilan landing page undangan pernikahan
- Nama tamu otomatis dari token invite aman
- Backend Vercel untuk verifikasi link tamu
- Halaman admin terpisah untuk membuat link undangan
- Countdown menuju hari acara
- Responsive untuk mobile dan desktop

## Cara Menjalankan

Pastikan dependency sudah terpasang:

```bash
npm install
```

Build TypeScript:

```bash
npm run build
```

Setelah itu buka file `index.html` di browser.

## Sistem Link Aman

Sekarang nama tamu **tidak lagi** dibaca langsung dari URL publik seperti `?to=...`.

Link undangan dibuat oleh backend dengan token aman:

```text
https://undanganmu.vercel.app/?invite=TOKEN_UNIK
```

Halaman publik akan memanggil backend `/api/guest` untuk memverifikasi token tersebut.

Keuntungannya:

- tamu tidak bisa membuat nama tamu lain hanya dengan mengganti URL
- hanya admin yang bisa membuat link
- link publik tetap sederhana untuk dibagikan

## Halaman Admin

Halaman admin tersedia di:

```text
https://undanganmu.vercel.app/admin.html
```

Admin memakai `ADMIN_KEY` untuk membuat link undangan aman per tamu.

## Deploy ke Vercel

Project ini sudah disiapkan untuk Vercel dengan file `vercel.json`.

Langkah deploy:

1. Push project ke GitHub
2. Import repository ke Vercel
3. Deploy project

Setelah project terhubung ke Vercel, tambahkan Environment Variables berikut:

```text
ADMIN_KEY=isi-password-admin-anda
INVITE_SECRET=isi-rahasia-random-panjang-anda
```

Lalu redeploy project.

Setelah itu:

1. buka `https://undanganmu.vercel.app/admin.html`
2. masukkan `ADMIN_KEY`
3. masukkan nama tamu
4. salin link hasil generate

Contoh hasil link:

```text
https://undanganmu.vercel.app/?invite=eyJ...
```

## Struktur Proyek

```text
.
├── admin.html
├── api
│   ├── create-invite.js
│   ├── guest.js
│   └── _lib
│       └── invite.js
├── index.html
├── style.css
├── src
│   ├── admin.ts
│   └── main.ts
├── dist
│   ├── admin.js
│   └── main.js
├── package.json
├── tsconfig.json
└── vercel.json
```

## Kustomisasi

Ubah konten berikut sesuai kebutuhan:

- Nama mempelai di `index.html`
- Tanggal dan lokasi acara di `index.html`
- Styling tema di `style.css`
- Logika interaktif di `src/main.ts`
- Logika admin di `src/admin.ts`
- Validasi token di `api/_lib/invite.js`

## Script

- `npm run build` - compile TypeScript ke folder `dist`
- `npm run watch` - compile TypeScript dalam mode watch
