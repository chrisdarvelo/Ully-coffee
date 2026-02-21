import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import {
  signOut,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../services/FirebaseConfig';
import { deleteUserAccount } from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, saveProfile } from '../services/ProfileService';
import {
  registerForPushNotifications,
  getNotificationPrefs,
  saveNotificationPrefs,
  scheduleDailyTip,
} from '../services/NotificationService';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { sanitizeText } from '../utils/validation';
import CoffeeFlower from '../components/CoffeeFlower';
import { GoldGradient } from '../components/GoldGradient';

export default function SettingsScreen({ navigation: tabNav }) {
  const navigation = tabNav.getParent();
  const user = auth.currentUser;
  const name = user?.email ? user.email.split('@')[0] : 'User';
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState('');
  const [shops, setShops] = useState([]);
  const [shopInput, setShopInput] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const [profile, notifPrefs] = await Promise.all([
      getProfile(user.uid),
      getNotificationPrefs(),
    ]);
    if (profile) {
      setLocation(profile.location || '');
      setShops(profile.shops || []);
      setAvatarUri(profile.avatarUri || null);
    }
    setNotifEnabled(notifPrefs.enabled);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        'Email Sent',
        `Password reset link sent to ${user.email}. Check your inbox.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data (recipes, cafes, profile). This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Password',
              'Enter your password to confirm account deletion.',
              async (password) => {
                if (!password) return;
                setLoading(true);
                try {
                  const credential = EmailAuthProvider.credential(user.email, password);
                  await reauthenticateWithCredential(user, credential);
                  // Clear all local user data from AsyncStorage — must succeed before
                  // deleting the Auth record, otherwise local data is orphaned.
                  try {
                    const keys = await AsyncStorage.getAllKeys();
                    const userKeys = keys.filter((k) => k.includes(user.uid) || k === '@ully_chat_history');
                    if (userKeys.length > 0) {
                      await AsyncStorage.multiRemove(userKeys);
                    }
                  } catch {
                    setLoading(false);
                    Alert.alert('Error', 'Failed to clear local data. Please try again.');
                    return;
                  }
                  // Wipe server-side data (Firestore + Storage) and delete Auth record
                  await deleteUserAccount();
                } catch (error) {
                  setLoading(false);
                  const msg =
                    error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
                      ? 'Incorrect password. Please try again.'
                      : 'Failed to delete account. Please try again.';
                  Alert.alert('Error', msg);
                }
              },
              'secure-text',
            );
          },
        },
      ],
    );
  };

  const handleToggleNotifications = async (value) => {
    if (value) {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert('Notifications', 'Please enable notifications in your device settings.');
        return;
      }
    }
    setNotifEnabled(value);
    await saveNotificationPrefs({ enabled: value, dailyTip: true, newContent: true });
    await scheduleDailyTip();
  };

  const handleSaveProfile = async () => {
    await saveProfile(user.uid, {
      location: sanitizeText(location, 100),
      shops: shops.map((s) => sanitizeText(s, 100)),
    });
    setEditing(false);
  };

  const addShop = () => {
    const trimmed = sanitizeText(shopInput, 100);
    if (trimmed && !shops.includes(trimmed)) {
      setShops([...shops, trimmed]);
      setShopInput('');
    }
  };

  const removeShop = (index) => {
    setShops(shops.filter((_, i) => i !== index));
  };

  const saveAvatar = async (result) => {
    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await saveProfile(user.uid, { avatarUri: uri });
    }
  };

  const pickAvatar = () => {
    const opts = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };
    Alert.alert('Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => saveAvatar(await ImagePicker.launchCameraAsync(opts)),
      },
      {
        text: 'Choose from Library',
        onPress: async () => saveAvatar(await ImagePicker.launchImageLibraryAsync(opts)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CoffeeFlower size={80} spinning />
        <Text style={styles.loadingText}>Brewing...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.7} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <GoldGradient style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </GoldGradient>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeIcon}>&#9998;</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email || 'Unknown'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => setEditing(!editing)}
          activeOpacity={0.7}
        >
          <Text style={styles.rowIcon}>&#9998;</Text>
          <View style={styles.rowBody}>
            <Text style={styles.rowText}>Edit Profile</Text>
            <Text style={styles.rowHint}>
              {location ? `${location}` : 'Set your location and favorite shops'}
            </Text>
          </View>
        </TouchableOpacity>

        {editing && (
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Location</Text>
            <TextInput
              style={styles.editInput}
              value={location}
              onChangeText={setLocation}
              placeholder="City or town"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={[styles.editLabel, { marginTop: 16 }]}>
              Favorite Shops
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.editInput, { flex: 1 }]}
                value={shopInput}
                onChangeText={setShopInput}
                placeholder="Add a shop"
                placeholderTextColor={Colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={addShop}
              />
              <TouchableOpacity
                onPress={addShop}
                disabled={!shopInput.trim()}
                style={!shopInput.trim() ? { opacity: 0.4 } : undefined}
              >
                <GoldGradient style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+</Text>
                </GoldGradient>
              </TouchableOpacity>
            </View>

            {shops.map((shop, i) => (
              <View key={i} style={styles.shopRow}>
                <Text style={styles.shopName}>{shop}</Text>
                <TouchableOpacity onPress={() => removeShop(i)}>
                  <Text style={styles.shopRemove}>x</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={handleSaveProfile} activeOpacity={0.7}>
              <GoldGradient style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </GoldGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={handlePasswordReset}
          activeOpacity={0.7}
        >
          <Text style={styles.rowIcon}>&#128273;</Text>
          <View style={styles.rowBody}>
            <Text style={styles.rowText}>Reset Password</Text>
            <Text style={styles.rowHint}>Sends a reset link to your email</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.rowIcon}>&#128276;</Text>
          <View style={styles.rowBody}>
            <Text style={styles.rowText}>Notifications</Text>
            <Text style={styles.rowHint}>Daily coffee tips</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>


        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PrivacyPolicy', { modal: true })}
          activeOpacity={0.7}
        >
          <Text style={styles.rowIcon}>&#128274;</Text>
          <View style={styles.rowBody}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Text style={styles.rowHint}>How we handle your data</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.signOutRow}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteRow}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.mono,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 24,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarText: {
    color: AuthColors.buttonText,
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: Fonts.mono,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeIcon: {
    fontSize: 12,
    color: Colors.text,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  row: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  rowBody: {
    flex: 1,
  },
  rowText: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontWeight: '600',
  },
  rowHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  editSection: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  editLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: Fonts.mono,
    color: Colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: AuthColors.buttonText,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shopName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  shopRemove: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    paddingLeft: 10,
  },
  saveBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: AuthColors.buttonText,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  signOutRow: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  signOutText: {
    fontSize: 15,
    color: Colors.danger,
    fontFamily: Fonts.mono,
    fontWeight: '700',
  },
  deleteRow: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
  },
});
