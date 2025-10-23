
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Simple Clean Design System Colors
export const colors = {
  // Primary Colors
  background: '#ffffff',
  backgroundAlt: '#f5f5f5',
  surface: '#ffffff',
  primary: '#2196F3',
  secondary: '#757575',
  accent: '#FF6B6B',
  
  // Text Colors
  text: '#212121',
  textSecondary: '#757575',
  
  // UI Colors
  border: '#e0e0e0',
  card: '#ffffff',
  shadow: '#000000',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196F3',
  
  // Special Colors
  gold: '#FFD700',
  emerald: '#50C878',
  cream: '#FFFDD0',
  darkBrown: '#654321',
  mutedBrown: '#8B7355',
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
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
    color: '#ffffff',
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
