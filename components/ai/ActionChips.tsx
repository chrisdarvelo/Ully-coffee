import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '../../utils/constants';
import { ScanIcon, PortafilterIcon } from '../DiagnosticIcons';

interface ActionChipsProps {
  compact?: boolean;
  onDialIn: () => void;
  onDialInLongPress: () => void;
  onScan: () => void;
  onScanLongPress: () => void;
}

export default function ActionChips({
  compact,
  onDialIn,
  onDialInLongPress,
  onScan,
  onScanLongPress,
}: ActionChipsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={compact ? styles.toolbarRow : styles.actionChipsRow}>
        <TouchableOpacity
          style={compact ? styles.chatChip : styles.actionChip}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDialIn();
          }}
          onLongPress={onDialInLongPress}
          activeOpacity={0.7}
        >
          <PortafilterIcon size={compact ? 16 : 20} color={compact ? Colors.primary : Colors.text} />
          <Text style={compact ? styles.chatChipText : styles.actionChipText}>Dial-in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={compact ? styles.chatChip : styles.actionChip}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onScan();
          }}
          onLongPress={onScanLongPress}
          activeOpacity={0.7}
        >
          <ScanIcon size={compact ? 16 : 20} color={compact ? Colors.primary : Colors.text} />
          <Text style={compact ? styles.chatChipText : styles.actionChipText}>Troubleshoot</Text>
        </TouchableOpacity>
      </View>

      {!compact && (
        <Text style={styles.chipHint}>Hold to pick from library</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  actionChipsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  chipHint: {
    fontSize: 11,
    color: Colors.tabInactive,
    fontFamily: Fonts.mono,
    marginTop: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionChipText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontWeight: '600',
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  chatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatChipText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
});
