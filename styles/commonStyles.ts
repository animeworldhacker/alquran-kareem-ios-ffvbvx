
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Elegant Ornate Design System Colors
export const colors = {
  // Primary Colors
  background: '#F5EEE3',        // Parchment cream
  backgroundAlt: '#F5EEE3',     // Parchment cream
  surface: '#F5EEE3',           // Parchment cream
  primary: '#1E5B4C',           // Emerald/teal
  secondary: '#6D6558',         // Muted brown
  accent: '#D4AF37',            // Rich gold
  
  // Text Colors
  text: '#2C2416',              // Dark brown
  textSecondary: '#6D6558',     // Muted brown
  
  // UI Colors
  border: '#D4AF37',            // Rich gold
  card: '#F5EEE3',              // Parchment cream
  shadow: '#000000',
  error: '#C62828',
  success: '#2E7D32',
  warning: '#F57C00',
  info: '#1976D2',
  
  // Special Colors
  gold: '#D4AF37',              // Rich gold
  emerald: '#1E5B4C',           // Emerald/teal
  cream: '#F5EEE3',             // Parchment cream
  darkBrown: '#2C2416',         // Dark brown
  mutedBrown: '#6D6558',        // Muted brown
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
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
    fontWeight: '800',
    textAlign: 'center',
    color: colors.gold,
    marginBottom: 10,
    fontFamily: 'Amiri_700Bold',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
  },
  arabicText: {
    fontSize: 26,
    fontWeight: '400',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 48,
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
    borderColor: colors.gold,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.gold,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
