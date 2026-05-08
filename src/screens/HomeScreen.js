// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { cekSaldo } from '../services/DigiflazzService';
import { getUserProfile, getTransactions } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const MENU_ITEMS = [
  { id: 'pulsa',     label: 'Pulsa',        icon: '📱', screen: 'Pulsa',        gradient: ['#0066FF','#00A8FF'] },
  { id: 'internet',  label: 'Paket Data',   icon: '🌐', screen: 'PaketInternet', gradient: ['#7C3AED','#9F67FF'] },
  { id: 'ewallet',   label: 'E-Wallet',     icon: '💳', screen: 'EWallet',       gradient: ['#00C896','#009B73'] },
  { id: 'pln',       label: 'Token PLN',    icon: '⚡', screen: 'TokenPLN',      gradient: ['#FF8C00','#FFB800'] },
];

const PROMO_ITEMS = [
  { id: 1, title: 'Cashback 10%',    desc: 'Beli pulsa min. Rp20.000',   color: '#0066FF' },
  { id: 2, title: 'Bonus Kuota',     desc: 'Paket data + 1GB gratis',    color: '#7C3AED' },
  { id: 3, title: 'Diskon Token PLN',desc: 'Hemat hingga Rp5.000',       color: '#FF8C00' },
];

export default function HomeScreen({ navigation }) {
  const [saldo, setSaldo] = useState(null);
  const [user, setUser] = useState({ name: 'Pengguna' });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saldoVisible, setSaldoVisible] = useState(true);

  const loadData = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
      const history = await getTransactions();
      setRecentTransactions(history.slice(0, 3));
      const saldoData = await cekSaldo();
      setSaldo(saldoData?.deposit || 0);
    } catch (e) {
      console.log('Load data error:', e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
      .format(num || 0);

  const getStatusColor = (status) => {
    if (status === 'Sukses') return COLORS.success;
    if (status === 'Gagal') return COLORS.danger;
    return COLORS.warning;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── HEADER ── */}
        <LinearGradient colors={['#0047CC', '#0066FF', '#00A8FF']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Selamat Datang 👋</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* ── SALDO CARD ── */}
          <View style={styles.saldoCard}>
            <Text style={styles.saldoLabel}>Saldo Anda</Text>
            <View style={styles.saldoRow}>
              <Text style={styles.saldoAmount}>
                {saldoVisible
                  ? (saldo !== null ? formatRupiah(saldo) : '•••••••')
                  : '••••••••••'}
              </Text>
              <TouchableOpacity onPress={() => setSaldoVisible(v => !v)}>
                <Text style={{ fontSize: 20, marginLeft: 8 }}>
                  {saldoVisible ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.saldoBadge}>
              <Text style={styles.saldoBadgeText}>💎 Member Aktif</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── MENU LAYANAN ── */}
          <Text style={styles.sectionTitle}>Layanan</Text>
          <View style={styles.menuGrid}>
            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={item.gradient} style={styles.menuIcon}>
                  <Text style={{ fontSize: 26 }}>{item.icon}</Text>
                </LinearGradient>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── PROMO ── */}
          <Text style={styles.sectionTitle}>Promo Spesial</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
            {PROMO_ITEMS.map(p => (
              <TouchableOpacity key={p.id} style={[styles.promoCard, { borderLeftColor: p.color }]}>
                <Text style={[styles.promoTitle, { color: p.color }]}>{p.title}</Text>
                <Text style={styles.promoDesc}>{p.desc}</Text>
                <Text style={[styles.promoLink, { color: p.color }]}>Klaim sekarang →</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── TRANSAKSI TERAKHIR ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Riwayat')}>
              <Text style={styles.lihatSemua}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
          ) : (
            recentTransactions.map(tx => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <Text style={{ fontSize: 28 }}>{tx.icon || '📱'}</Text>
                  <View style={{ marginLeft: SPACING.md }}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txSub}>{tx.number} • {new Date(tx.createdAt).toLocaleDateString('id-ID')}</Text>
                  </View>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{formatRupiah(tx.amount)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>{tx.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.lg, paddingBottom: SPACING['2xl'], paddingHorizontal: SPACING.base },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13, ...FONTS.regular },
  userName: { color: COLORS.white, fontSize: 20, ...FONTS.bold, marginTop: 2 },
  notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, padding: SPACING.sm },
  saldoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  saldoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, ...FONTS.medium },
  saldoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.sm },
  saldoAmount: { color: COLORS.white, fontSize: 26, ...FONTS.bold },
  saldoBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  saldoBadgeText: { color: COLORS.white, fontSize: 11, ...FONTS.semiBold },
  body: { paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING['3xl'] },
  sectionTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  lihatSemua: { color: COLORS.primary, fontSize: 13, ...FONTS.semiBold },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  menuItem: { width: '22%', alignItems: 'center' },
  menuIcon: { width: 56, height: 56, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 6, ...SHADOW.md },
  menuLabel: { fontSize: 11, ...FONTS.medium, color: COLORS.text, textAlign: 'center' },
  promoScroll: { marginBottom: SPACING.xl },
  promoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base,
    marginRight: SPACING.md, width: 160, borderLeftWidth: 4, ...SHADOW.sm,
  },
  promoTitle: { fontSize: 13, ...FONTS.bold, marginBottom: 4 },
  promoDesc: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6, ...FONTS.regular },
  promoLink: { fontSize: 11, ...FONTS.semiBold },
  txCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  txRight: { alignItems: 'flex-end' },
  txTitle: { fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  txSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  txAmount: { fontSize: 14, ...FONTS.bold, color: COLORS.text },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 10, ...FONTS.semiBold },
  emptyTx: { alignItems: 'center', paddingVertical: SPACING['2xl'] },
  emptyText: { color: COLORS.textLight, marginTop: SPACING.sm, fontSize: 14 },
});
