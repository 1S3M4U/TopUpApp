// src/services/TripayService.js
import axios from 'axios';
import md5 from 'md5';

// ⚠️ Ganti dengan kredensial Tripay Anda
const API_KEY = 'YOUR_TRIPAY_API_KEY';
const PRIVATE_KEY = 'YOUR_TRIPAY_PRIVATE_KEY';
const MERCHANT_CODE = 'YOUR_MERCHANT_CODE';

const IS_SANDBOX = true; // set false saat production
const BASE_URL = IS_SANDBOX
  ? 'https://tripay.co.id/api-sandbox'
  : 'https://tripay.co.id/api';

const axiosTripay = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${API_KEY}` },
});

// ─── DAFTAR CHANNEL PEMBAYARAN ────────────────────────────────
export const getPaymentChannels = async () => {
  const { data } = await axiosTripay.get('/merchant/payment-channel');
  return data.data;
};

// ─── BUAT TRANSAKSI PEMBAYARAN ────────────────────────────────
export const createTransaction = async ({
  method,           // kode metode: BRIVA, BNIVA, MANDIRIVA, QRIS, dll
  merchantRef,      // nomor order unik dari merchant
  amount,           // jumlah pembayaran
  customerName,
  customerEmail,
  customerPhone,
  orderItems,       // array: [{name, price, quantity}]
  returnUrl = '',
  expiredTime,      // unix timestamp (opsional)
}) => {
  const signature = md5(`${MERCHANT_CODE}${merchantRef}${amount}${PRIVATE_KEY}`);
  const expiry = expiredTime || Math.floor(Date.now() / 1000) + 60 * 60; // 1 jam

  const payload = {
    method,
    merchant_ref: merchantRef,
    amount,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    order_items: orderItems,
    callback_url: '',
    return_url: returnUrl,
    expired_time: expiry,
    signature,
  };

  const { data } = await axiosTripay.post('/transaction/create', payload);
  return data.data;
};

// ─── CEK STATUS PEMBAYARAN ────────────────────────────────────
export const getTransactionDetail = async (reference) => {
  const { data } = await axiosTripay.get('/transaction/detail', {
    params: { reference },
  });
  return data.data;
};

export default {
  getPaymentChannels,
  createTransaction,
  getTransactionDetail,
};
