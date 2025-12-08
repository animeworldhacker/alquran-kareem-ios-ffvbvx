
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import FloatingTabBar from '../../components/FloatingTabBar';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={() => (
          <FloatingTabBar 
            visible={true}
          />
        )}
      >
        <Tabs.Screen
          name="chapters"
          options={{
            title: 'السور',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="bookmarks"
          options={{
            title: 'المفضلة',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="reciters"
          options={{
            title: 'القراء',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'الإعدادات',
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
