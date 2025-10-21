
import React from 'react';
import { Tabs } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { colors, textSizes, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gold,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.15)',
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Amiri_700Bold',
          fontSize: textSizes.caption,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'السور',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "book" : "book-outline"} 
              size={size || 26} 
              style={{ color: color || colors.textSecondary }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "bookmark" : "bookmark-outline"} 
              size={size || 26} 
              style={{ color: color || colors.textSecondary }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "settings" : "settings-outline"} 
              size={size || 26} 
              style={{ color: color || colors.textSecondary }} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
