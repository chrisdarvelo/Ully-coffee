import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TeamMember, TrainingSession } from '../types';

const MEMBERS_PREFIX = '@ully_team_members_';
const LOGS_PREFIX = '@ully_training_logs_';

function membersKey(uid: string) { return `${MEMBERS_PREFIX}${uid}`; }
function logsKey(uid: string) { return `${LOGS_PREFIX}${uid}`; }

// ── Team Members ──────────────────────────────────────────────────────────────

export async function getTeamMembers(uid: string): Promise<TeamMember[]> {
  try {
    const raw = await AsyncStorage.getItem(membersKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTeamMember(uid: string, member: TeamMember): Promise<TeamMember[]> {
  const members = await getTeamMembers(uid);
  const idx = members.findIndex((m) => m.id === member.id);
  if (idx >= 0) {
    members[idx] = member;
  } else {
    members.push(member);
  }
  await AsyncStorage.setItem(membersKey(uid), JSON.stringify(members));
  return members;
}

export async function deleteTeamMember(uid: string, memberId: string): Promise<TeamMember[]> {
  const members = (await getTeamMembers(uid)).filter((m) => m.id !== memberId);
  await AsyncStorage.setItem(membersKey(uid), JSON.stringify(members));
  return members;
}

// ── Training Sessions ─────────────────────────────────────────────────────────

export async function getTrainingSessions(uid: string): Promise<TrainingSession[]> {
  try {
    const raw = await AsyncStorage.getItem(logsKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getTrainingSessionsForMember(
  uid: string,
  memberId: string
): Promise<TrainingSession[]> {
  const all = await getTrainingSessions(uid);
  return all.filter((s) => s.memberId === memberId);
}

export async function saveTrainingSession(
  uid: string,
  session: TrainingSession
): Promise<TrainingSession[]> {
  const sessions = await getTrainingSessions(uid);
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await AsyncStorage.setItem(logsKey(uid), JSON.stringify(sessions));
  return sessions;
}

export async function deleteTrainingSession(
  uid: string,
  sessionId: string
): Promise<TrainingSession[]> {
  const sessions = (await getTrainingSessions(uid)).filter((s) => s.id !== sessionId);
  await AsyncStorage.setItem(logsKey(uid), JSON.stringify(sessions));
  return sessions;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Total XP points for a member this month (duration × managerScore or selfScore). */
export function calcMonthlyXP(sessions: TrainingSession[], memberId: string): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return sessions
    .filter((s) => s.memberId === memberId && s.createdAt >= monthStart)
    .reduce((sum, s) => sum + s.durationMinutes * (s.managerScore ?? s.selfScore), 0);
}
