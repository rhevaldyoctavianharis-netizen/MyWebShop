#  ____             _ __  __       _       _ _   
# / ___| ___   __ _| |  \/  | __ _(_)_ __ (_) |_ 
#| |  _ / _ \ / _` | | |\/| |/ _` | | '_ \| | __|
#| |_| | (_) | (_| | | |  | | (_| | | | | | | |_ 
# \____|\___/ \__,_|_|_|  |_|\__,_|_|_| |_|_|\__|

GoatXploit adalah marketplace produk digital berbasis Node.js + Express + Sequelize dengan sistem credit, deposit approval admin, dan delivery license key.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Stack
- Node.js 20 + Express (ESM)
- Sequelize + PostgreSQL (production) / SQLite (local)
- EJS SSR + Tailwind Play CDN
- Session auth + bcrypt

## Jalankan Lokal
1. `npm install`
2. `cp .env.example .env`
3. `npm run db:reset`
4. `npm run dev`

## Kredensial Admin Default
- Email: `admin@goatxploit.com`
- Password: `Admin123!`

> Ganti password admin segera setelah deploy.

## Struktur Singkat
- `app.js` - entry point
- `config/` - konfigurasi DB
- `models/`, `migrations/`, `seeders/` - ORM layer
- `controllers/`, `routes/`, `middleware/` - MVC backend
- `views/` - EJS templates
- `public/` - static asset
- `uploads/` - upload file

## Environment Variables
| Variable | Wajib | Keterangan |
|---|---|---|
| NODE_ENV | Ya | `development` / `production` |
| PORT | Tidak | Port aplikasi |
| SESSION_SECRET | Ya | Secret session |
| DATABASE_URL | Production | URL PostgreSQL Heroku |
| SQLITE_STORAGE | Local | Lokasi file SQLite |
| ADMIN_EMAIL | Ya | Seeder akun admin |
| ADMIN_PASSWORD | Ya | Password admin default |
| BANK_ACCOUNT | Ya | Instruksi transfer BCA |
| DANA_NUMBER | Ya | Instruksi transfer DANA |
| QRIS_IMAGE_URL | Tidak | URL gambar QRIS |

## Catatan Upload di Heroku
Filesystem Heroku bersifat ephemeral, sehingga file upload lokal bisa hilang saat dyno restart. Untuk production disarankan gunakan S3/Cloudinary. Alternatif MVP: simpan file sebagai base64 di database.
