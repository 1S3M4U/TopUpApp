// src/screens/ProfilScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { getUserProfile, saveUserProfile, getTransactions } from '../services/StorageService';
import { cekSaldo } from '../services/DigiflazzService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const MENU_PROFIL = [
  { icon: '🔔', label: 'Notifikasi', desc: 'Aktifkan notifikasi transaksi' },
  { icon: '🔒', label: 'Keamanan', desc: 'PIN & autentikasi' },
  { icon: '💬', label: 'Bantuan', desc: 'FAQ & hubungi kami' },
  { icon: '⭐', label: 'Beri Rating', desc: 'Nilai aplikasi kami' },
  { icon: 'ℹ️', label: 'Tentang Aplikasi', desc: 'Versi 1.0.0' },
];

export default function ProfilScreen() {
  const [profile, setProfile] = useState({ name: 'Pengguna', phone: '' });
  const [saldo, setSaldo] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const p = await getUserProfile();
    setProfile(p);
    const txs = await getTransactions();
    setTxCount(txs.length);
    try {
      const s = await cekSaldo();
      setSaldo(s?.deposit || 0);
    } catch { setSaldo(0); }
  };

  const handleEdit = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditing(true);
  };

  const handleSave = async () => {
    const updated = { name: editName || 'Pengguna', phone: editPhone };
    await saveUserProfile(updated);
    setProfile(updated);
    setEditing(false);
    Alert.alert('Berhasil', 'Profil berhasil diperbarui');
  };

  const formatRupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={['#0047CC', '#0066FF']} style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
          <Text style={{ color: COLORS.white, fontSize: 13, ...FONTS.semiBold }}>✏️ Edit</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar & Info */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#0066FF', '#00A8FF']} style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>
              {(profile.name || 'P')[0].toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profilePhone}>{profile.phone || 'Belum ada nomor HP'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{txCount}</Text>
            <Text style={styles.statLabel}>Transaksi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatRupiah(saldo)}</Text>
            <Text style={styles.statLabel}>Saldo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>💎</Text>
            <Text style={styles.statLabel}>Member Aktif</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_PROFIL.map((m, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <Text style={{ fontSize: 22 }}>{m.icon}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{m.label}</Text>
                <Text style={styles.menuDesc}>{m.desc}</Text>
              </View>
              <Text style={{ color: COLORS.textLight, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪 Keluar</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      {editing && (
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Edit Profil</Text>
            <Text style={styles.editLabel}>Nama</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nama Anda"
            />
            <Text style={styles.editLabel}>Nomor HP</Text>
            <TextInput
              style={styles.editInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
            />
            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.xl,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, ...FONTS.bold },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  avatarSection: { alignItems: 'center', marginTop: -20, marginBottom: SPACING.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.white, ...SHADOW.lg,
  },
  profileName: { fontSize: 20, ...FONTS.bold, color: COLORS.text, marginTop: SPACING.sm },
  profilePhone: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: SPACING.base,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.base, ...SHADOW.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, ...FONTS.bold, color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  menuSection: {
    backgroundColor: COLORS.white, marginHorizontal: SPACING.base,
    borderRadius: RADIUS.xl, marginBottom: SPACING.base, ...SHADOW.sm, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.base,
    borderBottomWidth: 1, borderColor: COLORS.gray100,
  },
  menuText: { flex: 1, marginLeft: SPACING.md },
  menuLabel: { fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  menuDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  logoutBtn: {
    marginHorizontal: SPACING.base, backgroundColor: '#FEE8E8',
    borderRadius: RADIUS.xl, padding: SPACING.base, alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontSize: 15, ...FONTS.semiBold },
  editOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  editModal: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.xl, width: '85%',
  },
  editTitle: { fontSize: 18, ...FONTS.bold, marginBottom: SPACING.lg, textAlign: 'center' },
  editLabel: { fontSize: 13, ...FONTS.semiBold, color: COLORS.textSecondary, marginBottom: 6 },
  editInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: 15, marginBottom: SPACING.md,
  },
  editBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelBtn: { flex: 1, backgroundColor: COLORS.gray100, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  cancelText: { color: COLORS.text, ...FONTS.semiBold },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  saveText: { color: COLORS.white, ...FONTS.semiBold },
});
