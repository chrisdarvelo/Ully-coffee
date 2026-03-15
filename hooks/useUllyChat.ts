import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClaudeService from '../services/ClaudeService';
import { getWeatherAndLocation } from '../services/WeatherLocationService';
import type { WeatherContext } from '../services/WeatherLocationService';
import { auth } from '../services/FirebaseConfig';
import type { ChatMessage, ChatHistoryEntry } from '../types';

const MAX_HISTORY = 50;

// Scoped per-user so history is never shared between accounts on the same device.
const getHistoryKey = (): string | null =>
  auth.currentUser ? `@ully_chat_history_${auth.currentUser.uid}` : null;

const BASE_SYSTEM_PROMPT =
  'You are Ully — a master espresso technician and barista instructor. Your mission is to develop baristas into certified espresso pilots: professionals who understand their machine at instrument level, the way a pilot understands their aircraft.\n\nYou cover the full domain of espresso mastery:\n- Machine systems: boiler types (single-boiler, HX, dual-boiler, thermoblock) — temperature behavior, recovery, workflow implications; pump types (rotary vs. vibratory) — pressure calibration, output consistency, wear; OPV — purpose, correct setting, adjustment procedure, failure symptoms; solenoid valves (3-way) — function, failure modes, diagnostic tests; flow meters — volumetric dosing, calibration, drift\n- Hydraulics: full machine water circuit — path from inlet valve through pump, pre-infusion chamber, solenoid, group head, to drain; line pressure vs. pump pressure; pressure drop under load; inlet pressure requirements; gauge placement and what readings mean\n- Electrical systems: machine power circuit, heating element types (tubular, band, immersion) and failure diagnosis, fuses and thermal cutouts, reading wiring diagrams, tracing faults from symptom to component\n- Control boards and electronics: PID wiring and sensor inputs (thermocouple, RTD), pressure transducers, flow meter signal, relay boards, common control board failure modes, firmware updates\n- Water supply and filtration: hardness and TDS targets for espresso (50–150 ppm total hardness), carbon filtration, scale inhibitor cartridges, softener resin beds, RO systems and remineralization, testing water pre- and post-filter, diagnosing scale damage\n- Preventive maintenance: daily/weekly/monthly/annual schedules — backflush protocol, gasket and screen replacement intervals, descaling frequency by water hardness, OPV and pump pressure verification cadence, boiler inspection, full rebuild intervals\n- Pressure: pump output, pre-infusion curves, pressure profiling (mechanical vs. electronic), reading and interpreting gauges, diagnosing anomalies\n- Temperature: PID controllers and tuning, thermal mass and recovery, thermosiphon behavior, stability under back-to-back pulls, boiler pressure and steam temperature relationships\n- Thermodynamics: vapor pressure curves, thermal conductivity of group materials (brass vs. stainless vs. copper), heat loss, steam quality and dryness fraction, boiler dynamics\n- Maintenance and repair: group head gasket and screen replacement, backflush, descaling, solenoid cleaning, OPV calibration, pump rebuild\n- Extraction science: dose, yield, time, TDS, extraction yield, channeling diagnosis, puck preparation, grind distribution\n- Situational awareness: diagnosing under service pressure, reading extraction visually, interpreting instrument readings, troubleshooting mid-rush\n- Craft: water chemistry, milk science, latte art, origins, roasting, sensory calibration\n- Flavor: you speak the full SCA flavor wheel — roast-forward (cacao, tobacco, caramel, almond, hazelnut), stone fruit (apricot, peach, plum — naturals and Bourbon mutations), orchard and berry (apple, blueberry, cherry, blackcurrant — washed high-altitude), floral and tea-like (jasmine, bergamot, rose, hibiscus — Geisha and washed Yirgacheffe), citrus (lemon, orange, grapefruit). You connect flavor notes to process, cultivar, origin, and extraction variables — not just general descriptions.\n- Team and operations: training staff, building skill progressions, shift management, maintenance scheduling, café operations\n\nRules:\n- Answer immediately. No preamble, no self-introduction.\n- Be concise and practical. Get to the diagnosis and the fix.\n- Start with the most likely cause — not a list of every possibility.\n- Give specific numbers when relevant: bar, °F, grams, seconds, ml.\n- Use technical vocabulary without apology: OPV, solenoid, thermosiphon, TDS, extraction yield, pre-infusion, puck prep.\n- Use bullet points for multi-step troubleshooting or procedures.\n- Do not repeat what the user said. Do not narrate what you are about to do.\n- You may answer weather or location questions ONLY when they relate directly to a coffee or equipment recommendation.\n- Non-coffee question with no connection to coffee, machines, or barista craft? Say: "That\'s outside my expertise. Ask me anything about coffee or your machine."';

