// src/screens/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getPaymentChannels, createTransaction } from '../services/TripayService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const PAYMENT_CATEGORIES = {
  'Virtual Account': ['BRIVA', 'BNIVA', 'MANDIRIVA', 'BCAVA', 'PERMATAVA', 'CIMBVA'],
  'QRIS': ['QRIS'],
  'E-Wallet': ['OVO', 'DANA', 'GOPAY', 'SHOPEEPAY', 'LINKAJA'],
  'Gerai Ritel': ['ALFAMART', 'INDOMARET'],
};

export default function PaymentScreen({ navigation, route }) {
  const { orderData } = route.params || {};
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => { loadChannels(); }, []);

  const loadChannels = async () => {
    try {
      const data = await getPaymentChannels();
      setChannels(data || []);
    } catch {
      // Demo fallback
      setChannels([
        { code: 'BRIVA', name: 'BRI Virtual Account', icon_url: '', fee_merchant: { flat: 4000 } },
        { code: 'BCAVA', name: 'BCA Virtual Account', icon_url: '', fee_merchant: { flat: 4000 } },
        { code: 'QRIS', name: 'QRIS', icon_url: '', fee_merchant: { flat: 0 } },
        { code: 'OVO', name: 'OVO', icon_url: '', fee_merchant: { flat: 0 } },
        { code: 'DANA', name: 'DANA', icon_url: '', fee_merchant: { flat: 0 } },
      ]);
    }
    setLoading(false);
  };

  const handlePay = async () => {
    if (!selected) return Alert.alert('Error', 'Pilih metode pembayaran');

    setPaying(true);
    try {
      const fee = selected.fee_merchant?.flat || 0;
      const result = await createTransaction({
        method: selected.code,
        merchantRef: `ORDER-${Date.now()}`,
        amount: (orderData?.amount || 0) + fee,
        customerName: orderData?.customerName || 'Pelanggan',
        customerEmail: orderData?.email || 'user@mail.com',
        customerPhone: orderData?.phone || '08123456789',
        orderItems: [{ name: orderData?.title || 'Produk', price: orderData?.amount || 0, quantity: 1 }],
      });

      Alert.alert(
        'Pembayaran Dibuat! 💳',
        `No. Pembayaran:\n${result?.pay_code || result?.checkout_url || '-'}\n\nSelesaikan pembayaran sebelum expired.`,
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch {
      Alert.alert('Error', 'Gagal membuat pembayaran, coba lagi');
    }
    setPaying(false);
  };

  const formatRupiah = (n) => `Rp${(n || 0).toLocaleString('id-ID')}`;

  const getChannelIcon = (code) => {
    const icons = { BRIVA: '🏦', BCAVA: '🏦', MANDIRIVA: '🏦', BNIVA: '🏦', QRIS: '📱', OVO: '💜', DANA: '🔵', GOPAY: '💚', SHOPEEPAY: '🧡', ALFAMART: '🏪', INDOMARET: '🏪' };
    return icons[code] || '💳';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0047CC', '#0066FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Pembayaran</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Order Summary */}
      {orderData && (
        <View style={styles.orderSummary}>
          <Text style={styles.orderTitle}>{orderData.title}</Text>
          <Text style={styles.orderAmount}>{formatRupiah(orderData.amount)}</Text>
        </View>
      )}

      <ScrollView style={styles.body}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          Object.entries(PAYMENT_CATEGORIES).map(([cat, codes]) => {
            const catChannels = channels.filter(c => codes.includes(c.code));
            if (catChannels.length === 0) return null;
            return (
              <View key={cat} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{cat}</Text>
                {catChannels.map(ch => (
                  <TouchableOpacity
                    key={ch.code}
                    style={[styles.channelItem, selected?.code === ch.code && styles.channelSelected]}
                    onPress={() => setSelected(ch)}
                  >
                    <Text style={{ fontSize: 24, marginRight: SPACING.md }}>{getChannelIcon(ch.code)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.channelName}>{ch.name}</Text>
                      <Text style={styles.channelFee}>
                        {ch.fee_merchant?.flat > 0
                          ? `Biaya admin: ${formatRupiah(ch.fee_merchant.flat)}`
                          : 'Tanpa biaya admin'}
                      </Text>
                    </View>
                    <View style={[styles.radio, selected?.code === ch.code && styles.radioSelected]}>
                      {selected?.code === ch.code && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {selected && (
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Total Bayar</Text>
            <Text style={styles.footerTotal}>
              {formatRupiah((orderData?.amount || 0) + (selected.fee_merchant?.flat || 0))}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.btnPay, (!selected || paying) && styles.btnDisabled]}
          onPress={handlePay}
          disabled={!selected || paying}
        >
          {paying
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnPayText}>Bayar Sekarang</Text>
          }
        </TouchableOpacity>
      </View>
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
  orderSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  orderTitle: { fontSize: 14, ...FONTS.semiBold, color: COLORS.primaryDark },
  orderAmount: { fontSize: 16, ...FONTS.bold, color: COLORS.primary },
  body: { flex: 1, padding: SPACING.base },
  categorySection: { marginBottom: SPACING.lg },
  categoryTitle: { fontSize: 13, ...FONTS.bold, color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase' },
  channelItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOW.sm,
  },
  channelSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  channelName: { fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  channelFee: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  footer: {
    backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.xl,
    borderTopWidth: 1, borderColor: COLORS.border, ...SHADOW.sm,
  },
  footerInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  footerLabel: { fontSize: 14, color: COLORS.textSecondary },
  footerTotal: { fontSize: 18, ...FONTS.bold, color: COLORS.primary },
  btnPay: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    padding: SPACING.md, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: COLORS.gray300 },
  btnPayText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
});
