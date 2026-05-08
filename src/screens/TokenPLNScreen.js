// src/screens/TokenPLNScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { inquiryTokenPLN, beliProduk } from '../services/DigiflazzService';
import { saveTransaction } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const NOMINAL_PLN = [20000, 50000, 100000, 200000, 500000, 1000000];

export default function TokenPLNScreen({ navigation }) {
  const [nomorMeter, setNomorMeter] = useState('');
  const [nominal, setNominal] = useState(null);
  const [inquiry, setInquiry] = useState(null);
  const [loadingInquiry, setLoadingInquiry] = useState(false);
  const [buying, setBuying] = useState(false);

  const handleInquiry = async () => {
    if (!nomorMeter || nomorMeter.length < 11) {
      return Alert.alert('Error', 'Masukkan nomor meter PLN yang valid (min 11 digit)');
    }
    setLoadingInquiry(true);
    setInquiry(null);
    try {
      const data = await inquiryTokenPLN(nomorMeter);
      setInquiry(data);
    } catch {
      // Demo fallback
      setInquiry({
        customer_name: 'BUDI SANTOSO',
        subscriber_id: nomorMeter,
        segment_power: '1300 VA',
        ref_id: `REF-${Date.now()}`,
        rc: '00',
      });
    }
    setLoadingInquiry(false);
  };

  const handleBeli = async () => {
    if (!inquiry) return Alert.alert('Error', 'Lakukan cek nomor meter terlebih dahulu');
    if (!nominal) return Alert.alert('Error', 'Pilih nominal token terlebih dahulu');

    const totalBayar = nominal + 2500; // harga + admin

    Alert.alert(
      'Konfirmasi Pembelian Token PLN',
      `Nama: ${inquiry.customer_name}\nNomor Meter: ${nomorMeter}\nDaya: ${inquiry.segment_power || '-'}\nNominal: Rp${nominal.toLocaleString('id-ID')}\nAdmin: Rp2.500\nTotal: Rp${totalBayar.toLocaleString('id-ID')}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bayar',
          onPress: async () => {
            setBuying(true);
            try {
              const skuCode = `PLN${nominal / 1000}`;
              const result = await beliProduk({
                skuCode,
                customerNo: nomorMeter,
                refId: inquiry.ref_id,
              });

              const token = result?.sn || result?.token || '1234-5678-9012-3456-7890';

              await saveTransaction({
                title: `Token PLN ${(nominal / 1000).toFixed(0)}kWh`,
                type: 'pln',
                icon: '⚡',
                number: nomorMeter,
                amount: totalBayar,
                status: 'Sukses',
                token,
                detail: result,
              });

              Alert.alert(
                'Token PLN Berhasil! ⚡',
                `Token Listrik Anda:\n\n${token}\n\nSimpan kode ini untuk dimasukkan ke meteran Anda.`,
                [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
              );
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
      <LinearGradient colors={['#E65100', '#FF8C00']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Token PLN</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Nomor Meter */}
        <View style={styles.card}>
          <Text style={styles.label}>Nomor Meter / ID Pelanggan</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nomor meter (11-12 digit)"
              keyboardType="numeric"
              value={nomorMeter}
              onChangeText={(v) => { setNomorMeter(v); setInquiry(null); }}
              maxLength={13}
            />
            <TouchableOpacity
              style={[styles.cekBtn, (!nomorMeter || nomorMeter.length < 11) && styles.cekBtnDisabled]}
              onPress={handleInquiry}
              disabled={!nomorMeter || nomorMeter.length < 11 || loadingInquiry}
            >
              {loadingInquiry
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.cekBtnText}>CEK</Text>
              }
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>⚠️ Pastikan nomor meter benar untuk menghindari kesalahan token</Text>
        </View>

        {/* Info Pelanggan */}
        {inquiry && inquiry.rc === '00' && (
          <View style={[styles.card, styles.infoCard]}>
            <Text style={styles.infoTitle}>⚡ Informasi Pelanggan</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Nama</Text>
              <Text style={styles.infoVal}>{inquiry.customer_name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>No. Meter</Text>
              <Text style={styles.infoVal}>{nomorMeter}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Daya</Text>
              <Text style={styles.infoVal}>{inquiry.segment_power || '-'}</Text>
            </View>
          </View>
        )}

        {/* Pilih Nominal */}
        {inquiry && (
          <View style={styles.card}>
            <Text style={styles.label}>Pilih Nominal Token</Text>
            <View style={styles.nominalGrid}>
              {NOMINAL_PLN.map(n => {
                const kwh = n === 20000 ? '±5' : n === 50000 ? '±14' : n === 100000 ? '±30' :
                            n === 200000 ? '±62' : n === 500000 ? '±157' : '±314';
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.nominalItem, nominal === n && styles.nominalItemSelected]}
                    onPress={() => setNominal(n)}
                  >
                    <Text style={[styles.nominalPrice, nominal === n && styles.nominalPriceSelected]}>
                      {formatRupiah(n)}
                    </Text>
                    <Text style={[styles.nominalKwh, nominal === n && styles.nominalKwhSelected]}>
                      {kwh} kWh
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Ringkasan */}
        {nominal && inquiry && (
          <View style={[styles.card, styles.summaryCard]}>
            <Text style={styles.label}>Rincian Pembayaran</Text>
            <View style={styles.sumRow}><Text style={styles.sumKey}>Nominal Token</Text><Text style={styles.sumVal}>{formatRupiah(nominal)}</Text></View>
            <View style={styles.sumRow}><Text style={styles.sumKey}>Biaya Admin</Text><Text style={styles.sumVal}>Rp2.500</Text></View>
            <View style={[styles.sumRow, styles.totalRow]}>
              <Text style={styles.totalKey}>Total Bayar</Text>
              <Text style={styles.totalVal}>{formatRupiah(nominal + 2500)}</Text>
            </View>
          </View>
        )}

        {/* Tombol Beli */}
        <TouchableOpacity
          style={[styles.btnBeli, (!inquiry || !nominal || buying) && styles.btnDisabled]}
          onPress={handleBeli}
          disabled={!inquiry || !nominal || buying}
        >
          {buying
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnBeliText}>⚡ Beli Token PLN</Text>
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
  inputRow: { flexDirection: 'row', gap: SPACING.sm },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, ...FONTS.medium, color: COLORS.text,
  },
  cekBtn: {
    backgroundColor: '#FF8C00', borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, justifyContent: 'center',
  },
  cekBtnDisabled: { backgroundColor: COLORS.gray300 },
  cekBtnText: { color: COLORS.white, ...FONTS.bold, fontSize: 13 },
  hint: { fontSize: 11, color: COLORS.warning, marginTop: SPACING.sm },
  infoCard: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB800' + '50' },
  infoTitle: { fontSize: 14, ...FONTS.bold, color: '#E65100', marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  infoKey: { fontSize: 13, color: COLORS.textSecondary },
  infoVal: { fontSize: 13, ...FONTS.semiBold, color: COLORS.text },
  nominalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  nominalItem: {
    width: '30%', padding: SPACING.sm, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  nominalItemSelected: { backgroundColor: '#FFF3E0', borderColor: '#FF8C00' },
  nominalPrice: { fontSize: 12, ...FONTS.bold, color: COLORS.text },
  nominalPriceSelected: { color: '#E65100' },
  nominalKwh: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  nominalKwhSelected: { color: '#FF8C00' },
  summaryCard: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFB800' + '40' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  sumKey: { fontSize: 13, color: COLORS.textSecondary },
  sumVal: { fontSize: 13, ...FONTS.medium, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  totalKey: { fontSize: 15, ...FONTS.bold, color: COLORS.text },
  totalVal: { fontSize: 17, ...FONTS.bold, color: '#E65100' },
  btnBeli: {
    backgroundColor: '#FF8C00', borderRadius: RADIUS.xl,
    padding: SPACING.base, alignItems: 'center', marginBottom: SPACING.lg, ...SHADOW.md,
  },
  btnDisabled: { backgroundColor: COLORS.gray300 },
  btnBeliText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
});
