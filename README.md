# 📱 TopupApp — Aplikasi Pulsa, Data, E-Wallet & Token PLN

Aplikasi React Native untuk mengisi pulsa, paket internet, top-up e-wallet, dan pembelian token PLN menggunakan API Digiflazz dan payment gateway Tripay.

---

## 🗂 Struktur Proyek

```
TopupApp/
├── App.js                          # Entry point
├── package.json                    # Dependencies
└── src/
    ├── navigation/
    │   └── AppNavigator.js         # Stack + Bottom Tab Navigator
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard utama
    │   ├── PulsaScreen.js          # Beli pulsa
    │   ├── PaketInternetScreen.js  # Beli paket data
    │   ├── EWalletScreen.js        # Top-up e-wallet
    │   ├── TokenPLNScreen.js       # Beli token PLN
    │   ├── RiwayatScreen.js        # Riwayat transaksi
    │   ├── ProfilScreen.js         # Profil pengguna
    │   └── PaymentScreen.js        # Pilih metode pembayaran (Tripay)
    ├── services/
    │   ├── DigiflazzService.js     # Integrasi API Digiflazz
    │   ├── TripayService.js        # Integrasi Tripay payment gateway
    │   └── StorageService.js       # AsyncStorage (riwayat, profil, favorit)
    └── theme/
        └── index.js                # Warna, font, spacing, shadow
```

---

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
cd TopupApp
npm install
```

### 2. Install pods (iOS)
```bash
cd ios && pod install && cd ..
```

### 3. Jalankan aplikasi
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## 🔑 Konfigurasi API

### Digiflazz
Edit file `src/services/DigiflazzService.js`:
```js
const USERNAME = 'username_digiflazz_anda';
const API_KEY_DEV = 'api_key_sandbox';
const API_KEY_PROD = 'api_key_production';
const IS_PRODUCTION = false; // ubah ke true saat go-live
```

> Daftar di: https://digiflazz.com

### Tripay (Payment Gateway)
Edit file `src/services/TripayService.js`:
```js
const API_KEY = 'api_key_tripay_anda';
const PRIVATE_KEY = 'private_key_anda';
const MERCHANT_CODE = 'kode_merchant_anda';
const IS_SANDBOX = true; // ubah ke false saat production
```

> Daftar di: https://tripay.co.id

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 📱 Pulsa | Beli pulsa semua operator (Telkomsel, XL, Indosat, Tri, Smartfren) |
| 🌐 Paket Data | Filter berdasar kategori: Harian, Mingguan, Bulanan, Gaming, Streaming |
| 💳 E-Wallet | Top-up GoPay, OVO, DANA, ShopeePay, LinkAja, Jenius |
| ⚡ Token PLN | Cek info pelanggan, pilih nominal, dapatkan kode token |
| 📋 Riwayat | Lihat semua transaksi, filter per kategori, tampilkan detail |
| 👤 Profil | Edit nama & nomor HP, lihat statistik, cek saldo |
| 💳 Payment | Pilih VA (BRI/BCA/Mandiri), QRIS, e-wallet, gerai ritel via Tripay |

---

## 📦 Dependencies Utama

| Package | Kegunaan |
|---------|----------|
| `@react-navigation/native` | Navigasi antar screen |
| `@react-navigation/bottom-tabs` | Bottom tab navigator |
| `@react-navigation/stack` | Stack navigator |
| `axios` | HTTP request ke API |
| `react-native-linear-gradient` | Gradient UI |
| `@react-native-async-storage/async-storage` | Penyimpanan lokal |
| `react-native-toast-message` | Notifikasi toast |
| `md5` | Pembuatan signature Digiflazz & Tripay |

---

## 🔐 Keamanan

- Jangan simpan API key di kode production. Gunakan environment variables atau secret management.
- Gunakan `.env` dengan library `react-native-config` untuk menyimpan kredensial.
- Validasi semua input user sebelum dikirim ke API.
- Implementasikan PIN / biometrik untuk konfirmasi transaksi (opsional, bisa ditambahkan di ProfilScreen).

---

## 📝 Pengembangan Lanjutan

- [ ] Tambah autentikasi (login / register)
- [ ] Notifikasi push (FCM)
- [ ] Tambah biometrik / PIN transaksi
- [ ] Halaman promo & voucher
- [ ] Integrasi deep link untuk pembayaran QRIS
- [ ] Dark mode
- [ ] Multi-bahasa (i18n)
