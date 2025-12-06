
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { networkUtils } from '../utils/networkUtils';
import { offlineManager } from '../services/offlineManager';
import Icon from './Icon';

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const [canWorkOffline, setCanWorkOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const checkOfflineCapability = useCallback(async () => {
    try {
      const connected = await networkUtils.isConnected();
      const offline = !connected;
      setIsOffline(offline);
      
      if (offline) {
        const canWork = await offlineManager.canWorkOffline();
        setCanWorkOffline(canWork);
        slideAnim.setValue(0);
      }
    } catch (error) {
      console.error('Error checking offline capability:', error);
    }
  }, [slideAnim]);

  useEffect(() => {
    let mounted = true;

    // Subscribe to network changes
    const unsubscribe = networkUtils.subscribe(state => {
      if (!mounted) return;
      
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
    checkOfflineCapability();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [slideAnim, checkOfflineCapability]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        canWorkOffline ? styles.containerWarning : styles.containerError,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Icon name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>
        {canWorkOffline 
          ? 'وضع بدون إنترنت - البيانات المحملة متاحة'
          : 'لا يوجد اتصال بالإنترنت'
        }
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
  },
  containerError: {
    backgroundColor: '#f44336',
  },
  containerWarning: {
    backgroundColor: '#ff9800',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
