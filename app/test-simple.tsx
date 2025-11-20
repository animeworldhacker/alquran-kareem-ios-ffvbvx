
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestSimple() {
  console.log('✅ TestSimple screen rendered');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ App is working!</Text>
      <Text style={styles.subtext}>If you see this, the basic setup is fine.</Text>
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#6D6558',
    textAlign: 'center',
  },
});
