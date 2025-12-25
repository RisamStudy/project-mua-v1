# Perbaikan Invoice PDF untuk Safari & Chrome

## Masalah yang Diperbaiki

1. **CSS Transform Issues**: Safari memiliki masalah dengan CSS transforms yang kompleks saat printing
2. **Z-index Conflicts**: Z-index yang tinggi menyebabkan masalah rendering di Safari
3. **Print Color Adjustment**: Safari tidak menampilkan warna dengan benar saat print
4. **Layout Inconsistency**: Layout yang tidak konsisten antara preview dan print
5. **Flexbox Print Issues**: Safari memiliki masalah dengan flexbox saat printing
6. **Table Rendering**: Safari tidak merender tabel dengan baik dalam mode print
7. **Filename Generation**: Nama file PDF sekarang otomatis berdasarkan nama pengantin
8. **Chrome Sidebar Issue**: Menu sidebar muncul di print preview Chrome dan menghalangi invoice
9. **Right Sidebar in Print**: Pengaturan Faktur, Riwayat Pembayaran, dan Catatan ikut masuk ke PDF
10. **cPanel/Production Issues**: Menu masih muncul di Chrome saat deploy ke cPanel

## Solusi yang Diterapkan

### 1. Browser Detection & Handling
- Mendeteksi browser Safari dan Chrome secara otomatis
- Menerapkan handling khusus untuk masing-masing browser saat print
- Error handling yang lebih robust dengan fallback

### 2. Comprehensive Sidebar Hiding
- Menyembunyikan SEMUA elemen sidebar dan navigasi saat print
- Menambahkan class `print:hidden` pada sidebar kanan
- Targeting elemen berdasarkan class, ID, dan attribute patterns
- Menyembunyikan elemen dengan berbagai lebar (w-64, w-60, w-56, dll)
- Menangani modal, overlay, dan backdrop

### 3. CSS Optimizations
- Menghapus semua CSS transforms yang bermasalah saat print
- Menyederhanakan z-index dan positioning
- Menambahkan `-webkit-print-color-adjust: exact` untuk warna yang akurat
- Perbaikan khusus untuk flexbox dan grid layouts di Safari
- Table layout fixes untuk Safari
- Reset grid layouts menjadi block untuk print

### 4. Print-Specific Styles
- CSS khusus untuk media print dengan @page settings
- Optimasi untuk Safari dengan `@supports (-webkit-appearance: none)`
- Chrome-specific fixes yang lebih agresif
- Cleanup otomatis setelah print selesai
- Backface-visibility fixes untuk Safari

### 5. Enhanced Element Targeting
- Targeting berdasarkan class patterns: `[class*="sidebar"]`, `[class*="fixed"]`
- Targeting berdasarkan ID patterns: `[id*="menu"]`, `[id*="nav"]`
- Targeting berdasarkan role attributes: `[role="dialog"]`, `[role="menu"]`
- Targeting elemen dengan lebar tetap: `[class*="w-64"]` hingga `[class*="w-48"]`

### 6. Filename Generation
- Nama file PDF otomatis berdasarkan `groomName` dan `brideName` dari database
- Format: `Invoice_[GroomName]_[BrideName]_[InvoiceNumber]`
- Karakter khusus dibersihkan untuk kompatibilitas file system
- Document title diubah sementara untuk browser filename suggestion

### 7. Enhanced Error Handling
- Multiple fallback attempts untuk Safari
- Alert yang lebih informatif untuk user
- Graceful degradation jika print gagal

## Cara Penggunaan

1. Buka halaman invoice preview
2. Klik tombol "Generate & Download PDF"
3. Jika menggunakan Safari, akan muncul indikator "(Safari)" di button
4. Browser akan otomatis menggunakan optimasi khusus sesuai jenisnya
5. SEMUA sidebar (kiri dan kanan) akan disembunyikan saat print
6. Hanya konten invoice yang akan muncul di PDF
7. File PDF akan tersimpan dengan nama berdasarkan nama pengantin

## Contoh Nama File

- Jika groomName: "Ahmad Rizki" dan brideName: "Siti Nurhaliza"
- Invoice number: "INV-2025-001"
- Nama file: `Invoice_AhmadRizki_SitiNurhaliza_INV-2025-001.pdf`

## Browser-Specific Fixes

### Safari
- CSS transform removal
- Backface-visibility fixes
- Flexbox to table conversion for print
- Color adjustment preservation
- Table layout optimization

### Chrome (Local & cPanel)
- Comprehensive sidebar hiding during print
- Grid layout reset for print
- Navigation element removal
- Full-width content adjustment
- Aggressive element targeting untuk production environment

### Other Browsers
- Standard print handling
- Basic sidebar hiding
- Filename setting

## Elements yang Disembunyikan saat Print

### Left Sidebar
- `aside`, `nav`, `.sidebar`
- Elements dengan class pattern `[class*="sidebar"]`
- Elements dengan class pattern `[class*="fixed"]`
- Elements dengan ID pattern `[id*="menu"]`, `[id*="nav"]`

### Right Sidebar
- `.space-y-6` (container sidebar kanan)
- `.lg:col-span-1` (grid column untuk sidebar)
- Semua child elements di dalamnya

### Navigation & Menu
- Elements dengan class pattern `[class*="menu"]`
- Elements dengan class pattern `[class*="navigation"]`
- Elements dengan role `[role="dialog"]`, `[role="menu"]`
- Modal, overlay, backdrop elements

### Width-based Elements
- Elements dengan class `[class*="w-64"]` hingga `[class*="w-48"]`
- Fixed width sidebars

## Testing

Untuk memastikan perbaikan bekerja:
1. Test di Safari (desktop dan mobile) - pastikan layout tidak berantakan
2. Test di Chrome local - pastikan sidebar tidak muncul di print preview
3. Test di Chrome production (cPanel) - pastikan menu tidak menghalangi
4. Test di Firefox untuk memastikan tidak ada regresi
5. Periksa hasil print preview sebelum mencetak
6. Pastikan hanya invoice yang muncul, tanpa sidebar kanan
7. Verifikasi nama file sesuai dengan nama pengantin
8. Test dengan nama yang mengandung karakter khusus

## Catatan Teknis

- Perbaikan menggunakan feature detection, bukan user agent sniffing
- Fallback ke method standard untuk browser lain
- Temporary styles dihapus otomatis setelah print
- Sidebar elements dikembalikan ke state semula setelah print
- Kompatibel dengan responsive design yang ada
- Document title dikembalikan ke semula setelah print
- Filename cleaning menghapus karakter non-alphanumeric untuk keamanan
- Menggunakan multiple selector patterns untuk coverage maksimal

## Troubleshooting

Jika masih ada masalah:

### Safari
1. Refresh halaman dan coba lagi
2. Pastikan Safari versi terbaru
3. Coba disable extensions Safari yang mungkin mengganggu
4. Gunakan mode private/incognito jika perlu

### Chrome (Local)
1. Pastikan tidak ada extensions yang mengganggu print
2. Coba refresh halaman jika sidebar masih muncul
3. Periksa print preview sebelum mencetak

### Chrome (cPanel/Production)
1. Clear browser cache dan cookies
2. Coba hard refresh (Ctrl+F5 atau Cmd+Shift+R)
3. Periksa apakah ada custom CSS dari hosting yang mengganggu
4. Test di incognito mode untuk menghindari extension interference

### Semua Browser
1. Sebagai alternatif, gunakan browser lain jika masalah persisten
2. Pastikan JavaScript enabled
3. Coba clear cache browser
4. Pastikan tidak ada ad blockers yang mengganggu