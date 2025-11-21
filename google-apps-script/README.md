# CARA SETUP GOOGLE APPS SCRIPT

## Langkah 1: Buka Apps Script Editor
1. Buka spreadsheet Anda: https://docs.google.com/spreadsheets/d/1hvpLdDk9AwWK5AZcL6Tuo3RnOzZgqhmuzOjBN6pZRko/edit
2. Klik menu **Extensions** → **Apps Script**
3. Akan terbuka editor Apps Script di tab baru

## Langkah 2: Copy Code
1. Hapus semua code default yang ada di editor
2. Copy semua isi file `Code.gs` yang sudah dibuat
3. Paste ke editor Apps Script
4. Klik **Save** (ikon disket) atau tekan `Ctrl+S`

## Langkah 3: Run Setup Awal (Opsional - untuk membuat struktur sheet)
1. Di dropdown function (sebelah tombol Run), pilih **setupInitialData**
2. Klik tombol **Run** (▶️)
3. Akan muncul popup authorization - klik **Review Permissions**
4. Pilih akun Google Anda
5. Klik **Advanced** → **Go to [project name] (unsafe)**
6. Klik **Allow**
7. Tunggu sampai selesai (cek Execution log di bawah)

**Fungsi setupInitialData akan:**
- Membuat 5 sheet: Users, Sales, Evaluations, Tasks, Principles
- Menambahkan header di setiap sheet
- Mengisi data principles default

## Langkah 4: Deploy sebagai Web App
1. Klik **Deploy** → **New deployment**
2. Klik ⚙️ (Settings) di sebelah "Select type"
3. Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: Sales Management Tracker API
   - **Execute as**: Me (email Anda)
   - **Who has access**: Anyone
5. Klik **Deploy**
6. **PENTING**: Copy **Web app URL** yang muncul
   - Format: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

## Langkah 5: Update Frontend Code
1. Buka file `src/services/googleSheetService.ts`
2. Paste URL deployment yang sudah di-copy ke `GOOGLE_SCRIPT_URL`
3. Save file

## Langkah 6: Test Integrasi
1. Jalankan aplikasi: `npm run dev`
2. Buka browser dan cek console untuk melihat data fetch
3. Coba buat evaluation atau task baru
4. Cek spreadsheet apakah data tersimpan

---

## Troubleshooting

### Error: "Authorization required"
- Pastikan sudah run function setupInitialData minimal sekali untuk authorize script

### Error: "CORS"
- Pastikan deployment setting "Who has access" adalah **Anyone**
- Re-deploy jika perlu

### Data tidak muncul
- Cek console browser untuk error message
- Verifikasi URL deployment sudah benar
- Pastikan sheet names sesuai (Users, Sales, Evaluations, Tasks, Principles)

### Data tidak tersimpan
- Cek Execution log di Apps Script untuk melihat error
- Pastikan format data yang dikirim sesuai dengan yang diharapkan
