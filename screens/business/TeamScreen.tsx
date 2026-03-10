import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts } from '../../utils/constants';
import PaperBackground from '../../components/PaperBackground';
import { useProfileStore } from '../../store/profileStore';
import {
  getTeamMembers,
  saveTeamMember,
  getTrainingSessions,
  saveTrainingSession,
  calcMonthlyXP,
} from '../../services/TeamService';
import type { TeamMember, TrainingSession, DrillType } from '../../types';
import { generateId } from '../../utils/idGenerator';
import FormField from '../../components/business/FormField';
import BottomSheet from '../../components/business/BottomSheet';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<TeamMember['role'], string> = {
  barista: 'Barista',
  head_barista: 'Head Barista',
  manager: 'Manager',
};

const DRILL_TYPES: DrillType[] = [
  'espresso_workflow', 'milk_texture', 'cupping',
  'latte_art', 'customer_service', 'custom',
];
const DRILL_LABELS: Record<DrillType, string> = {
  espresso_workflow: 'Espresso Workflow',
  milk_texture: 'Milk Texture',
  cupping: 'Cupping',
  latte_art: 'Latte Art',
  customer_service: 'Customer Service',
  custom: 'Custom',
};

const MEMBER_ROLES: TeamMember['role'][] = ['barista', 'head_barista', 'manager'];

// Max XP a member can reasonably accumulate in a month (for bar width calc)
const MAX_XP = 500;

function XPBar({ xp }: { xp: number }) {
  const pct = Math.min(xp / MAX_XP, 1);
  return (
    <View style={xpStyles.track}>
      <View style={[xpStyles.fill, { width: `${Math.round(pct * 100)}%` as any }]} />
    </View>
  );
}

const xpStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  fill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TeamScreen() {
  const { profile } = useProfileStore();
  const userUid = profile?.uid ?? '';

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showLogSession, setShowLogSession] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    const [m, s] = await Promise.all([
      getTeamMembers(userUid),
      getTrainingSessions(userUid),
    ]);
    setMembers(m);
    setSessions(s);
  }, [userUid]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const recentSessions = [...sessions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Team</Text>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setShowAddMember(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Roster */}
          <Text style={styles.sectionLabel}>Roster</Text>
          {members.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No team members yet.{'\n'}Tap + to add one.</Text>
            </View>
          ) : (
            members.map((member) => {
              const xp = calcMonthlyXP(sessions, member.id);
              const lastSession = sessions
                .filter((s) => s.memberId === member.id)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
              const memberSessions = sessions.filter((s) => s.memberId === member.id);
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {member.name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{ROLE_LABELS[member.role]}</Text>
                      </View>
                    </View>
                    <View style={styles.xpBox}>
                      <Text style={styles.xpNum}>{xp}</Text>
                      <Text style={styles.xpLabel}>XP this mo.</Text>
                    </View>
                  </View>
                  <XPBar xp={xp} />
                  {lastSession && (
                    <Text style={styles.lastText}>
                      Last session: {DRILL_LABELS[lastSession.drillType]} ·{' '}
                      {new Date(lastSession.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                  <View style={styles.drillTags}>
                    {Object.entries(
                      memberSessions.reduce<Record<string, number>>((acc, s) => {
                        acc[s.drillType] = (acc[s.drillType] ?? 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([drill, count]) => (
                        <View key={drill} style={styles.drillTag}>
                          <Text style={styles.drillTagText}>
                            {DRILL_LABELS[drill as DrillType]} ×{count}
                          </Text>
                        </View>
                      ))}
                  </View>
                  <TouchableOpacity
                    style={styles.logButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedMember(member);
                      setShowLogSession(true);
                    }}
                  >
                    <Text style={styles.logButtonText}>Log Session</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {/* Recent Activity */}
          {recentSessions.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Recent Activity</Text>
              {recentSessions.map((s) => {
                const member = members.find((m) => m.id === s.memberId);
                return (
                  <View key={s.id} style={styles.activityRow}>
                    <View style={styles.activityDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityName}>{member?.name ?? 'Unknown'}</Text>
                        {' — '}{DRILL_LABELS[s.drillType]}
                        {s.focusArea ? ` · ${s.focusArea}` : ''}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {s.durationMinutes} min · Score {s.managerScore ?? s.selfScore}/5 ·{' '}
                        {new Date(s.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <AddMemberModal
          visible={showAddMember}
          onClose={() => setShowAddMember(false)}
          onSave={async (member) => {
            await saveTeamMember(userUid, member);
            setShowAddMember(false);
            load();
          }}
        />

        <LogSessionModal
          visible={showLogSession}
          member={selectedMember}
          onClose={() => { setShowLogSession(false); setSelectedMember(null); }}
          onSave={async (session) => {
            await saveTrainingSession(userUid, session);
            setShowLogSession(false);
            setSelectedMember(null);
            load();
          }}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}

// ── Add Member Modal ──────────────────────────────────────────────────────────

function AddMemberModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (member: TeamMember) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('barista');
  const [saving, setSaving] = useState(false);

  function reset() { setName(''); setRole('barista'); setSaving(false); }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ id: generateId(), name: name.trim(), role });
    reset();
  }

  return (
    <BottomSheet
      visible={visible}
      onCancel={() => { reset(); onClose(); }}
      title="Add Team Member"
      saveLabel="Add Member"
      onSave={handleSave}
      saveDisabled={!name.trim()}
      saving={saving}
    >
      <FormField label="Name *" value={name} onChange={setName} placeholder="Jane Smith" />

      <Text style={styles.fieldLabel}>Role</Text>
      <View style={styles.chipRow}>
        {MEMBER_ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, role === r && styles.chipSelected]}
            onPress={() => setRole(r)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, role === r && styles.chipTextSelected]}>
              {ROLE_LABELS[r]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

// ── Log Session Modal ─────────────────────────────────────────────────────────

function LogSessionModal({
  visible,
  member,
  onClose,
  onSave,
}: {
  visible: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (session: TrainingSession) => Promise<void>;
}) {
  const [drillType, setDrillType] = useState<DrillType>('espresso_workflow');
  const [duration, setDuration] = useState('30');
  const [focusArea, setFocusArea] = useState('');
  const [selfScore, setSelfScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [managerScore, setManagerScore] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setDrillType('espresso_workflow'); setDuration('30'); setFocusArea('');
    setSelfScore(3); setManagerScore(undefined); setNotes(''); setSaving(false);
  }

  async function handleSave() {
    if (!member) return;
    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins <= 0) return;
    setSaving(true);
    await onSave({
      id: generateId(),
      memberId: member.id,
      createdAt: new Date().toISOString(),
      drillType,
      durationMinutes: mins,
      focusArea: focusArea.trim(),
      selfScore,
      ...(managerScore !== undefined ? { managerScore } : {}),
      notes: notes.trim(),
      tags: [],
    } as TrainingSession);
    reset();
  }

  return (
    <BottomSheet
      visible={visible}
      onCancel={() => { reset(); onClose(); }}
      title="Log Training Session"
      subtitle={member?.name}
      saveLabel="Log Session"
      onSave={handleSave}
      saving={saving}
    >
      <Text style={styles.fieldLabel}>Drill Type</Text>
      <View style={styles.chipRow}>
        {DRILL_TYPES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, drillType === d && styles.chipSelected]}
            onPress={() => setDrillType(d)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, drillType === d && styles.chipTextSelected]}>
              {DRILL_LABELS[d]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FormField label="Duration (minutes)" value={duration} onChange={setDuration} placeholder="30" numeric />
      <FormField label="Focus Area" value={focusArea} onChange={setFocusArea} placeholder="Milk steam consistency" />

      <ScoreRow label="Self Score" score={selfScore} onChange={setSelfScore} />
      <ScoreRow
        label="Manager Score (optional)"
        score={managerScore}
        onChange={(v) => setManagerScore(v)}
        optional
      />

      <FormField label="Notes" value={notes} onChange={setNotes} placeholder="Observations…" multiline />
    </BottomSheet>
  );
}

// ── Score Row ─────────────────────────────────────────────────────────────────

function ScoreRow({
  label,
  score,
  onChange,
  optional,
}: {
  label: string;
  score: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (v: any) => void;
  optional?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.scoreBtn,
              score === n && styles.scoreBtnSelected,
            ]}
            onPress={() => onChange(score === n && optional ? undefined : n)}
            activeOpacity={0.8}
          >
            <Text style={[styles.scoreBtnText, score === n && styles.scoreBtnTextSelected]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontSize: 24, color: '#000', lineHeight: 28 },
  sectionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  memberCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  memberTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Fonts.mono,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  roleBadgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  xpBox: { alignItems: 'flex-end' },
  xpNum: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Fonts.mono,
  },
  xpLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: Fonts.mono },
  lastText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 8,
  },
  drillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  drillTag: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  drillTagText: { fontSize: 10, color: Colors.textSecondary, fontFamily: Fonts.mono },
  logButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  logButtonText: { fontSize: 13, color: Colors.primary, fontFamily: Fonts.mono },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 5,
  },
  activityText: { fontSize: 13, color: Colors.text, fontFamily: Fonts.mono, lineHeight: 18 },
  activityName: { fontWeight: '700', color: Colors.primary },
  activityMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  // Chip picker (screen-level, used inside modal children)
  fieldLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
  chipText: { fontSize: 12, color: Colors.text, fontFamily: Fonts.mono },
  chipTextSelected: { color: Colors.primary },
  scoreBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
  scoreBtnText: { fontSize: 16, color: Colors.text, fontFamily: Fonts.mono },
  scoreBtnTextSelected: { color: Colors.primary, fontWeight: '700' },
});
