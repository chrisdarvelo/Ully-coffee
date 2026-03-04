import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth } from '../services/FirebaseConfig';
import { addCafe, saveCafe, removeCafe } from '../services/CafeService';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { sanitizeText } from '../utils/validation';
import { GoldGradient } from '../components/GoldGradient';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CafeDetail'>;

export default function CafeDetailScreen({ route, navigation }: Props) {
  const cafe = route.params?.cafe;
  const isNew = route.params?.isNew;
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState(cafe?.name || '');
  const [location, setLocation] = useState(cafe?.location || '');
  const [notes, setNotes] = useState(cafe?.notes || '');

  const handleSave = async () => {
    if (!uid) return;
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a cafe name.');
      return;
    }
    try {
      if (isNew) {
        await addCafe(uid, {
          name: sanitizeText(name, 100),
          location: sanitizeText(location, 200),
          notes: sanitizeText(notes, 500),
        });
      } else {
        if (!cafe?.id) return;
        await saveCafe(uid, {
          ...cafe,
          id: cafe.id,
          name: sanitizeText(name, 100),
          location: sanitizeText(location, 200),
          notes: sanitizeText(notes, 500),
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save cafe. Please try again.');
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove Cafe', `Remove "${cafe?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (!uid || !cafe?.id) return;
          try {
            await removeCafe(uid, cafe.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to remove cafe. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{isNew ? 'Add Cafe' : 'Edit Cafe'}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Cafe name"
        placeholderTextColor={Colors.textSecondary}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="City or address"
        placeholderTextColor={Colors.textSecondary}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="What do you love about this place?"
        placeholderTextColor={Colors.textSecondary}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
        <GoldGradient style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>{isNew ? 'Add' : 'Save'}</Text>
        </GoldGradient>
      </TouchableOpacity>

      {!isNew && cafe?.id && (
        <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
          <Text style={styles.removeBtnText}>Remove Cafe</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: Fonts.mono,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  saveBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: AuthColors.buttonText,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  removeBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  removeBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
});
