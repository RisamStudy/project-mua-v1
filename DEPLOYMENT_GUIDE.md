# Panduan Deployment ke cPanel

## Persiapan Sebelum Deploy

### 1. Setup Environment Variables
Buat file `.env.local` di root project dengan konfigurasi database cPanel:

```env
# Database Configuration (sesuaikan dengan cPanel MySQL)
DATABASE_URL="mysql://cpanel_user:password@localhost:3306/cpanel_database_name"

# Next.js Configuration
NEXTAUTH_SECRET="your-very-secure-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"
```

### 2. Update Database Configuration
Pastikan database MySQL di cPanel sudah dibuat dan user memiliki akses penuh.

### 3. Run Database Migration
```bash
npx prisma generate
npx prisma db push
```

## Langkah Deployment

### 1. Build Project
```bash
npm run build
```

### 2. Upload Files ke cPanel
Upload folder berikut ke public_html (atau subdirectory):
- `.next/` (hasil build)
- `public/`
- `prisma/`
- `package.json`
- `next.config.js`
- `.env.local` (dengan konfigurasi production)

### 3. Install Dependencies di cPanel
Jika cPanel mendukung Node.js:
```bash
npm install --production
```

### 4. Setup Node.js App di cPanel
- Pilih Node.js version 18+ 
- Set startup file: `server.js`
- Set document root ke folder aplikasi

## Checklist Deployment

- [ ] Database MySQL sudah dibuat di cPanel
- [ ] File `.env.local` sudah dikonfigurasi dengan benar
- [ ] Build berhasil tanpa error
- [ ] Semua file sudah diupload
- [ ] Dependencies sudah terinstall
- [ ] Node.js app sudah dikonfigurasi

## Troubleshooting

### Error: DATABASE_URL not found
- Pastikan file `.env.local` ada di root directory
- Periksa format connection string MySQL

### Error: Dynamic Server Usage
- Sudah diperbaiki dengan menambahkan `export const dynamic = 'force-dynamic'`

### Error: Prisma Client
- Jalankan `npx prisma generate` setelah upload

## Alternatif: Static Export (Jika cPanel tidak support Node.js)

Jika cPanel hanya mendukung static hosting, ubah `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

Kemudian build dengan:
```bash
npm run build
```

Upload folder `out/` ke public_html.

**Catatan**: Static export tidak mendukung API routes, jadi fitur login/database tidak akan berfungsi.