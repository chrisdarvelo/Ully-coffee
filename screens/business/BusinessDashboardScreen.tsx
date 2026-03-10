import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors, Fonts } from '../../utils/constants';
import PaperBackground from '../../components/PaperBackground';
import { useProfileStore } from '../../store/profileStore';

const AI_PROMPT =
  "Based on my team's recent training and maintenance schedule, what should I prioritize this week?";

const KPI_CARDS = [
  { label: 'Revenue', icon: '💰', locked: true },
  { label: 'Covers', icon: '☕', locked: true },
  { label: 'Machine Status', icon: '⚙️', locked: false },
];

export default function BusinessDashboardScreen({ navigation }: { navigation: any }) {
  const { profile } = useProfileStore();
  const greeting = getGreeting();
  const name = profile?.username ?? 'there';

  function navigateToAI() {
    navigation.navigate('AI', { prefill: AI_PROMPT });
  }

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>@{name}</Text>
          <Text style={styles.subtitle}>Here's your café overview.</Text>

          <View style={styles.kpiRow}>
            {KPI_CARDS.map((card) => (
              <View key={card.label} style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>{card.icon}</Text>
                <Text style={styles.kpiLabel}>{card.label}</Text>
                {card.locked ? (
                  <Text style={styles.kpiLocked}>Connect POS{'\n'}to unlock</Text>
                ) : (
                  <Text style={styles.kpiValue}>—</Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ask Ully AI</Text>
          <Text style={styles.sectionHint}>
            Get operational advice based on your team and machine data.
          </Text>
          <TouchableOpacity style={styles.aiButton} activeOpacity={0.8} onPress={navigateToAI}>
            <Text style={styles.aiButtonText}>What should I prioritize this week?</Text>
            <Text style={styles.aiArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonTitle}>POS Integration — Phase 3</Text>
            <Text style={styles.comingSoonBody}>
              Connect Square or Lightspeed to unlock real-time revenue, cover counts,
              and product mix analytics.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48 },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 4,
    marginBottom: 24,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  kpiIcon: { fontSize: 22, marginBottom: 4 },
  kpiLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  kpiLocked: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginBottom: 14,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  aiButtonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Fonts.mono,
  },
  aiArrow: {
    fontSize: 22,
    color: Colors.primary,
    fontFamily: Fonts.mono,
  },
  comingSoonCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  comingSoonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  comingSoonBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    lineHeight: 20,
  },
});
