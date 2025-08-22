
import React from 'react';
import { Tabs } from 'expo-router';
import Icon from '../../components/Icon';
import { colors } from '../../styles/commonStyles';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          borderTopWidth: 1,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Amiri_700Bold',
          fontSize: 12,
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
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} style={{ color }} />,
        }}
      />
    </Tabs>
  );
}
