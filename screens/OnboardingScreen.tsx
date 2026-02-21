import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { auth } from '../services/FirebaseConfig';
import { saveProfile } from '../services/ProfileService';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import PaperBackground from '../components/PaperBackground';
import CoffeeFlower from '../components/CoffeeFlower';
import { GoldButton, GoldGradient } from '../components/GoldGradient';
import { UserRole, UserProfile } from '../types';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const ROLES: { key: UserRole; emoji: string; name: string; tagline: string }[] = [
  { key: 'consumer', emoji: '☕', name: 'Consumer', tagline: 'Coffee lover' },
  { key: 'barista', emoji: '🎨', name: 'Barista', tagline: 'Coffee professional' },
  { key: 'organization', emoji: '🏢', name: 'Organization', tagline: 'Business account' },
];

const QUESTIONS: Record<UserRole, any[]> = {
  consumer: [
    {
      key: 'dailyCoffees',
      label: 'How many coffees a day?',
      chips: [
        { label: '1', value: '1' },
        { label: '3', value: '3' },
        { label: 'More', value: 'more' },
      ],
    },
    {
      key: 'favoriteMethod',
      label: 'Favorite brew method?',
      chips: [
        { label: 'Drip', value: 'drip' },
        { label: 'Espresso', value: 'espresso' },
        { label: 'Pour over', value: 'pour_over' },
      ],
    },
    {
      key: 'drinkAt',
      label: 'Where do you drink?',
      chips: [
        { label: 'At home', value: 'home' },
        { label: 'Go out', value: 'go_out' },
      ],
    },
  ],
  barista: [
    {
      key: 'skillLevel',
      label: 'Your skill level?',
      chips: [
        { label: 'Amateur', value: 'amateur' },
        { label: 'Semi-pro', value: 'semi_pro' },
        { label: 'Champion', value: 'champion' },
      ],
    },
    {
      key: 'baristaMethod',
      label: 'Favorite method?',
      chips: [
        { label: 'Espresso', value: 'espresso' },
        { label: 'Pour over', value: 'pour_over' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      key: 'favoriteRoaster',
      label: 'Favorite roaster?',
      isText: true,
      optional: true,
    },
  ],
  organization: [
    {
      key: 'employeeCount',
      label: 'Team size?',
      chips: [
        { label: '~10', value: '10' },
        { label: '~50', value: '50' },
        { label: '50+', value: 'more' },
      ],
    },
    {
      key: 'orgType',
      label: 'Type?',
      chips: [
        { label: 'Roaster', value: 'roaster' },
        { label: 'Café', value: 'cafe' },
        { label: 'Distributor', value: 'distributor' },
      ],
    },
    {
      key: 'businessType',
      label: 'Business model?',
      chips: [
        { label: 'Retailer', value: 'retailer' },
        { label: 'Wholesaler', value: 'wholesaler' },
      ],
    },
  ],
};

const COMPLETION_SUBTITLES: Record<UserRole, string> = {
  consumer: 'Your personalized coffee feed is ready.',
  barista: 'Your professional workspace is ready.',
  organization: 'Your business dashboard is ready.',
};

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const user = auth.currentUser;

  const setAnswer = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const validateUsername = (val: string) => {
    if (!USERNAME_REGEX.test(val)) {
      setUsernameError('Letters, numbers and underscores only • 3–20 chars');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const questionsForRole = role ? QUESTIONS[role] : [];

  const allRequiredAnswered = () => {
    return questionsForRole.every((q) => {
      if (q.optional) return true;
      return !!answers[q.key];
    });
  };

  const handleFinish = async () => {
    if (!user || !role) return;
    setSaving(true);
    const tierMap: Record<UserRole, 'free' | 'pro' | 'business'> = { 
      consumer: 'free', 
      barista: 'free', 
      organization: 'free' 
    };
    try {
      await saveProfile(user.uid, { 
        username, 
        role, 
        tier: tierMap[role], 
        ...answers as any // Partial profile data
      });
      navigation.replace('Tabs');
    } catch {
      setSaving(false);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <PaperBackground>
        <View style={styles.container}>
          <View style={styles.center}>
            <CoffeeFlower size={100} />
            <Text style={styles.title}>Let's dial in{'\n'}your profile</Text>
            <Text style={styles.subtitle}>
              A few quick questions to personalize your experience.
            </Text>
            <GoldButton
              label="Get Started"
              onPress={() => setStep(1)}
              style={{ borderRadius: 10, marginTop: 24 }}
            />
          </View>
        </View>
      </PaperBackground>
    );
  }

  // ── Step 1: Username ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <PaperBackground>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>Step 1 / 4</Text>
            <Text style={styles.stepTitle}>Choose your username</Text>
            <Text style={styles.stepHint}>
              Letters, numbers and underscores only • 3–20 chars
            </Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                if (usernameError) validateUsername(val);
              }}
              placeholder="your_name"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (validateUsername(username)) setStep(2);
              }}
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
            <GoldButton
              label="Continue"
              onPress={() => {
                if (validateUsername(username)) setStep(2);
              }}
              disabled={!username.trim()}
              style={{ borderRadius: 10, marginTop: 24 }}
            />
          </View>
        </KeyboardAvoidingView>
      </PaperBackground>
    );
  }

  // ── Step 2: Role Picker ──────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <PaperBackground>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stepLabel}>Step 2 / 4</Text>
            <Text style={styles.stepTitle}>I am a...</Text>

            {ROLES.map((r) => {
              const selected = role === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  activeOpacity={0.8}
                  onPress={() => {
                    setRole(r.key);
                    setAnswers({});
                    setStep(3);
                  }}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <View style={styles.roleTextBlock}>
                    <Text style={styles.roleName}>{r.name}</Text>
                    <Text style={styles.roleTagline}>{r.tagline}</Text>
                  </View>
                  <Text style={styles.roleArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </PaperBackground>
    );
  }

  // ── Step 3: Questions ────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <PaperBackground>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.stepLabel}>Step 3 / 4</Text>
            <Text style={styles.stepTitle}>A bit more about you</Text>

            {questionsForRole.map((q) => (
              <View key={q.key} style={styles.questionBlock}>
                <Text style={styles.questionLabel}>{q.label}</Text>

                {q.isText ? (
                  <TextInput
                    style={styles.input}
                    value={answers[q.key] || ''}
                    onChangeText={(val) => setAnswer(q.key, val)}
                    placeholder="Optional"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                  />
                ) : (
                  <View style={styles.chipRow}>
                    {q.chips.map((chip: any) => {
                      const selected = answers[q.key] === chip.value;
                      return (
                        <TouchableOpacity
                          key={chip.value}
                          activeOpacity={0.8}
                          onPress={() => setAnswer(q.key, chip.value)}
                          style={[styles.chip, selected && styles.chipSelected]}
                        >
                          {selected ? (
                            <GoldGradient style={styles.chipGradient}>
                              <Text style={[styles.chipText, styles.chipTextSelected]}>
                                {chip.label}
                              </Text>
                            </GoldGradient>
                          ) : (
                            <Text style={styles.chipText}>{chip.label}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}

            <GoldButton
              label="Continue"
              onPress={() => setStep(4)}
              disabled={!allRequiredAnswered()}
              style={{ borderRadius: 10, marginTop: 32 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </PaperBackground>
    );
  }

  // ── Step 4: Completion ───────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <PaperBackground>
        <View style={styles.container}>
          <View style={styles.center}>
            <CoffeeFlower size={100} spinning />
            <Text style={styles.title}>Welcome, @{username}</Text>
            <Text style={styles.subtitle}>
              {role ? COMPLETION_SUBTITLES[role] : ''}
            </Text>
            <GoldButton
              label={saving ? 'Saving...' : 'Enter the Feed'}
              onPress={handleFinish}
              disabled={saving}
              style={{ borderRadius: 10, marginTop: 24 }}
            />
          </View>
        </View>
      </PaperBackground>
    );
  }

  return null;
}

const GOLD = Colors.primary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    marginTop: 12,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 20,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 6,
    lineHeight: 30,
  },
  stepHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginBottom: 24,
  },
  input: {
    backgroundColor: AuthColors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: Fonts.mono,
    color: Colors.text,
  },
  inputError: {
    borderColor: AuthColors.error,
  },
  errorText: {
    fontSize: 12,
    color: AuthColors.error,
    fontFamily: Fonts.mono,
    marginTop: 6,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  roleCardSelected: {
    borderColor: GOLD,
  },
  roleEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  roleTextBlock: {
    flex: 1,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  roleTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  roleArrow: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
  },
  questionBlock: {
    marginTop: 24,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: GOLD,
  },
  chipGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipText: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 13,
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  chipTextSelected: {
    color: AuthColors.buttonText,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
