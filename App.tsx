import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Colors, Fonts } from './utils/constants';
import CoffeeFlower from './components/CoffeeFlower';
import { AuthNavigator, AppNavigator } from './navigation/AppNavigator';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useProfileStore } from './store/profileStore';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

export default function App() {
  const { user, initializing, initialize } = useAuthStore();
  const { onboarded, profileReady, fetchProfile } = useProfileStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [emailVerified, setEmailVerified] = useState(false);
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // Sync Profile when user changes; sync emailVerified flag
  useEffect(() => {
    if (user) {
      fetchProfile(user.uid);
      setEmailVerified(user.emailVerified);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!initializing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [initializing, fadeAnim]);

  if (initializing || !fontsLoaded || (user && !profileReady)) {
    return (
      <View style={styles.loading}>
        <CoffeeFlower size={80} spinning />
        <Text style={styles.loadingText}>Tamping...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
          <StatusBar style="light" />
          <NavigationContainer>
            {user && !emailVerified ? (
              <VerifyEmailScreen onVerified={() => setEmailVerified(true)} />
            ) : user ? (
              <AppNavigator onboarded={onboarded} />
            ) : (
              <AuthNavigator />
            )}
          </NavigationContainer>
        </Animated.View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.mono,
    marginTop: 16,
  },
});
