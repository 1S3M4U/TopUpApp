// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import PulsaScreen from '../screens/PulsaScreen';
import PaketInternetScreen from '../screens/PaketInternetScreen';
import EWalletScreen from '../screens/EWalletScreen';
import TokenPLNScreen from '../screens/TokenPLNScreen';
import RiwayatScreen from '../screens/RiwayatScreen';
import ProfilScreen from '../screens/ProfilScreen';
import PaymentScreen from '../screens/PaymentScreen';

import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ name, focused }) => {
  const icons = {
    Beranda: focused ? '🏠' : '🏡',
    Riwayat: focused ? '📋' : '📄',
    Profil: focused ? '👤' : '🧑',
  };
  return (
    <Text style={{ fontSize: 20 }}>{icons[name] || '⭐'}</Text>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Pulsa" component={PulsaScreen} />
        <Stack.Screen name="PaketInternet" component={PaketInternetScreen} />
        <Stack.Screen name="EWallet" component={EWalletScreen} />
        <Stack.Screen name="TokenPLN" component={TokenPLNScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    ...SHADOW.sm,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
  },
  tabLabel: {
    ...FONTS.medium,
    fontSize: 11,
    marginTop: 2,
  },
});
