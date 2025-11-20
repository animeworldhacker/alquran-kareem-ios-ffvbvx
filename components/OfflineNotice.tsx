
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { networkUtils } from '../utils/networkUtils';
import Icon from './Icon';

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkUtils.subscribe(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);

      // Animate in/out
      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    // Check initial state
    networkUtils.isConnected().then(connected => {
      const offline = !connected;
      setIsOffline(offline);
      if (offline) {
        slideAnim.setValue(0);
      }
    }).catch(error => {
      console.error('Error checking network state:', error);
    });

    return unsubscribe;
  }, [slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Icon name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
