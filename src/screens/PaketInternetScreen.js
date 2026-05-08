// src/screens/PaketInternetScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getProductByCategory, beliProduk } from '../services/DigiflazzService';
import { saveTransaction } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const KATEGORI_PAKET = ['Semua', 'Harian', 'Mingguan', 'Bulanan', 'Gaming', 'Streaming'];

const DUMMY_PRODUCTS = [
  { buyer_sku_code: 'TSL-DATA-1D-1GB',  product_name: '1 GB / 1 Hari',    price: 7000,  category: 'Harian',   brand: 'Telkomsel', desc: 'Kuota internet 1GB masa aktif 1 hari' },
  { buyer_sku_code: 'TSL-DATA-7D-5GB',  product_name: '5 GB / 7 Hari',    price: 25000, category: 'Mingguan', brand: 'Telkomsel', desc: 'Kuota internet 5GB masa aktif 7 hari' },
  { buyer_sku_code: 'TSL-DATA-30D-10GB',product_name: '10 GB / 30 Hari',  price: 45000, category: 'Bulanan',  brand: 'Telkomsel', desc: 'Kuota internet 10GB masa aktif 30 hari' },
  { buyer_sku_code: 'TSL-DATA-30D-20GB',product_name: '20 GB / 30 Hari',  price: 80000, category: 'Bulanan',  brand: 'Telkomsel', desc: 'Kuota internet 20GB masa aktif 30 hari', popular: true },
  { buyer_sku_code: 'TSL-GAME-7D-10GB', product_name: '10 GB Gaming / 7H', price: 35000, category: 'Gaming',  brand: 'Telkomsel', desc: 'Khusus Mobile Legends, PUBG, Free Fire' },
  { buyer_sku_code: 'TSL-STR-30D-15GB', product_name: '15 GB Streaming',   price: 55000, category: 'Streaming',brand: 'Telkomsel', desc: 'Khusus YouTube, Netflix, TikTok' },
];

export default function PaketInternetScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [kategori, setKategori] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductByCategory('data');
      if (data && data.length > 0) setProducts(data);
    } catch {
      // pakai dummy data
    }
    setLoading(false);
  };

  const filteredProducts = kategori === 'Semua'
    ? products
    : products.filter(p => p.category === kategori);

  const handleBeli = async () => {
    if (!phone) return Alert.alert('Error', 'Masukkan nomor HP terlebih dahulu');
    if (!selectedProduct) return Alert.alert('Error', 'Pilih paket internet terlebih dahulu');

    Alert.alert(
      'Konfirmasi Pembelian',
      `${selectedProduct.product_name}\nUntuk: ${phone}\nHarga: Rp${selectedProduct.price?.toLocaleString('id-ID')}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bayar',
          onPress: async () => {
            setBuying(true);
            try {
              const result = await beliProduk({
                skuCode: selectedProduct.buyer_sku_code,
                customerNo: phone,
              });
              await saveTransaction({
                title: `Data ${selectedProduct.product_name}`,
                type: 'internet',
                icon: '🌐',
                number: phone,
                amount: selectedProduct.price,
                status: 'Sukses',
                detail: result,
              });
              navigation.navigate('MainTabs');
              Alert.alert('Berhasil! 🎉', 'Paket data sedang diproses');
            } catch {
              Alert.alert('Error', 'Transaksi gagal, coba lagi');
            }
            setBuying(false);
          },
        },
      ]
    );
  };

  const formatRupiah = (n) => `Rp${(n || 0).toLocaleString('id-ID')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#5B21B6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paket Internet</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Input Nomor */}
        <View style={styles.card}>
          <Text style={styles.label}>Nomor HP</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nomor HP"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={14}
          />
        </View>

        {/* Filter Kategori */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {KATEGORI_PAKET.map(k => (
            <TouchableOpacity
              key={k}
              style={[styles.filterChip, kategori === k && styles.filterChipActive]}
              onPress={() => { setKategori(k); setSelectedProduct(null); }}
            >
              <Text style={[styles.filterText, kategori === k && styles.filterTextActive]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daftar Produk */}
        {loading ? (
          <ActivityIndicator color="#7C3AED" style={{ marginTop: 40 }} />
        ) : (
          filteredProducts.map(p => (
            <TouchableOpacity
              key={p.buyer_sku_code}
              style={[styles.productCard, selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.productCardSelected]}
              onPress={() => setSelectedProduct(p)}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ Terpopuler</Text>
                </View>
              )}
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.product_name}</Text>
                  <Text style={styles.productDesc}>{p.desc || p.product_name}</Text>
                  <View style={[styles.catBadge, selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.catBadgeSelected]}>
                    <Text style={[styles.catText, selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.catTextSelected]}>
                      {p.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.productPrice}>{formatRupiah(p.price)}</Text>
                  {selectedProduct?.buyer_sku_code === p.buyer_sku_code && (
                    <View style={styles.checkIcon}>
                      <Text style={{ color: COLORS.white, fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Total & Tombol Beli */}
        {selectedProduct && (
          <View style={styles.bottomCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Total Bayar</Text>
              <Text style={styles.totalVal}>{formatRupiah(selectedProduct.price)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.btnBeli, (!phone || buying) && styles.btnDisabled]}
              onPress={handleBeli}
              disabled={!phone || buying}
            >
              {buying
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.btnBeliText}>Beli Sekarang</Text>
              }
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.lg,
  },
  backBtn: { padding: 8 },
  headerTitle: { color: COLORS.white, fontSize: 18, ...FONTS.bold },
  body: { flex: 1, padding: SPACING.base },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  label: { fontSize: 13, ...FONTS.semiBold, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...FONTS.medium, color: COLORS.text,
  },
  filterScroll: { marginBottom: SPACING.md },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white, marginRight: SPACING.sm,
  },
  filterChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 12, ...FONTS.medium, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },
  productCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.base, marginBottom: SPACING.sm, borderWidth: 1.5,
    borderColor: COLORS.border, ...SHADOW.sm,
  },
  productCardSelected: { borderColor: '#7C3AED', backgroundColor: '#F5F0FF' },
  popularBadge: {
    backgroundColor: '#FFB800', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full, marginBottom: SPACING.sm,
  },
  popularText: { color: COLORS.white, fontSize: 10, ...FONTS.bold },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, ...FONTS.bold, color: COLORS.text },
  productDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 4, marginBottom: 6 },
  catBadge: {
    alignSelf: 'flex-start', backgroundColor: '#EDE9FE',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  catBadgeSelected: { backgroundColor: '#7C3AED' },
  catText: { color: '#7C3AED', fontSize: 10, ...FONTS.semiBold },
  catTextSelected: { color: COLORS.white },
  priceBox: { alignItems: 'flex-end' },
  productPrice: { fontSize: 15, ...FONTS.bold, color: '#7C3AED' },
  checkIcon: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  bottomCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.base, marginTop: SPACING.md, ...SHADOW.md,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  detailKey: { fontSize: 15, ...FONTS.semiBold, color: COLORS.text },
  totalVal: { fontSize: 18, ...FONTS.bold, color: '#7C3AED' },
  btnBeli: {
    backgroundColor: '#7C3AED', borderRadius: RADIUS.xl,
    padding: SPACING.md, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: COLORS.gray300 },
  btnBeliText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
});
