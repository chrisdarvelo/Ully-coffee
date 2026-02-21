import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Line } from 'react-native-svg';

import { auth } from '../services/FirebaseConfig';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { GoldGradient } from '../components/GoldGradient';
import CoffeeFlower from '../components/CoffeeFlower';
import PaperBackground from '../components/PaperBackground';
import { ScanIcon, PortafilterIcon } from '../components/DiagnosticIcons';

// New Architecture Imports
import { useUllyChat } from '../hooks/useUllyChat';
import { useCamera, CameraMode } from '../hooks/useCamera';
import { extractFrames, validateImageSize } from '../utils/mediaUtils';
import CameraModal from '../components/ai/CameraModal';
import ChatHistory from '../components/ai/ChatHistory';
import { ChatMessage } from '../types';

// Speech Recognition (Keep inline for safe optional require)
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {};
try {
  const speech = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speech.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speech.useSpeechRecognitionEvent;
} catch {
  // Native module not available
}

function MicIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" fill={color} />
      <Path d="M19 11a7 7 0 01-14 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 18v3M9 21h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BookIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Line x1="9" y1="7" x2="16" y2="7" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Line x1="9" y1="11" x2="14" y2="11" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

function FlagIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Line x1="4" y1="22" x2="4" y2="15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

const COFFEE_FUN_FACTS = [
  'Coffee is the seed of a cherry-like fruit. Trees produce sweet cherries that turn bright red when ripe.',
  'Brazil produces about 1/3 of the world\'s coffee — the largest producer for over 150 years.',
  'Coffee was discovered by an Ethiopian goat herder named Kaldi who noticed his goats dancing after eating coffee cherries.',
  'Coffee is grown in the "Bean Belt" — the region between the Tropics of Cancer and Capricorn.',
  'There are over 120 species of coffee, but we mainly drink two: Arabica (60%) and Robusta (40%).',
  'The word "espresso" means "pressed out" in Italian, referring to how coffee is brewed under pressure.',
  'Light roasts actually have slightly more caffeine than dark roasts — roasting burns off caffeine.',
  'Water temperature for espresso should be 90–96°C (195–205°F) for optimal extraction.',
  'The crema on espresso is CO2 trapped in oils, released under pressure during brewing.',
  'Dial-in means adjusting grind, dose, and yield until the shot tastes balanced — not sour or bitter.',
];

const THINKING_QUOTES = [
  'Brewing your answer...',
  'Tamping the grounds...',
  'Dialing in the grind...',
  'Heating the portafilter...',
  'Pulling a long shot...',
  'Coffee is almost ready...',
  'Steaming the milk...',
  'Checking the crema...',
];

