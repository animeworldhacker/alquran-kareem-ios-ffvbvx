
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Elegant Ornate Islamic Design System Colors
export const colors = {
  // Primary Colors - Emerald and Gold Theme
  background: '#F5EEE3', // Parchment cream
  backgroundAlt: '#F5EEE3',
  surface: '#1E5B4C', // Emerald
  primary: '#1E5B4C', // Emerald
  secondary: '#D4AF37', // Rich gold
  accent: '#D4AF37', // Rich gold
  
  // Text Colors
  text: '#2C2416', // Dark brown
  textSecondary: '#6D6558', // Muted brown
  
  // UI Colors
  border: '#D4AF37', // Gold borders
  card: '#F5EEE3', // Cream for cards
  shadow: '#000000',
  error: '#C62828',
  success: '#2E7D32',
  warning: '#F57C00',
  info: '#1976D2',
  
  // Special Colors
  gold: '#D4AF37',
  emerald: '#1E5B4C',
  cream: '#F5EEE3',
  darkBrown: '#2C2416',
  mutedBrown: '#6D6558',
  
  // Frosted glass effect
  frostedGlass: 'rgba(245, 238, 227, 0.95)',
  
  // Verse number colors
  verseNumberBg: '#D4AF37',
  verseNumberBorder: '#1E5B4C',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillButton: {
    backgroundColor: colors.emerald,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pillButtonText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Amiri_700Bold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
  },
  arabicText: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 42,
    fontFamily: 'ScheherazadeNew_400Regular',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 0,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gold,
    fontFamily: 'Amiri_700Bold',
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
