
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// iQuran-inspired color palette
export const colors = {
  // Primary colors - Deep emerald green and gold
  primary: '#1B5E20',           // Deep emerald green
  primaryDark: '#0D3D13',       // Darker green
  primaryLight: '#2E7D32',      // Lighter green
  gold: '#D4AF37',              // Gold accent
  goldDark: '#B8941F',          // Darker gold
  goldLight: '#E5C158',         // Lighter gold
  
  // Background colors
  background: '#0F1419',        // Very dark background for dark mode
  backgroundLight: '#F5F5F0',   // Light cream for light mode
  backgroundAlt: '#1A2027',     // Alternative dark background
  backgroundAltLight: '#FAFAF5', // Alternative light background
  
  // Surface colors
  surface: '#1E2732',           // Dark surface
  surfaceLight: '#FFFFFF',      // Light surface
  surfaceElevated: '#2A3441',   // Elevated dark surface
  surfaceElevatedLight: '#F8F8F3', // Elevated light surface
  
  // Text colors
  text: '#E8E6E3',              // Light text for dark mode
  textLight: '#2C2C2C',         // Dark text for light mode
  textSecondary: '#B0ADA8',     // Secondary text dark mode
  textSecondaryLight: '#757575', // Secondary text light mode
  textMuted: '#6B6B6B',         // Muted text
  
  // Border colors
  border: '#2A3441',            // Dark border
  borderLight: '#E0E0D8',       // Light border
  divider: '#3A4451',           // Divider dark
  dividerLight: '#D5D5CC',      // Divider light
  
  // Semantic colors
  accent: '#D4AF37',            // Gold accent
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  
  // Special colors
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Quran-specific colors
  ayahNumber: '#D4AF37',        // Gold for ayah numbers
  bismillah: '#1B5E20',         // Green for bismillah
  selectedAyah: 'rgba(212, 175, 55, 0.15)', // Gold tint for selected ayah
};

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  goldButton: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(212, 175, 55, 0.3)',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
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
  
  // Typography
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
    fontSize: 22,
    fontWeight: '400',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 40,
    fontFamily: 'ScheherazadeNew_700Bold',
  },
  
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    width: '100%',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  cardLight: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    width: '100%',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  
  // Headers
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gold,
    fontFamily: 'Amiri_700Bold',
  },
  
  // Layout helpers
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    width: '100%',
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.dividerLight,
    width: '100%',
  },
  
  // Prayer mat pattern background
  prayerMatBackground: {
    backgroundColor: colors.background,
    backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(212, 175, 55, 0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
});
