
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import Animated from 'react-native-reanimated';

interface FloatingTabBarProps {
  visible: boolean;
  translateY: Animated.SharedValue<number>;
}

export default function FloatingTabBar({ visible, translateY }: FloatingTabBarProps) {
  const { colors, textSizes } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const tabs = [
    { name: 'chapters', label: 'السور', icon: 'book', route: '/(tabs)/chapters' },
    { name: 'bookmarks', label: 'المفضلة', icon: 'bookmark', route: '/(tabs)/bookmarks' },
    { name: 'reciters', label: 'القراء', icon: 'volume-high', route: '/(tabs)/reciters' },
    { name: 'settings', label: 'الإعدادات', icon: 'settings', route: '/(tabs)/settings' },
  ];

  const handleTabPress = (route: string) => {
    try {
      console.log('Navigating to:', route);
      router.push(route as any);
    } catch (error) {
      console.error('Error navigating:', error);
    }
  };

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingBottom: insets.bottom,
      height: 60 + insets.bottom,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      paddingTop: 8,
      boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 8,
      pointerEvents: visible ? 'auto' : 'none',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    tabLabel: {
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.caption,
      marginTop: 4,
    },
  });

  return (
    <View
      style={[
        styles.container,
      ]}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={24}
              style={{ color: active ? colors.primary : colors.text }}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: active ? colors.primary : colors.text },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