export default function AIScreen() {
  const user = auth.currentUser;
  const name = user?.email ? user.email.split('@')[0] : 'friend';

  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [thinkingQuote, setThinkingQuote] = useState('');
  const [currentFact, setCurrentFact] = useState(() => COFFEE_FUN_FACTS[Math.floor(Math.random() * COFFEE_FUN_FACTS.length)]);
  
  const thinkingIndexRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Custom Hooks
  const {
    messages,
    loading,
    history,
    showHistory,
    setShowHistory,
    addMessage,
    loadChatFromHistory,
    startNewChat
  } = useUllyChat();

  const {
    showCamera,
    cameraMode,
    recording,
    cameraRef,
    openCamera,
    closeCamera,
    takePicture,
    startBurst,
    stopBurst
  } = useCamera();

  // Thinking quote cycle
  useEffect(() => {
    if (!loading) {
      setThinkingQuote('');
      return;
    }
    thinkingIndexRef.current = Math.floor(Math.random() * THINKING_QUOTES.length);
    setThinkingQuote(THINKING_QUOTES[thinkingIndexRef.current]);
    const interval = setInterval(() => {
      thinkingIndexRef.current = (thinkingIndexRef.current + 1) % THINKING_QUOTES.length;
      setThinkingQuote(THINKING_QUOTES[thinkingIndexRef.current]);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const refreshFact = () =>
    setCurrentFact(COFFEE_FUN_FACTS[Math.floor(Math.random() * COFFEE_FUN_FACTS.length)]);

  // Speech Logic
  useSpeechRecognitionEvent('result', (event: any) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setQuery(transcript);
      if (event.isFinal) {
        setListening(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Auto-submit voice queries
        handleVoiceSubmit(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', () => {
    setListening(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  });

  const toggleMic = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert('Not Available', 'Voice input requires a development build.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
      return;
    }
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone access is needed for voice input.');
      return;
    }
    setQuery('');
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
  };

  // Handlers
  const handleSubmit = async () => {
    const text = query.trim();
    if (!text || loading) return;
    setQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addMessage({ role: 'user', text });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleVoiceSubmit = async (text: string) => {
    if (!text.trim() || loading) return;
    setQuery('');
    await addMessage({ role: 'user', text: text.trim() });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePhotoCaptured = async (photo: any) => {
    if (!photo) return;
    closeCamera();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const promptText = cameraMode === 'scan'
      ? 'Identify this coffee equipment part. Provide: part name, manufacturer/model compatibility, what it does, signs of wear or damage, recommended replacement part numbers, and where to source it.'
      : 'Analyze this espresso extraction image. Provide: what you observe, potential issues, recommended fixes or adjustments, and any parts that may need replacement. Be specific and actionable.';

    await addMessage({
      role: 'user',
      text: promptText,
      image: photo.base64,
      imageUri: photo.uri,
    });
  };

  const handleBurstCaptured = async (frames: string[]) => {
    closeCamera();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const promptText = cameraMode === 'scan'
      ? `Identify this coffee equipment from ${frames.length} photos taken in sequence...`
      : `Analyze this espresso extraction sequence (${frames.length} frames captured over time)...`;

    await addMessage({
      role: 'user',
      text: promptText,
      frames,
    });
  };

  const handleVideoCaptured = async (videoUri: string) => {
    closeCamera();
    try {
      const frames = await extractFrames(videoUri, 5, 10000);
      if (frames.length === 0) return;

      const promptText = cameraMode === 'scan'
        ? `Identify this coffee equipment from ${frames.length} video frames...`
        : `Analyze this espresso extraction sequence (${frames.length} frames from a video)...`;

      await addMessage({
        role: 'user',
        text: promptText,
        frames,
        imageUri: videoUri,
      });
    } catch {
      Alert.alert('Error', 'Failed to analyze video.');
    }
  };

  const pickMedia = async (mode: CameraMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
        base64: true,
        videoMaxDuration: 10,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.type === 'video') {
          const frames = await extractFrames(asset.uri, 5, 10000);
          const promptText = mode === 'scan' ? 'Identify part...' : 'Analyze extraction...';
          await addMessage({ role: 'user', text: promptText, frames, imageUri: asset.uri });
        } else {
          if (asset.base64) {
            try {
              validateImageSize(asset.base64);
            } catch {
              Alert.alert('Image Too Large', 'Please choose an image under 5MB.');
              return;
            }
          }
          const promptText = mode === 'scan' ? 'Identify part...' : 'Analyze extraction...';
          await addMessage({ role: 'user', text: promptText, image: asset.base64 || undefined, imageUri: asset.uri });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media.');
    }
  };

  const takePhotoWrapper = async () => {
    const photo = await takePicture();
    if (photo) await handlePhotoCaptured(photo);
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startNewChat();
    refreshFact();
  };

  const handleFlagMessage = (text: string) => {
    Alert.alert(
      'Report Response',
      'Flag this AI response as inaccurate or inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            const subject = encodeURIComponent('Report AI Response');
            const body = encodeURIComponent(
              `I'd like to report the following Ully AI response:\n\n"${text}"\n\nReason (please describe):\n`
            );
            Linking.openURL(`mailto:support@ullycoffee.com?subject=${subject}&body=${body}`);
          },
        },
      ]
    );
  };

  // UI Helpers
  const ActionChips = ({ compact }: { compact?: boolean }) => (
    <View style={styles.actionChipsWrapper}>
      <View style={compact ? styles.toolbarRow : styles.actionChipsRow}>
        <TouchableOpacity
          style={compact ? styles.chatChip : styles.actionChip}
          onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openCamera('extraction');
          }}
          onLongPress={() => pickMedia('extraction')}
          activeOpacity={0.7}
        >
          <PortafilterIcon size={compact ? 16 : 20} color={compact ? Colors.primary : Colors.text} />
          <Text style={compact ? styles.chatChipText : styles.actionChipText}>Dial-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={compact ? styles.chatChip : styles.actionChip}
          onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openCamera('scan');
          }}
          onLongPress={() => pickMedia('scan')}
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

  if (showHistory) {
    return (
      <ChatHistory 
        visible={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onSelectChat={loadChatFromHistory}
        onNewChat={handleNewChat}
      />
    );
  }

  return (
    <PaperBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
        >
          {messages.length === 0 ? (
            <View style={[styles.fill, styles.centered]}>
              <View style={styles.topBar}>
                <View style={{ width: 32 }} />
                <View style={styles.topBarTitle}>
                  <Text style={styles.screenTitle}>Ully AI</Text>
                  <Text style={styles.screenTagline}>your coffee companion</Text>
                </View>
                <TouchableOpacity onPress={() => setShowHistory(true)} activeOpacity={0.7}>
                  <BookIcon color={Colors.text} size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.centerContent}>
                <CoffeeFlower size={54} spinning={listening} bold />
                <Text style={styles.greeting}>Hello {name},</Text>
                <Text style={styles.subGreeting}>how can I help?</Text>

                <ActionChips />

                <View style={styles.searchWrap}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      ref={inputRef}
                      style={styles.searchInput}
                      placeholderTextColor={Colors.tabInactive}
                      value={query}
                      onChangeText={setQuery}
                      onSubmitEditing={handleSubmit}
                      returnKeyType="send"
                      multiline={false}
                    />
                    <TouchableOpacity
                      style={[styles.micButton, listening && styles.micButtonActive]}
                      onPress={toggleMic}
                      activeOpacity={0.7}
                    >
                      <MicIcon
                        color={listening ? '#fff' : Colors.textSecondary}
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.funFactCard}>
                  <Text style={styles.funFactLabel}>Did you know?</Text>
                  <Text style={styles.funFactText}>{currentFact}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.fill}>
              <View style={styles.chatTopBar}>
                <TouchableOpacity onPress={handleNewChat} activeOpacity={0.7}>
                  <Text style={styles.chatTopBtn}>New</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHistory(true)} activeOpacity={0.7}>
                  <BookIcon color={Colors.text} size={22} />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() =>
                  scrollRef.current?.scrollToEnd({ animated: true })
                }
              >
                {messages.map((msg, i) =>
                  msg.role === 'user' ? (
                    <GoldGradient key={i} style={styles.userBubble}>
                      {msg.imageUri && !msg.frames && !msg.isVideo && (
                        <Image source={{ uri: msg.imageUri }} style={styles.bubbleImage} />
                      )}
                      {(msg.frames || msg.isVideo) && (
                        <View style={styles.videoBadge}>
                          <Text style={styles.videoBadgeText}>Video ({msg.frames?.length || '?'} frames)</Text>
                        </View>
                      )}
                      <Text style={styles.userText}>{msg.text}</Text>
                    </GoldGradient>
                  ) : (
                    <View key={i} style={styles.ullyBubbleWrapper}>
                      <View style={styles.ullyBubble}>
                        <Text style={styles.ullyText}>{msg.text}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.flagBtn}
                        onPress={() => handleFlagMessage(msg.text)}
                        activeOpacity={0.6}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <FlagIcon color={Colors.tabInactive} size={13} />
                        <Text style={styles.flagText}>Report</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
                {loading && (
                  <View style={styles.loadingRow}>
                    <CoffeeFlower size={27} spinning bold />
                    {!!thinkingQuote && (
                      <Text style={styles.thinkingQuote}>{thinkingQuote}</Text>
                    )}
                  </View>
                )}
              </ScrollView>

              <ActionChips compact />
              <Text style={styles.aiDisclosure}>
                Responses are AI-generated by Ully and may not always be accurate.
              </Text>

              <View style={styles.inputBar}>
                <View style={styles.searchContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholderTextColor={Colors.tabInactive}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="send"
                    multiline={false}
                  />
                  <TouchableOpacity
                    style={[styles.micButton, listening && styles.micButtonActive]}
                    onPress={toggleMic}
                    activeOpacity={0.7}
                  >
                    <MicIcon
                      color={listening ? '#fff' : Colors.textSecondary}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <CameraModal
            visible={showCamera}
            cameraRef={cameraRef}
            recording={recording}
            cameraMode={cameraMode}
            onClose={closeCamera}
            onTakePicture={takePhotoWrapper}
            onStartBurst={() => startBurst(handleBurstCaptured)}
            onStopBurst={() => stopBurst(handleBurstCaptured)}
          />

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fill: { flex: 1 },
  centered: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  topBarTitle: { flex: 1, alignItems: 'center' },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    letterSpacing: 1,
  },
  screenTagline: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  chatTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  chatTopBtn: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
  },
  greeting: {
    fontSize: 20,
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginTop: 20,
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginTop: 2,
    textAlign: 'center',
  },
  aiDisclosure: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    marginTop: 12,
  },
  actionChipsWrapper: {
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
  searchWrap: {
    marginTop: 32,
    alignSelf: 'stretch',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.mono,
    color: Colors.text,
    paddingVertical: 14,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micButtonActive: { backgroundColor: Colors.danger },
  chatScroll: { flex: 1 },
  chatContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '80%',
    marginBottom: 12,
  },
  userText: {
    color: AuthColors.buttonText,
    fontSize: 14,
    fontFamily: Fonts.mono,
    lineHeight: 20,
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  videoBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  videoBadgeText: {
    color: AuthColors.buttonText,
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  ullyBubbleWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    marginBottom: 12,
  },
  ullyBubble: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ullyText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.mono,
    lineHeight: 22,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  flagText: {
    fontSize: 11,
    color: Colors.tabInactive,
    fontFamily: Fonts.mono,
  },
  loadingRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginLeft: 4,
  },
  thinkingQuote: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    fontStyle: 'italic',
  },
  funFactCard: {
    marginTop: 20,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'stretch',
  },
  funFactLabel: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: Fonts.mono,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  funFactText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    lineHeight: 18,
  },
  inputBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
});
