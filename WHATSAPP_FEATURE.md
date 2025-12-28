# Fitur WhatsApp Link untuk Nomor HP

## Overview
Fitur ini menambahkan kemampuan untuk menghubungi pengantin langsung melalui WhatsApp dari halaman detail order. Nomor HP ditampilkan dengan label yang jelas dan dapat diklik untuk membuka WhatsApp.

## Fitur yang Ditambahkan

### 1. Komponen WhatsApp Link
- **File**: `components/ui/whatsapp-link.tsx`
- **Fungsi**: Menampilkan nomor HP dengan label dan tombol untuk membuka WhatsApp
- **Styling**: Tombol dengan background hijau muda dan ikon chat

### 2. Mapping Nomor HP
- **Primary Phone** (`primaryPhone`) = Nomor HP Pengantin Wanita
- **Secondary Phone** (`secondaryPhone`) = Nomor HP Pengantin Pria

### 3. Format Nomor WhatsApp
- Otomatis menghapus karakter non-digit
- Mengubah nomor yang dimulai dengan "0" menjadi "62" (kode negara Indonesia)
- Menambahkan "62" jika nomor tidak dimulai dengan kode negara

### 4. Pesan Default
- Pesan otomatis: "Halo, saya ingin menanyakan tentang pesanan wedding."
- Pesan dapat dikustomisasi sesuai kebutuhan

## Implementasi

### UI Components
- `components/ui/whatsapp-link.tsx` - Komponen utama WhatsApp link
- `app/orders/[orderId]/order-details-view.tsx` - Updated untuk menggunakan WhatsApp link

### Form Updates
- `app/clients/new/add-client-form.tsx` - Label diperbaiki untuk menunjukkan pengantin wanita/pria
- `app/clients/[clientId]/edit/edit-client-form.tsx` - Label diperbaiki untuk konsistensi

## Cara Penggunaan

1. Buka halaman detail order (`/orders/[orderId]`)
2. Di bagian "Detail Klien & Acara" → "Kontak Person"
3. Klik pada nomor HP yang ingin dihubungi
4. WhatsApp akan terbuka dengan nomor dan pesan yang sudah diformat

## Styling

### WhatsApp Link Button
```css
- Background: bg-green-50 hover:bg-green-100
- Border: border-green-200 hover:border-green-300
- Text: text-gray-800
- Icon: text-green-600 dengan animasi scale saat hover
- Label: text-gray-500 dengan font-medium
```

### Layout
- Setiap nomor HP ditampilkan dalam container terpisah
- Label di atas nomor HP untuk kejelasan
- Spacing yang konsisten antar elemen

## Format Nomor HP

### Input Format (Contoh)
- `081234567890`
- `+6281234567890`
- `6281234567890`
- `0812-3456-7890`

### Output Format untuk WhatsApp
- `6281234567890` (selalu dalam format internasional)

## Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile browsers: ✅ Full support

## Keamanan
- Nomor HP diformat di client-side
- Tidak ada data sensitif yang dikirim ke server
- WhatsApp link dibuka di tab/window baru

## Customization

### Mengubah Pesan Default
Edit di `components/ui/whatsapp-link.tsx`:
```typescript
const message = encodeURIComponent(`Pesan kustom Anda di sini`);
```

### Mengubah Styling
Edit className di komponen WhatsAppLink untuk menyesuaikan tampilan.

## Troubleshooting

### Jika WhatsApp tidak terbuka:
1. Pastikan WhatsApp terinstall di device
2. Check browser popup blocker settings
3. Pastikan nomor HP dalam format yang benar

### Jika nomor tidak terformat dengan benar:
1. Check input nomor HP di form client
2. Pastikan tidak ada karakter khusus yang tidak dihandle
3. Test dengan berbagai format nomor HP Indonesia