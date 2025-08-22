
import React from 'react';
import { Tabs } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabsLayout() {
  const { colors, textSizes } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Amiri_700Bold',
          fontSize: textSizes.caption,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'السور',
          tabBarIcon: ({ color, size }) => <Icon name="book" size={size} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ color, size }) => <Icon name="bookmark" size={size} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="reciters"
        options={{
          title: 'القراء',
          tabBarIcon: ({ color, size }) => <Icon name="musical-notes" size={size} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} style={{ color }} />,
        }}
      />
    </Tabs>
  );
}
