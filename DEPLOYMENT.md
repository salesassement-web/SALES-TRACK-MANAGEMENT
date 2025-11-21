# Panduan Deployment ke Vercel

Aplikasi ini sudah siap untuk di-deploy ke **Vercel** agar bisa diakses oleh team dengan link.

## 📋 Persiapan

### 1. Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

### 2. Pastikan Aplikasi Berjalan Lokal
```bash
npm run dev
```
Test di http://localhost:3000 untuk memastikan semuanya bekerja.

---

## 🚀 Cara Deploy ke Vercel

### Metode 1: Deploy via Dashboard Vercel (RECOMMENDED - Paling Mudah)

#### Step 1: Buat Akun Vercel
1. Buka https://vercel.com
2. Sign up dengan akun GitHub (recommended) atau email
3. Verifikasi email Anda

#### Step 2: Push Code ke GitHub
Jika belum di GitHub, push project Anda:

```bash
# Inisialisasi git (jika belum)
git init
git add .
git commit -m "Initial commit - Sales Management Tracker"

# Buat repository di GitHub, lalu push
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

#### Step 3: Import Project ke Vercel
1. Login ke https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. Pilih **"Import Git Repository"**
4. Pilih repository `SalesManagemenTracker` Anda
5. Klik **"Import"**

#### Step 4: Konfigurasi Build Settings
Vercel akan otomatis detect Vite, tapi pastikan setting seperti ini:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 5: Deploy
1. Klik **"Deploy"**
2. Tunggu proses build selesai (~2-3 menit)
3. Setelah selesai, Anda akan mendapat **Production URL**

**Contoh URL:**
```
https://sales-management-tracker.vercel.app
```

---

### Metode 2: Deploy via Vercel CLI (Alternative)

```bash
# Login ke Vercel
vercel login

# Deploy
vercel

# Ikuti prompt:
# - Set up and deploy? [Y/n]: Y
# - Which scope? [pilih account Anda]
# - Link to existing project? [N]
# - What's your project's name? sales-management-tracker
# - In which directory is your code located? ./
# - Want to override the settings? [N]

# Setelah deploy berhasil, akan muncul URL production
```

---

## 🔗 Share Link dengan Team

Setelah deployment berhasil, Anda akan mendapat URL seperti:
```
https://sales-management-tracker-abc123.vercel.app
```

**Cara Share:**
1. Copy URL dari Vercel dashboard
2. Share ke team via WhatsApp, Slack, Email, dll
3. Team bisa langsung akses tanpa perlu install apapun

---

## ⚙️ Update Aplikasi (Re-deploy)

### Auto Deploy (Recommended)
Jika Anda deploy via GitHub:
1. Push perubahan ke GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
2. Vercel otomatis detect dan re-deploy!

### Manual Deploy via CLI
```bash
vercel --prod
```

---

## 🌐 Custom Domain (Opsional)

Jika Anda punya domain sendiri (contoh: `salestracker.yourdomain.com`):

1. Buka Vercel Dashboard → Project → **Settings** → **Domains**
2. Tambahkan domain Anda
3. Update DNS settings di domain provider
4. Tunggu DNS propagation (~24 jam max)

---

## 🔒 Environment Variables (Jika Diperlukan)

Jika aplikasi Anda memerlukan API keys atau secrets:

1. Buka Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Tambahkan variable yang diperlukan
3. Re-deploy aplikasi

**Note:** Aplikasi Sales Management Tracker saat ini tidak memerlukan env variables karena Google Apps Script URL sudah di-hardcode di `googleSheetService.ts`.

---

## 📊 Monitoring

Setelah deploy:
- **Analytics**: Dashboard Vercel menampilkan visitor stats
- **Logs**: Lihat runtime logs di **Deployments** → **Functions**
- **Build Logs**: Cek jika ada error saat build

---

## ❗ Troubleshooting

### Build Gagal
**Error**: `Command "npm run build" exited with 1`

**Solusi:**
1. Cek build error di Vercel logs
2. Test build lokal: `npm run build`
3. Fix error yang muncul
4. Push ke GitHub lagi

### Aplikasi Blank/White Screen
**Solusi:**
1. Pastikan base path benar di `vite.config.ts`
2. Cek browser console untuk error
3. Verifikasi all routes menggunakan `HashRouter` (bukan `BrowserRouter`)

### Google Sheets Tidak Terkoneksi
**Solusi:**
1. Pastikan Apps Script deployment "Who has access" = **Anyone**
2. Verifikasi GOOGLE_SCRIPT_URL di `googleSheetService.ts` sudah benar
3. Test API langsung dari browser console

---

## ✅ Checklist Deployment

- [ ] Code sudah di-push ke GitHub
- [ ] Project di-import ke Vercel
- [ ] Build berhasil (lihat dashboard)
- [ ] Production URL bisa diakses
- [ ] Test login di production URL
- [ ] Test fetch data dari Google Sheets
- [ ] Share URL dengan team
- [ ] Dokumentasikan URL untuk referensi

---

## 🎯 Next Steps

Setelah deployment berhasil:
1. **Test semua fitur** di production URL
2. **Share URL** dengan team
3. **Monitor usage** via Vercel analytics
4. **Setup auto-deploy** via GitHub integration untuk update otomatis

---

## 📞 Support

Jika ada masalah saat deployment:
- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
