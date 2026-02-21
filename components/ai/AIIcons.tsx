import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

export function MicIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" fill={color} />
      <Path d="M19 11a7 7 0 01-14 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 18v3M9 21h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function BookIcon({ color, size }: { color: string; size: number }) {
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

export function FlagIcon({ color, size }: { color: string; size: number }) {
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
