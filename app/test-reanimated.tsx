
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

export default function TestReanimated() {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const handlePress = () => {
    offset.value = withSpring(offset.value === 0 ? 100 : 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reanimated Test</Text>
      <Text style={styles.subtitle}>If you see this, Reanimated is working!</Text>
      
      <Animated.View style={[styles.box, animatedStyles]} />
      
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Animate</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.backButton]} 
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#1E5B4C',
    borderRadius: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1E5B4C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#D4AF37',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
