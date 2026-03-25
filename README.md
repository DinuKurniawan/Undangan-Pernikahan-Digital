# Undangan Pernikahan Digital

Landing page undangan pernikahan digital sederhana berbasis HTML, CSS, dan TypeScript.

## Fitur

- Tampilan landing page undangan pernikahan
- Nama tamu otomatis dari URL
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

## Auto Generate Nama Tamu

Nama tamu akan tampil otomatis saat penerima membuka link undangan dengan query parameter.

Contoh:

```text
index.html?to=Budi%20Santoso
index.html?guest=Rina%20Maharani
index.html?nama=Andi%20Saputra
index.html?tamu=Siti%20Aisyah
```

Parameter yang didukung:

- `to`
- `guest`
- `nama`
- `tamu`
- `untuk`

Selain query parameter, nama tamu juga bisa dibaca dari hash URL dan slug path:

```text
https://undanganmu.vercel.app/#to=Budi%20Santoso
https://undanganmu.vercel.app/budi-santoso
```

## Deploy ke Vercel

Project ini sudah disiapkan untuk Vercel dengan file `vercel.json`.

Langkah deploy:

1. Push project ke GitHub
2. Import repository ke Vercel
3. Deploy project

Setelah deploy, Anda bisa langsung kirim link seperti:

```text
https://undanganmu.vercel.app/?to=Budi%20Santoso
https://undanganmu.vercel.app/budi-santoso
```

Format slug seperti `/budi-santoso` akan diarahkan ke `index.html`, lalu nama tamu dibaca otomatis oleh script.

## Struktur Proyek

```text
.
├── index.html
├── style.css
├── src
│   └── main.ts
├── dist
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

## Script

- `npm run build` - compile TypeScript ke folder `dist`
- `npm run watch` - compile TypeScript dalam mode watch
