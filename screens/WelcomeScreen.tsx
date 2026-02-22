import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthColors, Fonts } from '../utils/constants';
import { GoldButton } from '../components/GoldGradient';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandSection}>
          <Text style={styles.title}>ULLY AI</Text>
          <Text style={styles.subtitle}>your coffee companion</Text>
        </View>

        <View style={styles.buttonSection}>
          <GoldButton
            label="Sign In"
            onPress={() => navigation.navigate('Login')}
          />

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.8}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  brandSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    color: '#C8923C',
    fontFamily: Fonts.retro,
    letterSpacing: 4,
    textShadowColor: 'rgba(200, 146, 60, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: AuthColors.textSecondary,
    marginTop: 14,
    fontFamily: Fonts.mono,
    letterSpacing: 2,
  },
  buttonSection: {
    gap: 12,
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: AuthColors.buttonOutline,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: AuthColors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
});
