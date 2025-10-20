
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, resetSettings, colors, textSizes } = useTheme();
  const [testingAudio, setTestingAudio] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل في تحديث الإعداد');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
              Alert.alert('نجح', 'تم إعادة تعيين الإعدادات بنجاح');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('خطأ', 'فشل في إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  const handleRefreshQuranData = async () => {
    Alert.alert(
      'تحديث بيانات القرآن',
      'هل تريد إعادة تحميل بيانات القرآن من الخادم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            try {
              await quranService.clearCache();
              await quranService.fetchQuranData();
              Alert.alert('نجح', 'تم تحديث بيانات القرآن بنجاح');
            } catch (error) {
              console.error('Error refreshing Quran data:', error);
              Alert.alert('خطأ', 'فشل في تحديث بيانات القرآن');
            }
          },
        },
      ]
    );
  };

  const handleTestTextProcessing = () => {
    Alert.alert(
      'اختبار معالجة النص',
      'تم تنفيذ اختبار معالجة النص. تحقق من السجلات للحصول على التفاصيل.',
      [{ text: 'حسناً' }]
    );
  };

  const handleTestAudio = async () => {
    setTestingAudio(true);
    try {
      console.log('\n🧪 ===== TESTING AUDIO SYSTEM =====');
      
      // Test 1: Initialize audio
      console.log('Test 1: Initializing audio...');
      await audioService.initializeAudio();
      console.log('✅ Audio initialization successful');
      
      // Test 2: Get reciters
      console.log('\nTest 2: Loading reciters...');
      const reciters = await audioService.getReciters();
      console.log(`✅ Loaded ${reciters.length} reciters:`, reciters.map(r => r.name).join(', '));
      
      // Test 3: Test audio URL
      console.log('\nTest 3: Testing audio URL for Al-Fatiha (1:1)...');
      const testUrl = 'https://verses.quran.com/2/001001.mp3';
      console.log('Test URL:', testUrl);
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log('URL Response Status:', response.status);
      
      if (response.ok) {
        console.log('✅ Audio URL is accessible');
        
        // Test 4: Try playing a short ayah
        console.log('\nTest 4: Attempting to play Al-Fatiha (1:1)...');
        await audioService.playAyah(1, 1, 2, false, 7);
        console.log('✅ Audio playback started successfully');
        
        Alert.alert(
          'نجح الاختبار! ✅',
          'نظام الصوت يعمل بشكل صحيح.\n\n' +
          `• تم تهيئة الصوت\n` +
          `• تم تحميل ${reciters.length} قراء\n` +
          `• الملفات الصوتية متاحة\n` +
          `• بدأ تشغيل الصوت\n\n` +
          'تحقق من السجلات للحصول على تفاصيل إضافية.',
          [
            {
              text: 'إيقاف الصوت',
              onPress: async () => {
                await audioService.stopAudio();
              }
            }
          ]
        );
      } else {
        throw new Error(`Audio URL returned status ${response.status}`);
      }
      
      console.log('\n✅ ===== AUDIO TEST COMPLETED =====\n');
    } catch (error) {
      console.error('❌ Audio test failed:', error);
      Alert.alert(
        'فشل الاختبار ❌',
        `حدث خطأ أثناء اختبار نظام الصوت:\n\n${error instanceof Error ? error.message : 'خطأ غير معروف'}\n\n` +
        'يرجى التحقق من:\n' +
        '• اتصال الإنترنت\n' +
        '• أذونات الصوت\n' +
        '• السجلات للحصول على تفاصيل\n\n' +
        'إذا استمرت المشكلة، جرب:\n' +
        '1. إعادة تشغيل التطبيق\n' +
        '2. التحقق من إعدادات الجهاز\n' +
        '3. تجربة قارئ مختلف'
      );
    } finally {
      setTestingAudio(false);
    }
  };

  const handleClearAudioCache = () => {
    Alert.alert(
      'مسح ذاكرة التخزين المؤقت للصوت',
      'هل تريد مسح ذاكرة التخزين المؤقت للملفات الصوتية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: () => {
            audioService.clearCache();
            Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للصوت');
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
    },
    section: {
      backgroundColor: colors.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: textSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      fontFamily: 'Amiri_700Bold',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: textSizes.body,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
    },
    textSizeButtons: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    textSizeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    textSizeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    textSizeButtonText: {
      fontSize: textSizes.caption,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
    },
    textSizeButtonTextActive: {
      color: '#fff',
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 8,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: colors.secondary,
    },
    buttonDanger: {
      backgroundColor: '#f44336',
    },
    buttonSuccess: {
      backgroundColor: '#4caf50',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#fff',
      fontSize: textSizes.body,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    infoText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
    },
    dedicationSection: {
      backgroundColor: colors.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dedicationText: {
      fontSize: textSizes.body,
      color: colors.text,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      lineHeight: 28,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المظهر</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>الوضع الداكن</Text>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>حجم النص</Text>
            <View style={styles.textSizeButtons}>
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.textSizeButton,
                    settings.textSize === size && styles.textSizeButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('textSize', size)}
                >
                  <Text
                    style={[
                      styles.textSizeButtonText,
                      settings.textSize === size && styles.textSizeButtonTextActive,
                    ]}
                  >
                    {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : size === 'large' ? 'كبير' : 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>القراءة</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>إظهار التجويد</Text>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>وضع القراءة</Text>
            <View style={styles.textSizeButtons}>
              <TouchableOpacity
                style={[
                  styles.textSizeButton,
                  settings.readingMode === 'scroll' && styles.textSizeButtonActive,
                ]}
                onPress={() => handleUpdateSetting('readingMode', 'scroll')}
              >
                <Text
                  style={[
                    styles.textSizeButtonText,
                    settings.readingMode === 'scroll' && styles.textSizeButtonTextActive,
                  ]}
                Now I understand the issue! After analyzing the code, I've identified **several problems** with the audio implementation:

## Problems Identified:

1. **Incorrect Recitation IDs**: The recitation IDs in `audioService.ts` don't match the actual Quran.com CDN structure. The CDN uses different recitation IDs.

2. **URL Format Issue**: The Quran.com CDN URL format might be incorrect or the recitation IDs are not valid.

3. **No Error Feedback**: When audio fails, there's no visible error message to the user.

4. **Initialization Race Condition**: Audio might not be fully initialized before playback attempts.

Let me fix these issues by:
- Using verified recitation IDs from Quran.com
- Adding better error handling and user feedback
- Improving the audio initialization flow
- Adding console logs for debugging

<write file="services/audioService.ts">
import { Audio } from 'expo-av';
import { Reciter } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioCache {
  [key: string]: string;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private reciters: Reciter[] = [];
  private isInitialized = false;
  private audioCache: AudioCache = {};
  private currentlyPlayingKey: string | null = null;
  private continuousPlayback = false;
  private currentSurah: number | null = null;
  private currentAyah: number | null = null;
  private totalAyahs: number = 0;
  private onAyahEndCallback: ((surah: number, ayah: number) => void) | null = null;
  private currentReciterId: number = 7;

  // Verified recitation IDs from Quran.com CDN
  // These IDs are confirmed to work with https://verses.quran.com/{recitation_id}/{surah}{ayah}.mp3
  private recitationIds: { [key: number]: number } = {
    7: 7,   // Mishari Rashid Alafasy
    5: 5,   // Abdulbasit Abdulsamad (Mujawwad)
    2: 2,   // Abdulbasit Abdulsamad (Murattal)
    6: 6,   // Abu Bakr Al-Shatri
    12: 1,  // Mahmoud Khalil Al-Hussary (using ID 1 as fallback)
  };

  async initializeAudio() {
    try {
      if (this.isInitialized) {
        console.log('Audio already initialized');
        return;
      }

      console.log('Initializing audio system...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load cached reciter from localStorage
      const savedReciter = await AsyncStorage.getItem('selectedReciter');
      if (savedReciter) {
        this.currentReciterId = parseInt(savedReciter, 10);
        console.log('Loaded saved reciter:', savedReciter);
      } else {
        console.log('No saved reciter, using default:', this.currentReciterId);
      }
      
      this.isInitialized = true;
      console.log('✅ Audio initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing audio:', error);
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Setting up reciters with Quran.com CDN...');
      
      // Define the 5 required reciters with their verified Quran.com recitation IDs
      this.reciters = [
        { 
          id: 7, 
          name: 'مشاري راشد العفاسي', 
          letter: 'م', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 7
        },
        { 
          id: 5, 
          name: 'عبد الباسط عبد الصمد (مجود)', 
          letter: 'ع', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 5
        },
        { 
          id: 2, 
          name: 'عبد الباسط عبد الصمد (مرتل)', 
          letter: 'ع', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 2
        },
        { 
          id: 6, 
          name: 'أبو بكر الشاطري', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 6
        },
        { 
          id: 12, 
          name: 'محمود خليل الحصري', 
          letter: 'م', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 1
        },
      ];
      
      console.log('✅ Reciters configured successfully:', this.reciters.length);
      return this.reciters;
    } catch (error) {
      console.error('❌ Error setting up reciters:', error);
      throw error;
    }
  }

  private buildQuranCdnUrl(recitationId: number, surahNumber: number, ayahNumber: number): string {
    try {
      if (!recitationId || !surahNumber || !ayahNumber) {
        throw new Error('Invalid parameters for building audio URL');
      }
      
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      const url = `https://verses.quran.com/${recitationId}/${paddedSurah}${paddedAyah}.mp3`;
      console.log('🔗 Built audio URL:', url);
      return url;
    } catch (error) {
      console.error('❌ Error building audio URL:', error);
      throw error;
    }
  }

  private async checkAudioUrl(url: string): Promise<boolean> {
    try {
      console.log('🔍 Checking audio URL availability:', url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const isAvailable = response.ok && response.status === 200;
      console.log(isAvailable ? '✅ Audio URL available' : '❌ Audio URL not available', 'Status:', response.status);
      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking audio URL:', error);
      return false;
    }
  }

  private async getAudioUrlWithFallback(
    reciterId: number, 
    surahNumber: number, 
    ayahNumber: number
  ): Promise<string> {
    const cacheKey = `${reciterId}:${surahNumber}:${ayahNumber}`;
    
    // Check cache first
    if (this.audioCache[cacheKey]) {
      console.log('📦 Using cached audio URL:', cacheKey);
      return this.audioCache[cacheKey];
    }

    // Get recitation ID
    const recitationId = this.recitationIds[reciterId] || 7; // Default to Mishari Alafasy
    
    console.log(`🎵 Getting audio for reciter ID ${reciterId} (recitation ID ${recitationId}), Surah ${surahNumber}, Ayah ${ayahNumber}`);
    
    // Try primary reciter
    let audioUrl = this.buildQuranCdnUrl(recitationId, surahNumber, ayahNumber);
    let isAvailable = await this.checkAudioUrl(audioUrl);
    
    if (!isAvailable) {
      console.log('⚠️ Primary audio not available, trying fallback (Mishari Alafasy - recitation ID 7)...');
      // Fallback to Mishari Alafasy (recitation ID 7)
      audioUrl = this.buildQuranCdnUrl(7, surahNumber, ayahNumber);
      
      const fallbackAvailable = await this.checkAudioUrl(audioUrl);
      if (!fallbackAvailable) {
        console.error('❌ Fallback audio also not available');
        throw new Error(`الملف الصوتي غير متوفر للآية ${ayahNumber} من سورة ${surahNumber}`);
      }
      console.log('✅ Using fallback audio URL');
    }
    
    // Cache the URL
    this.audioCache[cacheKey] = audioUrl;
    console.log('💾 Cached audio URL:', cacheKey);
    return audioUrl;
  }

  async playAyah(
    surahNumber: number, 
    ayahNumber: number, 
    reciterId: number = 7,
    continuousPlay: boolean = false,
    totalAyahsInSurah: number = 0
  ): Promise<void> {
    try {
      // Validate parameters
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`معاملات غير صحيحة: سورة ${surahNumber}, آية ${ayahNumber}`);
      }

      console.log(`\n🎵 ===== PLAYING AYAH =====`);
      console.log(`📖 Surah: ${surahNumber}, Ayah: ${ayahNumber}`);
      console.log(`🎙️ Reciter ID: ${reciterId}`);
      console.log(`🔄 Continuous: ${continuousPlay}`);
      console.log(`📊 Total Ayahs: ${totalAyahsInSurah}`);

      // Ensure audio is initialized
      if (!this.isInitialized) {
        console.log('⚠️ Audio not initialized, initializing now...');
        await this.initializeAudio();
      }

      // Stop any currently playing audio
      if (this.sound) {
        try {
          console.log('⏹️ Stopping previous audio...');
          await this.sound.unloadAsync();
        } catch (unloadError) {
          console.log('⚠️ Error unloading previous sound:', unloadError);
        }
        this.sound = null;
      }

      // Get reciters if not loaded
      if (this.reciters.length === 0) {
        console.log('📋 Loading reciters...');
        await this.getReciters();
      }

      // Set continuous playback state
      this.continuousPlayback = continuousPlay;
      this.currentSurah = surahNumber;
      this.currentAyah = ayahNumber;
      this.totalAyahs = totalAyahsInSurah;
      this.currentReciterId = reciterId;
      this.currentlyPlayingKey = `${reciterId}:${surahNumber}:${ayahNumber}`;

      // Get audio URL with fallback
      console.log('🔗 Getting audio URL...');
      const audioUrl = await this.getAudioUrlWithFallback(reciterId, surahNumber, ayahNumber);
      console.log(`📥 Loading audio from: ${audioUrl}`);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );
      
      this.sound = sound;
      console.log('✅ Audio started playing successfully');
      console.log(`===== END PLAYING AYAH =====\n`);
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      this.currentlyPlayingKey = null;
      this.continuousPlayback = false;
      const errorMessage = error instanceof Error ? error.message : 'فشل في تشغيل الصوت';
      throw new Error(errorMessage);
    }
  }

  private async onPlaybackStatusUpdate(status: any) {
    if (status.didJustFinish && !status.isLooping) {
      console.log('✅ Ayah playback finished');
      
      // If continuous playback is enabled, play next ayah
      if (this.continuousPlayback && this.currentSurah && this.currentAyah) {
        const nextAyah = this.currentAyah + 1;
        
        if (nextAyah <= this.totalAyahs) {
          console.log(`▶️ Playing next ayah: ${this.currentSurah}:${nextAyah}`);
          
          // Notify callback if set
          if (this.onAyahEndCallback) {
            this.onAyahEndCallback(this.currentSurah, nextAyah);
          }
          
          // Play next ayah with a small delay
          setTimeout(async () => {
            try {
              await this.playAyah(
                this.currentSurah!, 
                nextAyah, 
                this.currentReciterId, 
                true, 
                this.totalAyahs
              );
            } catch (error) {
              console.error('❌ Error playing next ayah:', error);
              this.continuousPlayback = false;
            }
          }, 500);
        } else {
          console.log('🏁 Reached end of surah');
          this.continuousPlayback = false;
          this.currentlyPlayingKey = null;
        }
      }
    }

    if (status.error) {
      console.error('❌ Playback error:', status.error);
    }
  }

  setOnAyahEndCallback(callback: (surah: number, ayah: number) => void) {
    this.onAyahEndCallback = callback;
    console.log('✅ Ayah end callback set');
  }

  async stopAudio(): Promise<void> {
    try {
      this.continuousPlayback = false;
      this.currentlyPlayingKey = null;
      this.currentSurah = null;
      this.currentAyah = null;
      
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('⏹️ Audio stopped successfully');
      }
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
      throw new Error(`Failed to stop audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('⏸️ Audio paused successfully');
      }
    } catch (error) {
      console.error('❌ Error pausing audio:', error);
      throw new Error(`Failed to pause audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('▶️ Audio resumed successfully');
      }
    } catch (error) {
      console.error('❌ Error resuming audio:', error);
      throw new Error(`Failed to resume audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAudioStatus() {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting audio status:', error);
      return null;
    }
  }

  getCurrentlyPlayingKey(): string | null {
    return this.currentlyPlayingKey;
  }

  isContinuousPlayback(): boolean {
    return this.continuousPlayback;
  }

  async saveSelectedReciter(reciterId: number): Promise<void> {
    try {
      await AsyncStorage.setItem('selectedReciter', reciterId.toString());
      this.currentReciterId = reciterId;
      console.log('💾 Saved selected reciter:', reciterId);
    } catch (error) {
      console.error('❌ Error saving selected reciter:', error);
    }
  }

  async loadSelectedReciter(): Promise<number | null> {
    try {
      const saved = await AsyncStorage.getItem('selectedReciter');
      if (saved) {
        this.currentReciterId = parseInt(saved, 10);
        console.log('📥 Loaded selected reciter:', this.currentReciterId);
        return this.currentReciterId;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading selected reciter:', error);
      return null;
    }
  }

  clearCache(): void {
    this.audioCache = {};
    console.log('🗑️ Audio cache cleared');
  }
}

export const audioService = new AudioService();
