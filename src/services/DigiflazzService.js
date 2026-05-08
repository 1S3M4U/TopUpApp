// src/services/DigiflazzService.js
import axios from 'axios';
import md5 from 'md5';

const BASE_URL = 'https://api.digiflazz.com/v1';

// ⚠️ Ganti dengan kredensial Digiflazz Anda
const USERNAME = 'YOUR_DIGIFLAZZ_USERNAME';
const API_KEY_DEV = 'YOUR_DEV_API_KEY';   // untuk sandbox/testing
const API_KEY_PROD = 'YOUR_PROD_API_KEY'; // untuk production

const IS_PRODUCTION = false; // set true saat production
const API_KEY = IS_PRODUCTION ? API_KEY_PROD : API_KEY_DEV;

// Helper buat signature MD5
const generateSignature = (refId, type = 'topup') => {
  const key = `${USERNAME}${API_KEY}${refId}`;
  return md5(key);
};

// Helper buat ref_id unik
const generateRefId = () => {
  return `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// ─── CEK SALDO ────────────────────────────────────────────────
export const cekSaldo = async () => {
  const sign = md5(`${USERNAME}${API_KEY}depo`);
  const { data } = await axios.post(`${BASE_URL}/cek-saldo`, {
    cmd: 'deposit',
    username: USERNAME,
    sign,
  });
  return data.data;
};

// ─── DAFTAR PRODUK ────────────────────────────────────────────
export const getDaftarProduk = async () => {
  const sign = md5(`${USERNAME}${API_KEY}pricelist`);
  const { data } = await axios.post(`${BASE_URL}/price-list`, {
    cmd: 'prepaid',
    username: USERNAME,
    sign,
  });
  return data.data;
};

// ─── FILTER PRODUK BERDASAR KATEGORI ─────────────────────────
export const getProductByCategory = async (category) => {
  const allProducts = await getDaftarProduk();
  return allProducts.filter(p =>
    p.category.toLowerCase().includes(category.toLowerCase())
  );
};

// ─── TRANSAKSI TOP-UP / BELI PRODUK ───────────────────────────
export const beliProduk = async ({ skuCode, customerNo, refId = generateRefId() }) => {
  const sign = generateSignature(refId);
  const { data } = await axios.post(`${BASE_URL}/transaction`, {
    username: USERNAME,
    buyer_sku_code: skuCode,
    customer_no: customerNo,
    ref_id: refId,
    sign,
    testing: !IS_PRODUCTION,
  });
  return data.data;
};

// ─── CEK STATUS TRANSAKSI ─────────────────────────────────────
export const cekStatusTransaksi = async (refId) => {
  const sign = md5(`${USERNAME}${API_KEY}${refId}`);
  const { data } = await axios.post(`${BASE_URL}/transaction`, {
    commands: 'inq-pasca',
    username: USERNAME,
    ref_id: refId,
    sign,
  });
  return data.data;
};

// ─── INQUIRY TOKEN PLN ────────────────────────────────────────
export const inquiryTokenPLN = async (nomorMeter) => {
  const refId = generateRefId();
  const sign = md5(`${USERNAME}${API_KEY}${refId}`);
  const { data } = await axios.post(`${BASE_URL}/transaction`, {
    commands: 'inq-pasca',
    username: USERNAME,
    customer_no: nomorMeter,
    buyer_sku_code: 'PLN',
    ref_id: refId,
    sign,
    testing: !IS_PRODUCTION,
  });
  return { ...data.data, ref_id: refId };
};

export default {
  cekSaldo,
  getDaftarProduk,
  getProductByCategory,
  beliProduk,
  cekStatusTransaksi,
  inquiryTokenPLN,
  generateRefId,
};
