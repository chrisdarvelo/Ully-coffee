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
  getMachines,
  saveMachine,
  getServiceRecords,
  saveServiceRecord,
} from '../../services/MaintenanceService';
import type { Machine, ServiceRecord, ServiceType } from '../../types';
import { generateId } from '../../utils/idGenerator';
import FormField from '../../components/business/FormField';
import BottomSheet from '../../components/business/BottomSheet';

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function serviceColor(days: number | null): string {
  if (days === null) return Colors.textSecondary;
  if (days < 30) return '#4CAF50';
  if (days < 60) return '#FF9800';
  return '#F44336';
}

const MACHINE_TYPES: Machine['type'][] = [
  'espresso_machine', 'grinder', 'water_treatment', 'other',
];
const MACHINE_TYPE_LABELS: Record<Machine['type'], string> = {
  espresso_machine: 'Espresso Machine',
  grinder: 'Grinder',
  water_treatment: 'Water Treatment',
  other: 'Other',
};

const SERVICE_TYPES: ServiceType[] = [
  'group_service', 'boiler_flush', 'descale',
  'gasket_replacement', 'grinder_calibration', 'custom',
];
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  group_service: 'Group Service',
  boiler_flush: 'Boiler Flush',
  descale: 'Descale',
  gasket_replacement: 'Gasket Replacement',
  grinder_calibration: 'Grinder Calibration',
  custom: 'Custom',
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MaintenanceScreen() {
  const { profile } = useProfileStore();
  const userUid = profile?.uid ?? '';

  const [machines, setMachines] = useState<Machine[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showLogService, setShowLogService] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const load = useCallback(async () => {
    const [m, r] = await Promise.all([
      getMachines(userUid),
      getServiceRecords(userUid),
    ]);
    setMachines(m);
    setRecords(r);
  }, [userUid]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Latest service per machine ─────────────────────────────────────────────
  function latestRecord(machineId: string): ServiceRecord | undefined {
    return records
      .filter((r) => r.machineId === machineId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  }

  // ── Sorted by next due / overdue ───────────────────────────────────────────
  const sortedByDue = [...machines].sort((a, b) => {
    const ra = latestRecord(a.id);
    const rb = latestRecord(b.id);
    const da = daysSince(ra?.completedAt) ?? 999;
    const db = daysSince(rb?.completedAt) ?? 999;
    return db - da; // most overdue first
  });

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Maintenance</Text>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setShowAddMachine(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Machines */}
          <Text style={styles.sectionLabel}>Machines</Text>
          {machines.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No machines yet.{'\n'}Tap + to add one.</Text>
            </View>
          ) : (
            machines.map((machine) => {
              const last = latestRecord(machine.id);
              const days = daysSince(last?.completedAt);
              const color = serviceColor(days);
              return (
                <View key={machine.id} style={styles.machineCard}>
                  <View style={styles.machineTop}>
                    <View style={styles.machineInfo}>
                      <Text style={styles.machineName}>{machine.name}</Text>
                      <Text style={styles.machineMeta}>
                        {MACHINE_TYPE_LABELS[machine.type]}
                        {machine.brand ? ` · ${machine.brand}` : ''}
                        {machine.location ? ` · ${machine.location}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.daysBadge, { borderColor: color }]}>
                      <Text style={[styles.daysNum, { color }]}>
                        {days !== null ? days : '—'}
                      </Text>
                      <Text style={[styles.daysLabel, { color }]}>days</Text>
                    </View>
                  </View>
                  {last && (
                    <Text style={styles.lastServiceText}>
                      Last: {SERVICE_TYPE_LABELS[last.serviceType]} ·{' '}
                      {new Date(last.completedAt).toLocaleDateString()}
                      {last.technicianName ? ` · ${last.technicianName}` : ''}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.logButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedMachine(machine);
                      setShowLogService(true);
                    }}
                  >
                    <Text style={styles.logButtonText}>Log Service</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {/* Overdue / Upcoming */}
          {sortedByDue.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Attention Needed</Text>
              {sortedByDue.slice(0, 3).map((machine) => {
                const last = latestRecord(machine.id);
                const days = daysSince(last?.completedAt);
                const color = serviceColor(days);
                return (
                  <View key={machine.id} style={styles.dueRow}>
                    <View style={[styles.dueIndicator, { backgroundColor: color }]} />
                    <Text style={styles.dueName}>{machine.name}</Text>
                    <Text style={[styles.dueDays, { color }]}>
                      {days !== null ? `${days}d ago` : 'Never serviced'}
                    </Text>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <AddMachineModal
          visible={showAddMachine}
          onClose={() => setShowAddMachine(false)}
          onSave={async (machine) => {
            await saveMachine(userUid, machine);
            setShowAddMachine(false);
            load();
          }}
        />

        <LogServiceModal
          visible={showLogService}
          machine={selectedMachine}
          onClose={() => { setShowLogService(false); setSelectedMachine(null); }}
          onSave={async (record) => {
            await saveServiceRecord(userUid, record);
            setShowLogService(false);
            setSelectedMachine(null);
            load();
          }}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}

// ── Add Machine Modal ─────────────────────────────────────────────────────────

function AddMachineModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (machine: Machine) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Machine['type']>('espresso_machine');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setName(''); setType('espresso_machine'); setBrand('');
    setModel(''); setLocation(''); setSaving(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      id: generateId(),
      name: name.trim(),
      type,
      ...(brand.trim() ? { brand: brand.trim() } : {}),
      ...(model.trim() ? { model: model.trim() } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
    } as Machine);
    reset();
  }

  return (
    <BottomSheet
      visible={visible}
      onCancel={() => { reset(); onClose(); }}
      title="Add Machine"
      saveLabel="Add Machine"
      onSave={handleSave}
      saveDisabled={!name.trim()}
      saving={saving}
    >
      <FormField label="Name *" value={name} onChange={setName} placeholder="La Marzocco Linea" />
      <FormField label="Brand" value={brand} onChange={setBrand} placeholder="La Marzocco" />
      <FormField label="Model" value={model} onChange={setModel} placeholder="Linea PB" />
      <FormField label="Location" value={location} onChange={setLocation} placeholder="Bar 1" />

      <Text style={styles.fieldLabel}>Type</Text>
      <View style={styles.chipRow}>
        {MACHINE_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, type === t && styles.chipSelected]}
            onPress={() => setType(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>
              {MACHINE_TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

// ── Log Service Modal ─────────────────────────────────────────────────────────

function LogServiceModal({
  visible,
  machine,
  onClose,
  onSave,
}: {
  visible: boolean;
  machine: Machine | null;
  onClose: () => void;
  onSave: (record: ServiceRecord) => Promise<void>;
}) {
  const [serviceType, setServiceType] = useState<ServiceType>('group_service');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setServiceType('group_service'); setTechnician(''); setNotes(''); setSaving(false);
  }

  async function handleSave() {
    if (!machine) return;
    setSaving(true);
    await onSave({
      id: generateId(),
      machineId: machine.id,
      serviceType,
      completedAt: new Date().toISOString(),
      ...(technician.trim() ? { technicianName: technician.trim() } : {}),
      notes: notes.trim(),
    } as ServiceRecord);
    reset();
  }

  return (
    <BottomSheet
      visible={visible}
      onCancel={() => { reset(); onClose(); }}
      title="Log Service"
      subtitle={machine?.name}
      saveLabel="Log Service"
      onSave={handleSave}
      saving={saving}
    >
      <Text style={styles.fieldLabel}>Service Type</Text>
      <View style={styles.chipRow}>
        {SERVICE_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, serviceType === t && styles.chipSelected]}
            onPress={() => setServiceType(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, serviceType === t && styles.chipTextSelected]}>
              {SERVICE_TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FormField label="Technician" value={technician} onChange={setTechnician} placeholder="Optional" />
      <FormField label="Notes" value={notes} onChange={setNotes} placeholder="Parts replaced, observations…" multiline />
    </BottomSheet>
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
  machineCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  machineTop: { flexDirection: 'row', alignItems: 'flex-start' },
  machineInfo: { flex: 1 },
  machineName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  machineMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  daysBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 48,
  },
  daysNum: { fontSize: 18, fontWeight: '700', fontFamily: Fonts.mono },
  daysLabel: { fontSize: 10, fontFamily: Fonts.mono },
  lastServiceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 8,
  },
  logButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: Fonts.mono,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dueIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  dueName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  dueDays: { fontSize: 12, fontFamily: Fonts.mono },
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
});
