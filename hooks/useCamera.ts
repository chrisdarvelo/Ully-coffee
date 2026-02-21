import { useState, useRef, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useCameraPermissions, CameraView, BarcodeScanningResult } from 'expo-camera';

export type CameraMode = 'scan' | 'extraction' | null;

export function useCamera() {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);
  const [recording, setRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  const cameraRef = useRef<CameraView>(null);
  const burstRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstFramesRef = useRef<string[]>([]);

  const openCamera = useCallback((mode: CameraMode) => {
    if (!permission?.granted) {
      requestPermission().then((result) => {
        if (result.granted) {
          setCameraMode(mode);
          setShowCamera(true);
        } else {
          Alert.alert(
            'Camera Access Required',
            'Ully needs camera access to scan equipment and analyze extractions. Enable it in Settings.',
            [
              { text: 'Not Now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      });
      return;
    }
    setCameraMode(mode);
    setShowCamera(true);
  }, [permission, requestPermission]);

  const stopBurst = useCallback((onComplete?: (frames: string[]) => void) => {
    if (burstRef.current) {
      clearInterval(burstRef.current);
      burstRef.current = null;
    }
    
    setRecording(false);
    const frames = [...burstFramesRef.current];
    burstFramesRef.current = [];
    
    if (frames.length > 0 && onComplete) {
      onComplete(frames);
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopBurst();
    setShowCamera(false);
    setRecording(false);
  }, [stopBurst]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return null;
    try {
      const p = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
      return p;
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      return null;
    }
  }, []);

  const startBurst = useCallback((onComplete: (frames: string[]) => void) => {
    if (!cameraRef.current || recording) return;
    setRecording(true);
    burstFramesRef.current = [];
    
    const captureFrame = async () => {
      if (!cameraRef.current) return;
      try {
        const p = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
        if (p?.base64) {
          burstFramesRef.current.push(p.base64);
        }
        if (burstFramesRef.current.length >= 5) {
          stopBurst(onComplete);
        }
      } catch {
        // skip failed frames
      }
    };
    
    captureFrame();
    burstRef.current = setInterval(captureFrame, 2000);
  }, [recording, stopBurst]);

  return {
    showCamera,
    cameraMode,
    recording,
    cameraRef,
    permission,
    openCamera,
    closeCamera,
    takePicture,
    startBurst,
    stopBurst
  };
}
