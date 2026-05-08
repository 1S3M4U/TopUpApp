// src/screens/EWalletScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { beliProduk } from '../services/DigiflazzService';
import { saveTransaction } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const E_WALLETS = [
  { id: 'gopay',    name: 'GoPay',    icon: '💚', color: '#00AED6', sku_prefix: 'GOPAY' },
  { id: 'ovo',      name: 'OVO',      icon: '💜', color: '#4C3494', sku_prefix: 'OVO' },
  { id: 'dana',     name: 'DANA',     icon: '🔵', color: '#118EEA', sku_prefix: 'DANA' },
  { id: 'shopeepay',name: 'ShopeePay',icon: '🧡', color: '#EE4D2D', sku_prefix: 'SHOPEEPAY' },
  { id: 'linkaja',  name: 'LinkAja',  icon: '❤️', color: '#E31F2B', sku_prefix: 'LINKAJA' },
  { id: 'jenius',   name: 'Jenius',   icon: '🌊', color: '#0071CE', sku_prefix: 'JENIUS' },
];

const NOMINAL_LIST = [10000, 20000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000];

export default function EWalletScreen({ navigation }) {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [phone, setPhone] = useState('');
  const [nominal, setNominal] = useState(null);
  const [customNominal, setCustomNominal] = useState('');
  const [buying, setBuying] = useState(false);

  const finalNominal = customNominal ? parseInt(customNominal.replace(/\D/g, ''), 10) : nominal;

  const handleBeli = async () => {
    if (!selectedWallet) return Alert.alert('Error', 'Pilih e-wallet terlebih dahulu');
    if (!phone) return Alert.alert('Error', 'Masukkan nomor HP / ID akun');
    if (!finalNominal || finalNominal < 10000) return Alert.alert('Error', 'Nominal minimal Rp10.000');

    const skuCode = `${selectedWallet.sku_prefix}-${finalNominal}`;

    Alert.alert(
      'Konfirmasi Top Up',
      `${selectedWallet.name}\nNomor: ${phone}\nNominal: Rp${finalNominal.toLocaleString('id-ID')}\nBiaya admin: Rp1.500`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Top Up',
          onPress: async () => {
            setBuying(true);
            try {
              const result = await beliProduk({ skuCode, customerNo: phone });
              await saveTransaction({
                title: `Top Up ${selectedWallet.name}`,
                type: 'ewallet',
                icon: selectedWallet.icon,
                number: phone,
                amount: finalNominal + 1500,
                status: 'Sukses',
                detail: result,
              });
              navigation.navigate('MainTabs');
              Alert.alert('Berhasil! 🎉', `Top Up ${selectedWallet.name} berhasil`);
            } catch {
              Alert.alert('Error', 'Transaksi gagal, coba lagi');
            }
            setBuying(false);
          },
        },
      ]
    );
  };

  const formatInput = (val) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num, 10).toLocaleString('id-ID') : '';
  };

  const formatRupiah = (n) => `Rp${(n || 0).toLocaleString('id-ID')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#009B73', '#00C896']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up E-Wallet</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Pilih E-Wallet */}
        <View style={styles.card}>
          <Text style={styles.label}>Pilih E-Wallet</Text>
          <View style={styles.walletGrid}>
            {E_WALLETS.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[styles.walletItem, selectedWallet?.id === w.id && { borderColor: w.color, backgroundColor: w.color + '15' }]}
                onPress={() => setSelectedWallet(w)}
              >
                <Text style={{ fontSize: 26 }}>{w.icon}</Text>
                <Text style={[styles.walletName, selectedWallet?.id === w.id && { color: w.color, ...FONTS.bold }]}>
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nomor Akun */}
        {selectedWallet && (
          <View style={styles.card}>
            <Text style={styles.label}>Nomor HP / ID {selectedWallet.name}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Masukkan nomor ${selectedWallet.name}`}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={20}
            />
          </View>
        )}

        {/* Pilih Nominal */}
        <View style={styles.card}>
          <Text style={styles.label}>Pilih Nominal</Text>
          <View style={styles.nominalGrid}>
            {NOMINAL_LIST.map(n => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.nominalItem,
                  nominal === n && !customNominal && styles.nominalItemSelected,
                ]}
                onPress={() => { setNominal(n); setCustomNominal(''); }}
              >
                <Text style={[
                  styles.nominalText,
                  nominal === n && !customNominal && styles.nominalTextSelected,
                ]}>
                  {formatRupiah(n)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>atau masukkan nominal lain</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.customInput}>
            <Text style={styles.rpPrefix}>Rp</Text>
            <TextInput
              style={styles.customField}
              placeholder="0"
              keyboardType="numeric"
              value={customNominal}
              onChangeText={(v) => {
                setNominal(null);
                setCustomNominal(formatInput(v));
              }}
            />
          </View>
        </View>

        {/* Ringkasan */}
        {finalNominal > 0 && selectedWallet && phone && (
          <View style={[styles.card, { backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondary + '30', borderWidth: 1 }]}>
            <Text style={styles.label}>Ringkasan Transaksi</Text>
            <View style={styles.row}><Text style={styles.rKey}>E-Wallet</Text><Text style={styles.rVal}>{selectedWallet.name}</Text></View>
            <View style={styles.row}><Text style={styles.rKey}>Nomor</Text><Text style={styles.rVal}>{phone}</Text></View>
            <View style={styles.row}><Text style={styles.rKey}>Nominal</Text><Text style={styles.rVal}>{formatRupiah(finalNominal)}</Text></View>
            <View style={styles.row}><Text style={styles.rKey}>Biaya Admin</Text><Text style={styles.rVal}>Rp1.500</Text></View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalKey}>Total</Text>
              <Text style={styles.totalVal}>{formatRupiah(finalNominal + 1500)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnBeli, (!selectedWallet || !phone || !finalNominal || buying) && styles.btnDisabled]}
          onPress={handleBeli}
          disabled={!selectedWallet || !phone || !finalNominal || buying}
        >
          {buying
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnBeliText}>Top Up Sekarang</Text>
          }
        </TouchableOpacity>
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
  walletGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  walletItem: {
    width: '30%', alignItems: 'center', padding: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border,
  },
  walletName: { fontSize: 11, ...FONTS.medium, color: COLORS.text, marginTop: 4, textAlign: 'center' },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...FONTS.medium, color: COLORS.text,
  },
  nominalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  nominalItem: {
    width: '30%', padding: SPACING.sm, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  nominalItemSelected: { backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondary },
  nominalText: { fontSize: 12, ...FONTS.medium, color: COLORS.text },
  nominalTextSelected: { color: COLORS.secondary, ...FONTS.bold },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { marginHorizontal: SPACING.sm, fontSize: 11, color: COLORS.textLight },
  customInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  rpPrefix: {
    backgroundColor: COLORS.gray100, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md, fontSize: 15, ...FONTS.bold, color: COLORS.text,
    borderRightWidth: 1, borderColor: COLORS.border,
  },
  customField: { flex: 1, paddingHorizontal: SPACING.md, fontSize: 15, ...FONTS.medium },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  rKey: { fontSize: 13, color: COLORS.textSecondary },
  rVal: { fontSize: 13, ...FONTS.medium, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  totalKey: { fontSize: 15, ...FONTS.bold, color: COLORS.text },
  totalVal: { fontSize: 17, ...FONTS.bold, color: COLORS.secondary },
  btnBeli: {
    backgroundColor: COLORS.secondary, borderRadius: RADIUS.xl,
    padding: SPACING.base, alignItems: 'center', marginBottom: SPACING.lg, ...SHADOW.md,
  },
  btnDisabled: { backgroundColor: COLORS.gray300 },
  btnBeliText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
});
