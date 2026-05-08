// src/screens/PulsaScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getProductByCategory, beliProduk } from '../services/DigiflazzService';
import { saveTransaction } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const OPERATORS = [
  { id: 'telkomsel', name: 'Telkomsel', prefix: ['0811','0812','0813','0821','0822','0823','0852','0853','0851'] },
  { id: 'xl',        name: 'XL',        prefix: ['0817','0818','0819','0859','0877','0878'] },
  { id: 'indosat',   name: 'Indosat',   prefix: ['0814','0815','0816','0855','0856','0857','0858'] },
  { id: 'three',     name: 'Tri',       prefix: ['0895','0896','0897','0898','0899'] },
  { id: 'smartfren', name: 'Smartfren', prefix: ['0881','0882','0883','0884','0885','0886','0887','0888','0889'] },
];

const detectOperator = (phone) => {
  const prefix3 = phone.slice(0, 4);
  const prefix4 = phone.slice(0, 5);
  for (const op of OPERATORS) {
    if (op.prefix.some(p => phone.startsWith(p.slice(1)) || phone.startsWith(p))) return op;
  }
  return null;
};

export default function PulsaScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (phone.length >= 4) {
      const op = detectOperator(phone);
      setOperator(op);
      if (op) loadProducts(op.id);
    } else {
      setOperator(null);
      setProducts([]);
      setSelectedProduct(null);
    }
  }, [phone]);

  const loadProducts = async (opId) => {
    setLoading(true);
    try {
      const all = await getProductByCategory('pulsa');
      const filtered = all.filter(p =>
        p.brand?.toLowerCase().includes(opId) ||
        p.category?.toLowerCase().includes('pulsa')
      );
      setProducts(filtered);
    } catch {
      // fallback produk dummy untuk demo
      setProducts([
        { buyer_sku_code: 'TSL5', product_name: 'Pulsa 5.000',   price: 6500,  seller_name: 'Telkomsel' },
        { buyer_sku_code: 'TSL10', product_name: 'Pulsa 10.000', price: 11500, seller_name: 'Telkomsel' },
        { buyer_sku_code: 'TSL20', product_name: 'Pulsa 20.000', price: 21500, seller_name: 'Telkomsel' },
        { buyer_sku_code: 'TSL50', product_name: 'Pulsa 50.000', price: 52000, seller_name: 'Telkomsel' },
        { buyer_sku_code: 'TSL100', product_name: 'Pulsa 100.000', price: 102000, seller_name: 'Telkomsel' },
      ]);
    }
    setLoading(false);
  };

  const handleBeli = async () => {
    if (!phone) return Alert.alert('Error', 'Masukkan nomor HP terlebih dahulu');
    if (!selectedProduct) return Alert.alert('Error', 'Pilih nominal pulsa terlebih dahulu');

    Alert.alert(
      'Konfirmasi Pembelian',
      `Pulsa ${selectedProduct.product_name}\nUntuk: ${phone}\nHarga: Rp${selectedProduct.price?.toLocaleString('id-ID')}`,
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
                title: `Pulsa ${selectedProduct.product_name}`,
                type: 'pulsa',
                icon: '📱',
                number: phone,
                amount: selectedProduct.price,
                status: result?.rc === '00' ? 'Sukses' : 'Proses',
                detail: result,
              });
              navigation.navigate('MainTabs');
              Alert.alert('Berhasil! 🎉', 'Pulsa sedang diproses');
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
      <LinearGradient colors={['#0047CC', '#0066FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beli Pulsa</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Input Nomor HP */}
        <View style={styles.card}>
          <Text style={styles.label}>Nomor HP</Text>
          <View style={styles.inputRow}>
            {operator && (
              <View style={styles.opBadge}>
                <Text style={styles.opText}>{operator.name}</Text>
              </View>
            )}
            <TextInput
              style={[styles.input, operator && { paddingLeft: 8 }]}
              placeholder="Contoh: 08123456789"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={14}
            />
          </View>
          {operator && (
            <Text style={styles.opDetect}>✅ Terdeteksi: {operator.name}</Text>
          )}
        </View>

        {/* Pilih Nominal */}
        {products.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>Pilih Nominal</Text>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.productGrid}>
                {products.map(p => (
                  <TouchableOpacity
                    key={p.buyer_sku_code}
                    style={[
                      styles.productItem,
                      selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.productSelected,
                    ]}
                    onPress={() => setSelectedProduct(p)}
                  >
                    <Text style={[
                      styles.productName,
                      selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.productNameSelected,
                    ]}>
                      {p.product_name}
                    </Text>
                    <Text style={[
                      styles.productPrice,
                      selectedProduct?.buyer_sku_code === p.buyer_sku_code && styles.productPriceSelected,
                    ]}>
                      {formatRupiah(p.price)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Detail Transaksi */}
        {selectedProduct && (
          <View style={[styles.card, styles.detailCard]}>
            <Text style={styles.label}>Rincian Transaksi</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Produk</Text>
              <Text style={styles.detailVal}>{selectedProduct.product_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Nomor</Text>
              <Text style={styles.detailVal}>{phone}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalKey}>Total Bayar</Text>
              <Text style={styles.totalVal}>{formatRupiah(selectedProduct.price)}</Text>
            </View>
          </View>
        )}

        {/* Tombol Beli */}
        <TouchableOpacity
          style={[styles.btnBeli, (!phone || !selectedProduct) && styles.btnDisabled]}
          onPress={handleBeli}
          disabled={!phone || !selectedProduct || buying}
        >
          {buying ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnBeliText}>Beli Pulsa</Text>
          )}
        </TouchableOpacity>
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
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm,
  },
  label: { fontSize: 13, ...FONTS.semiBold, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  input: {
    flex: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...FONTS.medium, color: COLORS.text,
  },
  opBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md },
  opText: { color: COLORS.primary, fontSize: 12, ...FONTS.semiBold },
  opDetect: { marginTop: SPACING.xs, fontSize: 12, color: COLORS.success },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  productItem: {
    width: '30%', padding: SPACING.sm, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  productSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  productName: { fontSize: 12, ...FONTS.medium, color: COLORS.text, textAlign: 'center' },
  productNameSelected: { color: COLORS.primary, ...FONTS.semiBold },
  productPrice: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  productPriceSelected: { color: COLORS.primaryDark, ...FONTS.semiBold },
  detailCard: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary + '30' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  detailKey: { fontSize: 13, color: COLORS.textSecondary },
  detailVal: { fontSize: 13, ...FONTS.medium, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  totalKey: { fontSize: 14, ...FONTS.bold, color: COLORS.text },
  totalVal: { fontSize: 16, ...FONTS.bold, color: COLORS.primary },
  btnBeli: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    padding: SPACING.base, alignItems: 'center', marginBottom: SPACING['2xl'], ...SHADOW.md,
  },
  btnDisabled: { backgroundColor: COLORS.gray300 },
  btnBeliText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
});
