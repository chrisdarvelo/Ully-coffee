import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../utils/constants';

interface CoffeeFlowerProps {
  size?: number;
  spinning?: boolean;
  bold?: boolean;
  dark?: boolean;
  opacity?: number;
}

/**
 * Premium "Signature" Coffee Blossom
 * Features layered petals with center-vein detail and a high-end gold cluster center.
 */
export default function CoffeeFlower({
  size = 150,
  spinning = false,
  bold = false,
  dark = false,
  opacity = 1
}: CoffeeFlowerProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      Animated.spring(spinAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [spinning, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeColor = dark ? '#3C3228' : '#FFFFFF';
  const gold = Colors.primary;

  // Wide, rounded coffee-blossom petal — matches the splash.png silhouette
  const petalPath = "M100,100 C130,83 148,58 100,40 C52,58 70,83 100,100 Z";
  const veinPath = "M100,100 L100,40"; // Vein extends to petal tip
  
  return (
    <View style={[styles.container, { width: size, height: size, opacity }]}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg 
          width={size} 
          height={size} 
          viewBox="0 0 200 200"
          fill="none"
        >
          <Defs>
            <LinearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={strokeColor} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={strokeColor} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          {/* 6 Layered Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <G transform={`rotate(${angle}, 100, 100)`} key={angle}>
              {/* Petal */}
              <Path
                d={petalPath}
                fill="url(#petalGrad)"
                stroke={gold}
                strokeWidth={bold ? 2.0 : 1.2}
                strokeOpacity={0.65}
              />
              {/* Petal Vein */}
              <Path
                d={veinPath}
                stroke={gold}
                strokeWidth={0.7}
                strokeOpacity={0.75}
                strokeLinecap="round"
              />
            </G>
          ))}
          
          {/* Gold Cluster Center */}
          <Circle cx="100" cy="100" r="14" fill={gold} fillOpacity={0.2} />
          <Circle cx="100" cy="100" r="8" fill={gold} />

          {/* Stamen Dots */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <Circle
              key={`stamen-${angle}`}
              cx={100 + 15 * Math.cos((angle * Math.PI) / 180)}
              cy={100 + 15 * Math.sin((angle * Math.PI) / 180)}
              r="2.5"
              fill={gold}
            />
          ))}

          {/* Dark center core — matches splash.png */}
          <Circle cx="100" cy="100" r="3.5" fill={Colors.background} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
