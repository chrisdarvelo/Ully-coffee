import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Machine, ServiceRecord } from '../types';

const MACHINES_PREFIX = '@ully_machines_';
const RECORDS_PREFIX = '@ully_service_records_';

function machinesKey(uid: string) { return `${MACHINES_PREFIX}${uid}`; }
function recordsKey(uid: string) { return `${RECORDS_PREFIX}${uid}`; }

// ── Machines ─────────────────────────────────────────────────────────────────

export async function getMachines(uid: string): Promise<Machine[]> {
  try {
    const raw = await AsyncStorage.getItem(machinesKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMachine(uid: string, machine: Machine): Promise<Machine[]> {
  const machines = await getMachines(uid);
  const idx = machines.findIndex((m) => m.id === machine.id);
  if (idx >= 0) {
    machines[idx] = machine;
  } else {
    machines.push(machine);
  }
  await AsyncStorage.setItem(machinesKey(uid), JSON.stringify(machines));
  return machines;
}

export async function deleteMachine(uid: string, machineId: string): Promise<Machine[]> {
  const machines = (await getMachines(uid)).filter((m) => m.id !== machineId);
  await AsyncStorage.setItem(machinesKey(uid), JSON.stringify(machines));
  return machines;
}

// ── Service Records ───────────────────────────────────────────────────────────

export async function getServiceRecords(uid: string): Promise<ServiceRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(recordsKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getServiceRecordsForMachine(
  uid: string,
  machineId: string
): Promise<ServiceRecord[]> {
  const all = await getServiceRecords(uid);
  return all.filter((r) => r.machineId === machineId);
}

export async function saveServiceRecord(
  uid: string,
  record: ServiceRecord
): Promise<ServiceRecord[]> {
  const records = await getServiceRecords(uid);
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  await AsyncStorage.setItem(recordsKey(uid), JSON.stringify(records));
  return records;
}

export async function deleteServiceRecord(
  uid: string,
  recordId: string
): Promise<ServiceRecord[]> {
  const records = (await getServiceRecords(uid)).filter((r) => r.id !== recordId);
  await AsyncStorage.setItem(recordsKey(uid), JSON.stringify(records));
  return records;
}
