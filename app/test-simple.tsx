
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TestSimple() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ App is Working!</Text>
      <Text style={styles.subtitle}>التطبيق يعمل بشكل صحيح</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>• React Native: ✅</Text>
        <Text style={styles.infoText}>• Expo Router: ✅</Text>
        <Text style={styles.infoText}>• Navigation: ✅</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(tabs)/chapters')}
      >
        <Text style={styles.buttonText}>Go to Chapters</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6D6558',
    marginBottom: 40,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  infoText: {
    fontSize: 16,
    color: '#2C2416',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#6D6558',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
