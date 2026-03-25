# Undangan Pernikahan Digital

Landing page undangan pernikahan digital sederhana berbasis HTML, CSS, dan TypeScript.

## Fitur

- Tampilan landing page undangan pernikahan
- Nama tamu otomatis dari URL
- Countdown menuju hari acara
- Form ucapan dan konfirmasi kehadiran
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
└── tsconfig.json
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
