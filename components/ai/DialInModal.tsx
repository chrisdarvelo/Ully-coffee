import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts } from '../../utils/constants';
import { DialInData } from '../../types';
import { validateImageSize } from '../../utils/mediaUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: DialInData) => void;
}

const STEPS = ['Dose', 'Yield', 'Brew Time', 'Taste', 'Shot'];

const TASTE_OPTIONS: { label: string; value: DialInData['taste'] }[] = [
  { label: 'Too Sour', value: 'sour' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Too Bitter', value: 'bitter' },
];

const STEP_SUBTITLES = [
  'How much coffee did you use?',
  'How much liquid did you pull?',
  'How long did the shot run?',
  'What did it taste like?',
  'Show Ully your espresso',
];

export default function DialInModal({ visible, onClose, onConfirm }: Props) {
  const [step, setStep] = useState(0);
  const [dose, setDose] = useState(18.0);
  const [yieldG, setYieldG] = useState(36.0);
  const [time, setTime] = useState(28);
  const [taste, setTaste] = useState<DialInData['taste'] | null>(null);
  const [photo, setPhoto] = useState<{ base64?: string; uri: string } | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (direction: 'forward' | 'back', callback: () => void) => {
    const toValue = direction === 'forward' ? -20 : 20;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 80);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateStep('forward', () => setStep((s) => s + 1));
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateStep('back', () => setStep((s) => s - 1));
  };

  const resetAll = () => {
    setStep(0);
    setDose(18.0);
    setYieldG(36.0);
    setTime(28);
    setTaste(null);
    setPhoto(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleAnalyze = () => {
    if (!taste) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm({ dose, yield: yieldG, time, taste, image: photo?.base64, imageUri: photo?.uri });
    resetAll();
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert('Camera Access Required', 'Enable camera access in Settings to photograph your shot.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, base64: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (asset.base64) {
        try { validateImageSize(asset.base64); }
        catch (e) {
          console.warn('DialIn image validation:', e);
          Alert.alert('Image Too Large', 'Please capture a smaller image (under 5MB).');
          return;
        }
      }
      setPhoto({ base64: asset.base64 ?? undefined, uri: asset.uri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('DialIn camera error:', e);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const adjust = (setter: (v: number) => void, current: number, delta: number, min: number, max: number, decimals = 0) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = parseFloat((current + delta).toFixed(decimals));
    if (!isFinite(next)) return;
    setter(Math.min(max, Math.max(min, next)));
  };

  // ── Header ───────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      {step > 0 ? (
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      ) : <View style={styles.iconBtn} />}
      <View style={styles.headerCenter}>
        <Text style={styles.title}>Dial In</Text>
        <Text style={styles.subtitle}>{STEP_SUBTITLES[step]}</Text>
      </View>
      <TouchableOpacity onPress={handleClose} style={styles.iconBtn} activeOpacity={0.7}>
        <Text style={styles.closeX}>×</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Step dots ─────────────────────────────────────────────────────────────────
  const renderDots = () => (
    <View style={styles.dots}>
      {STEPS.map((_, i) => <View key={i} style={[styles.dot, i === step && styles.dotActive]} />)}
    </View>
  );

  // ── Number step (steps 0–2) ───────────────────────────────────────────────────
  const renderNumberStep = (
    unit: string, value: number, setter: (v: number) => void,
    delta: number, min: number, max: number, decimals: number
  ) => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.adjusterRow}>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(setter, value, -delta, min, max, decimals)} activeOpacity={0.7}>
          <Text style={styles.adjBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{decimals > 0 ? value.toFixed(decimals) : value}</Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(setter, value, delta, min, max, decimals)} activeOpacity={0.7}>
          <Text style={styles.adjBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.primaryBtnText}>Next →</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── Taste step (step 3) ───────────────────────────────────────────────────────
  const renderTasteStep = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.tasteRow}>
        {TASTE_OPTIONS.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.tasteChip, taste === value && styles.tasteChipActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTaste(value); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tasteChipText, taste === value && styles.tasteChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.primaryBtn, !taste && styles.primaryBtnDisabled]}
        onPress={taste ? handleNext : undefined}
        disabled={!taste}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Next →</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── Shot capture step (step 4) ────────────────────────────────────────────────
  const renderShotStep = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      {photo ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)} activeOpacity={0.7}>
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto} activeOpacity={0.7}>
          <Text style={styles.cameraBtnIcon}>☕</Text>
          <Text style={styles.cameraBtnLabel}>Show Ully your coffee</Text>
          <Text style={styles.cameraBtnHint}>Photograph your espresso shot</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze} activeOpacity={0.8}>
        <Text style={styles.primaryBtnText}>
          {photo ? 'Analyze with Ully ✦' : 'Analyze (numbers only)'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {renderHeader()}
          {renderDots()}
          {step === 0 && renderNumberStep('grams', dose, setDose, 0.1, 1, 50, 1)}
          {step === 1 && renderNumberStep('grams', yieldG, setYieldG, 0.1, 1, 120, 1)}
          {step === 2 && renderNumberStep('seconds', time, setTime, 1, 5, 120, 0)}
          {step === 3 && renderTasteStep()}
          {step === 4 && renderShotStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    maxHeight: SCREEN_HEIGHT * 0.68,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text, fontFamily: Fonts.mono, letterSpacing: 0.5 },
  subtitle: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.mono, marginTop: 3, textAlign: 'center' },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 22, color: Colors.textSecondary },
  closeX: { fontSize: 26, color: Colors.textSecondary, lineHeight: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18, borderRadius: 3 },
  stepContent: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 4, paddingBottom: 20 },
  adjusterRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 32 },
  adjBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  adjBtnText: { fontSize: 28, color: Colors.text, fontFamily: Fonts.mono, lineHeight: 32 },
  valueBox: { alignItems: 'center', minWidth: 110 },
  valueText: { fontSize: 48, fontWeight: '700', color: Colors.text, fontFamily: Fonts.mono, lineHeight: 54 },
  unitText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.mono, marginTop: 2 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 28,
    paddingVertical: 14, paddingHorizontal: 32,
    alignSelf: 'stretch', alignItems: 'center', marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: Fonts.mono, letterSpacing: 0.3 },
  tasteRow: { flexDirection: 'row', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' },
  tasteChip: {
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 24,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  tasteChipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}22` },
  tasteChipText: { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.mono, fontWeight: '600' },
  tasteChipTextActive: { color: Colors.primary },
  // Shot step
  cameraBtn: {
    alignSelf: 'stretch', backgroundColor: Colors.background,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 28, alignItems: 'center', gap: 6, marginBottom: 20,
  },
  cameraBtnIcon: { fontSize: 32, marginBottom: 4 },
  cameraBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, fontFamily: Fonts.mono },
  cameraBtnHint: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.mono },
  photoWrap: { alignSelf: 'stretch', borderRadius: 14, overflow: 'hidden', position: 'relative', marginBottom: 20 },
  photoPreview: { width: '100%', height: 170, borderRadius: 14 },
  retakeBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 14,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  retakeBtnText: { fontSize: 12, color: '#fff', fontFamily: Fonts.mono },
});
