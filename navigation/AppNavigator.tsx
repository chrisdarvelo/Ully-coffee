import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { TabIcon } from '../components/NavigationIcons';

// Screens — consumer
import HomeScreen from '../screens/HomeScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// ── Param lists ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  PrivacyPolicy: { modal?: boolean } | undefined;
  Onboarding: undefined;
  Tabs: undefined;
};

export type TabParamList = {
  Home: undefined;
  AI: undefined;
  Profile: undefined;
};

// ── Navigators ────────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<RootStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ── Consumer tab bar icons ─────────────────────────────────────────────────────

export function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AuthColors.background },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 10,
          height: 80,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ── App Navigator ─────────────────────────────────────────────────────────────

export function AppNavigator({ onboarded }: { onboarded: boolean }) {

  return (
    <AppStack.Navigator
      initialRouteName={onboarded ? 'Tabs' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600', fontFamily: Fonts.mono },
        contentStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
      }}
    >
      <AppStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <AppStack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
    </AppStack.Navigator>
  );
}
