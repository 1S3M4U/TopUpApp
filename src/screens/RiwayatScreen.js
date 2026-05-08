// src/screens/RiwayatScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, clearTransactions } from '../services/StorageService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const FILTER_TABS = ['Semua', 'Pulsa', 'Data', 'E-Wallet', 'PLN'];

const TYPE_MAP = {
  pulsa: { label: 'Pulsa', icon: '📱', color: COLORS.primary },
  internet: { label: 'Paket Data', icon: '🌐', color: '#7C3AED' },
  ewallet: { label: 'E-Wallet', icon: '💳', color: COLORS.secondary },
  pln: { label: 'Token PLN', icon: '⚡', color: '#FF8C00' },
};

export default function RiwayatScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(setTransactions);
    }, [])
  );

  const filteredTx = filter === 'Semua'
    ? transactions
    : transactions.filter(tx => {
        if (filter === 'Pulsa') return tx.type === 'pulsa';
        if (filter === 'Data') return tx.type === 'internet';
        if (filter === 'E-Wallet') return tx.type === 'ewallet';
        if (filter === 'PLN') return tx.type === 'pln';
        return true;
      });

  const formatRupiah = (n) => `Rp${(n || 0).toLocaleString('id-ID')}`;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status) => {
    if (status === 'Sukses') return { bg: '#E6FBF5', text: COLORS.success };
    if (status === 'Gagal') return { bg: '#FEE8E8', text: COLORS.danger };
    return { bg: '#FFF8E1', text: COLORS.warning };
  };

  const handleClearAll = () => {
    Alert.alert('Hapus Semua?', 'Seluruh riwayat transaksi akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        await clearTransactions();
        setTransactions([]);
      }},
    ]);
  };

  const renderItem = ({ item }) => {
    const type = TYPE_MAP[item.type] || { label: item.type, icon: '💰', color: COLORS.primary };
    const ss = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.txCard} onPress={() => { setSelected(item); setModalVisible(true); }}>
        <View style={[styles.txIconBox, { backgroundColor: type.color + '20' }]}>
          <Text style={{ fontSize: 24 }}>{item.icon || type.icon}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.txSub}>{item.number}</Text>
          <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.txRight}>
          <Text style={styles.txAmount}>{formatRupiah(item.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
            <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        {transactions.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={{ color: COLORS.danger, fontSize: 13, ...FONTS.medium }}>Hapus Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTx}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 50 }}>📭</Text>
            <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
            <Text style={styles.emptyDesc}>Transaksi Anda akan muncul di sini</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setModalVisible(false)} />
        {selected && (
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Detail Transaksi</Text>

            <View style={styles.modalIcon}>
              <Text style={{ fontSize: 40 }}>{selected.icon || '💰'}</Text>
            </View>

            <Text style={styles.modalTxTitle}>{selected.title}</Text>

            {[
              ['Status', selected.status],
              ['Nomor', selected.number],
              ['Jumlah', formatRupiah(selected.amount)],
              ['Waktu', formatDate(selected.createdAt)],
              ['ID Transaksi', selected.id],
              ...(selected.token ? [['Token PLN', selected.token]] : []),
            ].map(([k, v]) => (
              <View key={k} style={styles.modalRow}>
                <Text style={styles.modalKey}>{k}</Text>
                <Text style={[styles.modalVal, k === 'Token PLN' && styles.tokenText]} selectable>{v}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 20, ...FONTS.bold, color: COLORS.text },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterTab: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.gray100,
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, ...FONTS.medium, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },
  list: { padding: SPACING.base, gap: SPACING.sm },
  txCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, padding: SPACING.md, ...SHADOW.sm,
  },
  txIconBox: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  txSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  txDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 13, ...FONTS.bold, color: COLORS.text },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 10, ...FONTS.semiBold },
  empty: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  emptyTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.text, marginTop: 16 },
  emptyDesc: { fontSize: 13, color: COLORS.textLight, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.lg, textAlign: 'center' },
  modalIcon: { alignItems: 'center', marginBottom: SPACING.md },
  modalTxTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg },
  modalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  modalKey: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  modalVal: { fontSize: 13, ...FONTS.medium, color: COLORS.text, flex: 2, textAlign: 'right' },
  tokenText: { fontSize: 13, ...FONTS.bold, color: '#FF8C00', letterSpacing: 1 },
  closeBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xl,
  },
  closeBtnText: { color: COLORS.white, fontSize: 15, ...FONTS.bold },
});
