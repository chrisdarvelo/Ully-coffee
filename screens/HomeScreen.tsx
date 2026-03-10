import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { auth } from '../services/FirebaseConfig';
import { Colors, Fonts } from '../utils/constants';
import CoffeeFlower from '../components/CoffeeFlower';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TIPS = [
  'Dial in your espresso with Ully.',
  'Ask about water chemistry, grind, or extraction.',
  'Ully knows your beans. Just ask.',
  'What are you brewing today?',
  'Questions about latte art? Go ahead.',
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const user = auth.currentUser;
  const firstName = user?.email
    ? (user.displayName?.split(' ')[0] ?? user.email.split('@')[0] ?? 'barista')
    : 'barista';

  const tipIndex = new Date().getHours() % TIPS.length;
  const tip = TIPS[tipIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <CoffeeFlower size={64} />
          <Text style={styles.wordmark}>ULLY</Text>
          <Text style={styles.tagline}>your coffee companion</Text>
        </View>

        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting}>
            good {getTimeOfDay()},{' '}
            <Text style={styles.greetingName}>{firstName}.</Text>
          </Text>
          <Text style={styles.tip}>{tip}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('AI')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>ask ully</Text>
        </TouchableOpacity>

        {/* Footer hint */}
        <Text style={styles.hint}>
          tap the <Text style={styles.hintBold}>✦</Text> tab anytime to chat
        </Text>

      </View>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 48,
  },
  wordmark: {
    fontFamily: Fonts.mono,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 8,
    marginTop: 16,
  },
  tagline: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'lowercase',
    marginTop: 6,
  },
  greetingWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  greetingName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tip: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 4,
    marginBottom: 24,
  },
  ctaText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.background,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  hint: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.textSecondary,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  hintBold: {
    color: Colors.primary,
    opacity: 1,
  },
});
