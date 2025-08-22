
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { ScheherazadeNew_400Regular } from '@expo-google-fonts/scheherazade-new';
import SplashScreen from '../components/SplashScreen';
import { commonStyles } from '../styles/commonStyles';
import { Redirect } from 'expo-router';

export default function MainScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    ScheherazadeNew_400Regular,
  });

  useEffect(() => {
    console.log('Main screen loaded');
    
    if (fontError) {
      console.error('Font loading error:', fontError);
      setError('فشل في تحميل الخطوط');
    }
  }, [fontError]);

  // Handle font loading error
  if (fontError) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 18, color: '#F44336', textAlign: 'center', marginBottom: 20 }}>
          خطأ في تحميل الخطوط
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          يرجى إعادة تحميل التطبيق
        </Text>
      </View>
    );
  }

  // Show loading while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#2F4F4F', textAlign: 'center' }}>
          جاري تحميل التطبيق...
        </Text>
      </View>
    );
  }

  // Show splash screen
  if (showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  // Redirect to main app
  try {
    return <Redirect href='/(tabs)/chapters' />;
  } catch (redirectError) {
    console.error('Redirect error:', redirectError);
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 18, color: '#F44336', textAlign: 'center', marginBottom: 20 }}>
          خطأ في التنقل
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          يرجى إعادة تحميل التطبيق
        </Text>
      </View>
    );
  }
}
