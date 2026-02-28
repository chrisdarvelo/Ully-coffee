import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/FirebaseConfig';
import { AuthColors, Fonts } from '../utils/constants';
import { validatePassword, validateEmail } from '../utils/validation';
import CoffeeFlower from '../components/CoffeeFlower';
import { GoldButton } from '../components/GoldGradient';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MIN_AGE = 13;

function getAge(year, month, day) {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Age verification
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleCreateAccount = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Age validation
    const month = parseInt(birthMonth, 10);
    const day = parseInt(birthDay, 10);
    const year = parseInt(birthYear, 10);

    if (!month || !day || !year || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
      Alert.alert('Error', 'Please enter a valid date of birth.');
      return;
    }
    // Reject impossible dates (Feb 30, Nov 31, etc.) — JS Date silently overflows these.
    const parsed = new Date(year, month - 1, day);
    if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      Alert.alert('Error', 'Please enter a valid date of birth.');
      return;
    }

    const age = getAge(year, month, day);
    if (age < MIN_AGE) {
      Alert.alert(
        'Age Requirement',
        `You must be at least ${MIN_AGE} years old to use Ully. Please come back when you're older!`
      );
      return;
    }

    if (!agreedToPrivacy) {
      Alert.alert('Privacy Policy', 'Please agree to the Privacy Policy to continue.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      Alert.alert('Weak Password', passwordCheck.message);
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(user);
      Alert.alert(
        'Verification Email Sent',
        'Please check your inbox and click the verification link to activate your account.'
      );
    } catch (error) {
      let message = 'An error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      }
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>ULLY AI</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Ully AI</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Date of Birth */}
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <View style={styles.dobRow}>
              <TextInput
                style={[styles.input, styles.dobInput]}
                placeholder="MM"
                placeholderTextColor="#999"
                value={birthMonth}
                onChangeText={(t) => setBirthMonth(t.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dobInput]}
                placeholder="DD"
                placeholderTextColor="#999"
                value={birthDay}
                onChangeText={(t) => setBirthDay(t.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dobInputYear]}
                placeholder="YYYY"
                placeholderTextColor="#999"
                value={birthYear}
                onChangeText={(t) => setBirthYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <Text style={styles.dobHint}>You must be at least 13 years old</Text>

            {/* Privacy Policy Consent */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
                {agreedToPrivacy && <Text style={styles.checkmark}>&#10003;</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text
                  style={styles.privacyLink}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <GoldButton
              label="Create Account"
              onPress={handleCreateAccount}
              disabled={loading}
              loading={loading}
              loadingComponent={<CoffeeFlower size={24} spinning />}
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  wordmark: {
    fontSize: 20,
    color: '#C8923C',
    fontFamily: Fonts.retro,
    letterSpacing: 3,
    textShadowColor: 'rgba(200, 146, 60, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: AuthColors.text,
    fontFamily: Fonts.mono,
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    marginTop: 6,
    fontFamily: Fonts.mono,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: AuthColors.inputBorder,
    backgroundColor: AuthColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AuthColors.text,
    fontFamily: Fonts.mono,
  },
  fieldLabel: {
    fontSize: 13,
    color: AuthColors.textSecondary,
    fontFamily: Fonts.mono,
    fontWeight: '600',
    marginBottom: -8,
  },
  dobRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dobInput: {
    flex: 1,
    textAlign: 'center',
  },
  dobInputYear: {
    flex: 1.5,
    textAlign: 'center',
  },
  dobHint: {
    fontSize: 12,
    color: AuthColors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: -8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AuthColors.inputBorder,
    backgroundColor: AuthColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: AuthColors.buttonFill,
    borderColor: AuthColors.buttonFill,
  },
  checkmark: {
    color: AuthColors.buttonText,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: AuthColors.text,
    fontFamily: Fonts.mono,
    lineHeight: 20,
  },
  privacyLink: {
    color: AuthColors.link,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: AuthColors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.mono,
  },
  linkText: {
    color: AuthColors.link,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
});
