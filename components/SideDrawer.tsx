import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import Constants from 'expo-constants';
import { Colors, AuthColors, Fonts } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
}

export default function SideDrawer({ visible, onClose, onNavigate }: SideDrawerProps) {
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]); // slideAnim is a stable ref — intentionally omitted from deps

  const menuItems = [
    { key: 'ai', label: 'AI Assistant', icon: '🤖' },
    { key: 'editProfile', label: 'Edit Profile', icon: '👤' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'resources', label: 'Resources', icon: '📚' },
  ];

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ully Menu</Text>
          </View>

          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                onPress={() => onNavigate(item.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.version}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  menu: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  version: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
  },
});
