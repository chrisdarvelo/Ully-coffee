import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function ScanIcon({ size = 28, color = '#1a1a1a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7V4a1 1 0 011-1h3M17 3h3a1 1 0 011 1v3M21 17v3a1 1 0 01-1 1h-3M7 21H4a1 1 0 01-1-1v-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="7" y1="7" x2="7" y2="17" stroke={color} strokeWidth={1.5} />
      <Line x1="10" y1="7" x2="10" y2="17" stroke={color} strokeWidth={1} />
      <Line x1="12.5" y1="7" x2="12.5" y2="17" stroke={color} strokeWidth={2} />
      <Line x1="15" y1="7" x2="15" y2="17" stroke={color} strokeWidth={1} />
      <Line x1="17" y1="7" x2="17" y2="17" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function PortafilterIcon({ size = 28, color = '#1a1a1a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Handle */}
      <Path
        d="M2 11h5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Basket body */}
      <Path
        d="M7 8c0 0 0-1 1-1h8c1 0 1 1 1 1v2c0 3-2.5 6-5 6s-5-3-5-6V8z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      {/* Spouts */}
      <Path
        d="M10 16v3M14 16v3"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

