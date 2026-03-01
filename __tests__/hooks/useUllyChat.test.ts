import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUllyChat } from '../../hooks/useUllyChat';
import ClaudeService from '../../services/ClaudeService';
import * as WeatherService from '../../services/WeatherLocationService';

// Per-test mocks (setup-level mocks are in jest.setup.ts)
const mockChatWithHistory = ClaudeService.chatWithHistory as jest.Mock;
const mockGetWeather = WeatherService.getWeatherAndLocation as jest.Mock;

/** Flush the microtask queue and let pending Promises settle. */
const flushPromises = () => act(async () => { await new Promise(r => setTimeout(r, 0)); });

// ─── Helpers ─────────────────────────────────────────────────────────────────
const USER_MSG = { role: 'user' as const, text: 'Best espresso ratio?' };
const ULLY_REPLY = '1:2 is the classic starting point — 18g in, 36g out.';

// ─── Initial state ────────────────────────────────────────────────────────────
describe('initial state', () => {
  it('starts with empty messages, no loading, no history', () => {
    const { result } = renderHook(() => useUllyChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.history).toEqual([]);
    expect(result.current.showHistory).toBe(false);
  });
});

// ─── addMessage ───────────────────────────────────────────────────────────────
describe('addMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    mockChatWithHistory.mockResolvedValue(ULLY_REPLY);
  });

  it('appends the user message and the ully reply', async () => {
    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject(USER_MSG);
    expect(result.current.messages[1]).toMatchObject({ role: 'ully', text: ULLY_REPLY });
  });

  it('sets loading true during the request, false after', async () => {
    let resolveAI!: (v: string) => void;
    mockChatWithHistory.mockReturnValue(new Promise((res) => { resolveAI = res; }));

    const { result } = renderHook(() => useUllyChat());

    // Kick off but don't await
    act(() => { result.current.addMessage(USER_MSG); });
    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => { resolveAI(ULLY_REPLY); });
    expect(result.current.loading).toBe(false);
  });

  it('appends an error message when ClaudeService throws', async () => {
    mockChatWithHistory.mockRejectedValue(new Error('Network timeout'));

    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].text).toContain('Could not reach Ully AI');
  });

  it('persists the conversation to AsyncStorage after a successful round-trip', async () => {
    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@ully_chat_history_test-uid',
        expect.any(String)
      )
    );
  });

  it('saves a history entry with the correct preview text', async () => {
    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    await waitFor(() => expect(result.current.history).toHaveLength(1));
    expect(result.current.history[0].preview).toContain('Best espresso ratio');
  });

  it('caps history preview at 50 characters with ellipsis', async () => {
    const { result } = renderHook(() => useUllyChat());
    const longText = 'A'.repeat(60);

    await act(async () => {
      await result.current.addMessage({ role: 'user', text: longText });
    });

    await waitFor(() => expect(result.current.history).toHaveLength(1));
    expect(result.current.history[0].preview.length).toBeLessThanOrEqual(53); // 50 + '...'
    expect(result.current.history[0].preview.endsWith('...')).toBe(true);
  });

  it('limits stored history to 50 entries', async () => {
    // Seed AsyncStorage with 50 existing entries
    const existingHistory = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      preview: `Old chat ${i}`,
      date: '2025-01-01',
      messages: [],
    }));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingHistory));

    const { result } = renderHook(() => useUllyChat());
    await waitFor(() => expect(result.current.history).toHaveLength(50));

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    await waitFor(() => expect(result.current.history).toHaveLength(50));
  });
});

// ─── startNewChat ─────────────────────────────────────────────────────────────
describe('startNewChat', () => {
  it('clears messages and hides history panel', async () => {
    mockChatWithHistory.mockResolvedValue(ULLY_REPLY);
    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    act(() => result.current.startNewChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.showHistory).toBe(false);
  });
});

// ─── loadChatFromHistory ──────────────────────────────────────────────────────
describe('loadChatFromHistory', () => {
  it('restores a previous conversation and closes the history panel', () => {
    const { result } = renderHook(() => useUllyChat());

    const entry = {
      id: '42',
      preview: 'Old question',
      date: '2025-01-01',
      messages: [
        { role: 'user' as const, text: 'Old question' },
        { role: 'ully' as const, text: 'Old answer' },
      ],
    };

    act(() => result.current.loadChatFromHistory(entry));

    expect(result.current.messages).toEqual(entry.messages);
    expect(result.current.showHistory).toBe(false);
  });
});

// ─── Weather context injection ────────────────────────────────────────────────
describe('weather context injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('injects city and weather condition into the system prompt when context is available', async () => {
    mockGetWeather.mockResolvedValue({
      city: 'Seattle',
      region: 'Washington',
      country: 'United States',
      tempC: '10',
      tempF: '50',
      feelsLikeC: '8',
      feelsLikeF: '46',
      condition: 'Heavy rain',
    });
    mockChatWithHistory.mockResolvedValue('Try a warming flat white!');

    const { result } = renderHook(() => useUllyChat());
    // Flush twice: first tick lets useEffect fire and call getWeatherAndLocation(),
    // second tick lets the resolved Promise's .then() update the ref.
    await flushPromises();
    await flushPromises();

    await act(async () => {
      await result.current.addMessage({ role: 'user', text: 'What should I drink today?' });
    });

    const [, systemPrompt] = mockChatWithHistory.mock.calls[0];
    expect(systemPrompt).toContain('Seattle');
    expect(systemPrompt).toContain('Heavy rain');
    expect(systemPrompt).toContain('50');  // °F
  });

  it('falls back to the base prompt when weather context is unavailable', async () => {
    mockGetWeather.mockResolvedValue(null);
    mockChatWithHistory.mockResolvedValue('Good choice!');

    const { result } = renderHook(() => useUllyChat());

    await act(async () => {
      await result.current.addMessage(USER_MSG);
    });

    const [, systemPrompt] = mockChatWithHistory.mock.calls[0];
    expect(systemPrompt).not.toContain('Location:');
    expect(systemPrompt).not.toContain('Weather:');
    expect(systemPrompt).toContain('Ully');
  });
});
