# 🔐 Login Credentials - Sales Management Tracker

## Data telah di-update dengan Principles REAL dari Google Sheets Anda!

---

## 👤 **SUPERVISOR LOGIN**

Gunakan credentials berikut untuk testing:

### 1️⃣ **Supervisor ATC - FFI**
- **Role:** SUPERVISOR
- **Principle:** ATC - FFI
- **Name:** SUPERVISOR ATC-FFI
- **User ID:** U6
- **Tasks:** 3 tasks (T1, T3, T4)

### 2️⃣ **Supervisor BELLFOODS**
- **Role:** SUPERVISOR
- **Principle:** BELLFOODS
- **Name:** SUPERVISOR BELLFOODS
- **User ID:** U7
- **Tasks:** 2 tasks (T2, T5)

### 3️⃣ **Supervisor DUA KELINCI**
- **Role:** SUPERVISOR
- **Principle:** DUA KELINCI
- **Name:** SUPERVISOR DUA KELINCI
- **User ID:** U8
- **Tasks:** 3 tasks (T6, T7, T8)

### 4️⃣ **Supervisor FFI - BINJAI**
- **Role:** SUPERVISOR
- **Principle:** FFI - BINJAI
- **Name:** SUPERVISOR FFI-BINJAI
- **User ID:** U9
- **Tasks:** 1 task (T9)

### 5️⃣ **Supervisor FFI**
- **Role:** SUPERVISOR
- **Principle:** FFI
- **Name:** SUPERVISOR FFI
- **User ID:** U10
- **Tasks:** 2 tasks (T11, T14)

### 6️⃣ **Supervisor KALBE**
- **Role:** SUPERVISOR
- **Principle:** KALBE
- **Name:** SUPERVISOR KALBE
- **User ID:** U11
- **Tasks:** 2 tasks (T12, T13)

---

## 👨‍💼 **ADMIN LOGIN**

- **Role:** ADMIN
- **Principle:** ALL SANCHO
- **Name:** (tidak perlu)

---

## 💡 **CARA LOGIN:**

1. Buka **http://localhost:3000/**
2. Pilih **Role:** SUPERVISOR
3. Pilih **Principle:** (pilih salah satu dari 7 principles)
4. Pilih **Name:** (akan muncul nama supervisor otomatis)
5. Klik **Login**

---

## 📊 **PRINCIPLES YANG TERSEDIA:**

1. **ATC - FFI**
2. **BELLFOODS**
3. **DUA KELINCI**
4. **FFI - BINJAI**
5. **FFI**
6. **KALBE**
7. **KENVEU**
8. ALL SANCHO (admin)
9. ALL PRINCIPLE (HRD/Kasir)

---

## ✅ **DATA YANG SUDAH ADA:**

### **Total 14 Tasks:**

| ID | Supervisor | Principle | Title | Status |
|----|-----------|-----------|-------|--------|
| T1 | U6 | ATC - FFI | Visit Toko A | OPEN |
| T2 | U7 | BELLFOODS | Meeting Sales | PENDING |
| T3 | U6 | ATC - FFI | Audit Stock | ONGOING |
| T4 | U6 | ATC - FFI | Visit Distributor | OPEN |
| T5 | U7 | BELLFOODS | Roadshow | COMPLETED ✓ |
| T6 | U8 | DUA KELINCI | Report Penjualan Q4 | OPEN |
| T7 | U8 | DUA KELINCI | Customer Visit - PT XYZ | OPEN |
| T8 | U8 | DUA KELINCI | Visit Toko A | OPEN |
| T9 | U9 | FFI - BINJAI | Meeting Team | PENDING |
| T10 | U9 | FFI | Follow Up Client | COMPLETED ✓ |
| T11 | U10 | FFI | Training Produk Baru | OPEN |
| T12 | U11 | FFI | Visit ACE Hardware | COMPLETED ✓ |
| T13 | U11 | KALBE | Report Penjualan Q4 | OPEN |
| T14 | U10 | KENVEU | Customer Visit - PT XYZ | OPEN |

---

## 🎯 **TESTING FLOW:**

1. **Login sebagai Supervisor ATC-FFI (U6)**
   - Akan melihat 3 tasks di My Tasks
   - Buat task baru → principle otomatis "ATC - FFI"

2. **Login sebagai Admin**
   - Buka "Tasks All"
   - Lihat semua 14 tasks dari semua principle
   - Grafik akan menampilkan data per principle

3. **Create New Task**
   - Klik "Create Task"
   - Principle otomatis terisi dari login
   - Submit untuk tambah task baru

---

## 📝 **NOTES:**

- ✅ Principle otomatis terisi dari user yang login
- ✅ Data sudah match dengan Google Sheets Anda
- ✅ Grafik akan grouping berdasarkan principle real
- ✅ Filter berfungsi normal

**Refresh browser untuk melihat perubahan!** 🔄