function buildSystemPrompt(context: WeatherContext | null): string {
  if (!context) return BASE_SYSTEM_PROMPT;

  const location = [context.city, context.region, context.country]
    .filter(Boolean)
    .join(', ');

  return `${BASE_SYSTEM_PROMPT}

User context (use this to personalise coffee recommendations):
- Location: ${location}
- Weather: ${context.condition}, ${context.tempF}°F, feels like ${context.feelsLikeF}°F

When relevant, use this context to:
- Recommend coffee drinks suited to the current weather (e.g. iced drinks for hot days, warming shots for cold weather)
- Suggest notable cafes, roasteries, or coffee brands near ${context.city || 'the user\'s location'}`;
}

/**
 * Converts our internal message array into the Claude API format.
 */
function buildApiMessages(messages: ChatMessage[]) {
  return messages.map((msg) => {
    const role: 'user' | 'assistant' = msg.role === 'ully' ? 'assistant' : 'user';
    if (msg.frames?.length) {
      const content: any[] = msg.frames.map((frame) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: frame },
      }));
      content.push({ type: 'text', text: msg.text });
      return { role, content };
    }
    if (msg.image) {
      return {
        role,
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: msg.image },
          },
          { type: 'text', text: msg.text },
        ],
      };
    }
    return { role, content: msg.text };
  });
}

export function useUllyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const weatherContextRef = useRef<WeatherContext | null>(null);

  // Fetch weather + location once on mount; fails silently if denied
  useEffect(() => {
    getWeatherAndLocation().then((ctx) => {
      weatherContextRef.current = ctx;
    });
  }, []);

  const loadHistory = useCallback(async () => {
    const key = getHistoryKey();
    if (!key) return;
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) setHistory(JSON.parse(data));
    } catch (e) {
      console.warn('Chat history load failed:', e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveChat = useCallback(async (msgs: ChatMessage[]) => {
    if (msgs.length === 0) return;
    const firstUserMsg = msgs.find((m) => m.role === 'user');
    const preview = firstUserMsg?.text || 'Chat';
    const entry: ChatHistoryEntry = {
      id: Date.now().toString(),
      preview: preview.length > 50 ? preview.slice(0, 50) + '...' : preview,
      date: new Date().toISOString().split('T')[0] ?? '',
      messages: msgs.map((m) => ({
        role: m.role,
        text: m.text,
        ...(m.imageUri ? { imageUri: m.imageUri } : {}),
        isVideo: !!(m.frames && m.frames.length > 0),
      })) as ChatMessage[],
    };
    
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      const key = getHistoryKey();
      if (key) AsyncStorage.setItem(key, JSON.stringify(updated)).catch((e) => {
        console.warn('Chat history save failed:', e);
      });
      return updated;
    });
  }, []);

  const sendToUlly = async (newMessages: ChatMessage[]) => {
    if (loading) return;
    setLoading(true);
    try {
      const apiMessages = buildApiMessages(newMessages);
      const systemPrompt = buildSystemPrompt(weatherContextRef.current);
      const result = await ClaudeService.chatWithHistory(apiMessages, systemPrompt, 1500);
      const withReply: ChatMessage[] = [...newMessages, { role: 'ully', text: result }];
      setMessages(withReply);
      saveChat(withReply);
    } catch (error: any) {
      const isRateLimit = error?.code === 'functions/resource-exhausted';
      const errorText = isRateLimit
        ? error.message ?? `You've reached your free daily message limit. Your limit resets at midnight UTC.`
        : 'Could not reach Ully AI. Check your connection and try again.';
      const withError: ChatMessage[] = [
        ...newMessages,
        { role: 'ully', text: errorText },
      ];
      setMessages(withError);
    } finally {
      setLoading(false);
    }
  };

  const loadChatFromHistory = (entry: ChatHistoryEntry) => {
    setMessages(entry.messages);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setShowHistory(false);
  };

  const addMessage = async (msg: ChatMessage) => {
    const newMessages = [...messages, msg];
    setMessages(newMessages);
    await sendToUlly(newMessages);
  };

  return {
    messages,
    loading,
    history,
    showHistory,
    setShowHistory,
    addMessage,
    loadChatFromHistory,
    startNewChat
  };
}
