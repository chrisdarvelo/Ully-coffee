import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth } from '../services/FirebaseConfig';
import { saveRecipe, deleteRecipe } from '../services/RecipeService';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import RecipeArtCover from '../components/RecipeArtCover';
import { GoldGradient } from '../components/GoldGradient';
import { Recipe } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const recipe: Recipe | undefined = route.params?.recipe;
  const isNew = route.params?.isNew;
  const uid = auth.currentUser?.uid;

  const [form, setForm] = useState({
    name: recipe?.name || '',
    method: recipe?.method || '',
    description: recipe?.description || '',
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: Partial<Recipe>) => {
      if (!uid) throw new Error('Not authenticated');
      return saveRecipe(uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', uid] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!uid) throw new Error('Not authenticated');
      return deleteRecipe(uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', uid] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      navigation.goBack();
    },
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Name required', 'Please enter a recipe name.');
      return;
    }
    
    saveMutation.mutate({
      ...recipe,
      name: form.name.trim(),
      method: form.method.trim(),
      description: form.description.trim(),
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Remove "${recipe?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (recipe?.id) deleteMutation.mutate(recipe.id);
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${form.name}\n\nMethod: ${form.method}\n\n${form.description}\n\nShared from Ully Coffee`,
      });
    } catch {
      // share cancelled
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }} 
          style={styles.backBtn}
        >
          <Text style={styles.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.artWrap}>
          <RecipeArtCover
            artSeed={recipe?.artSeed || 1}
            artStyle={recipe?.artStyle || 'lam'}
            size={200}
          />
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Recipe name"
          placeholderTextColor={Colors.textSecondary}
        />

        <Text style={styles.label}>Method</Text>
        <TextInput
          style={styles.input}
          value={form.method}
          onChangeText={(text) => setForm({ ...form, method: text })}
          placeholder="e.g. Pour Over, Espresso"
          placeholderTextColor={Colors.textSecondary}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          placeholder="Recipe details, ratios, notes..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity 
          onPress={handleSave} 
          activeOpacity={0.7}
          disabled={saveMutation.isPending}
        >
          <GoldGradient style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>
              {saveMutation.isPending ? 'Saving...' : (isNew ? 'Create' : 'Save')}
            </Text>
          </GoldGradient>
        </TouchableOpacity>

        {!isNew && recipe?.id && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleDelete} 
            activeOpacity={0.7}
            disabled={deleteMutation.isPending}
          >
            <Text style={styles.deleteBtnText}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Recipe'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: Colors.text,
  },
  shareBtn: {
    padding: 8,
  },
  shareText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Fonts.mono,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  artWrap: {
    alignItems: 'center',
    marginVertical: 20,
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
  deleteBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
});
