import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPrefs } from '../types';

const TOKEN_KEY = '@ully_push_token';
const PREFS_KEY = '@ully_notif_prefs';

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  dailyTip: true,
  newContent: true,
};

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  if (typeof token === 'string') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return token;
  }
  return null;
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const json = await AsyncStorage.getItem(PREFS_KEY);
    return json ? { ...DEFAULT_PREFS, ...JSON.parse(json) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<NotificationPrefs> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  return prefs;
}

export async function scheduleDailyTip(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const prefs = await getNotificationPrefs();
  if (!prefs.enabled || !prefs.dailyTip) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ully Coffee',
      body: 'Check out today\'s coffee news and tips.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    } satisfies Notifications.DailyTriggerInput,
  });
}
