import { httpsCallable } from 'firebase/functions';
import { functions } from './FirebaseConfig';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image';
    source?: {
      type: 'base64';
      media_type: 'image/jpeg' | 'image/png' | 'image/webp';
      data: string;
    };
    text?: string;
  }>;
}

interface ChatWithUllyResponse {
  text: string;
}

class ClaudeService {

  private async callFirebaseFunction(messages: ClaudeMessage[], maxTokens: number, systemPrompt: string | null): Promise<string> {
    try {
      const chatWithUlly = httpsCallable<{ messages: ClaudeMessage[]; maxTokens: number; systemPrompt: string | null }, ChatWithUllyResponse>(functions, 'chatWithUlly');
      const result = await chatWithUlly({ messages, maxTokens, systemPrompt });
      return result.data.text;
    } catch (error: any) {
      // Preserve rate-limit errors so useUllyChat can surface them specifically.
      if (error?.code === 'functions/resource-exhausted') throw error;
      if (__DEV__) console.error('Firebase Function Error:', error);
      throw new Error(`AI assistant error: ${error.message}`);
    }
  }

  async sendRequest(messages: ClaudeMessage[], maxTokens = 1024, systemPrompt: string | null = null): Promise<string> {
    // ALWAYS use Firebase Function in production for Zero-Vulnerability Security
    // This ensures API keys are NEVER on the device.
    return this.callFirebaseFunction(messages, maxTokens, systemPrompt);
  }

  async chatWithHistory(messages: ClaudeMessage[], systemPrompt: string, maxTokens = 1024): Promise<string> {
    return this.sendRequest(messages, maxTokens, systemPrompt);
  }
}

export default new ClaudeService();
