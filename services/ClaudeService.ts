import { httpsCallable } from 'firebase/functions';
import { functions } from './FirebaseConfig';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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

  /**
   * Validates that a base64 image string doesn't exceed the size cap.
   */
  validateImageSize(base64Data: string): void {
    const estimatedBytes = (base64Data.length * 3) / 4;
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image is too large. Please use an image under 5MB.');
    }
  }

  private async callFirebaseFunction(messages: ClaudeMessage[], maxTokens: number, systemPrompt: string | null): Promise<string> {
    try {
      const chatWithUlly = httpsCallable<{ messages: ClaudeMessage[]; maxTokens: number; systemPrompt: string | null }, ChatWithUllyResponse>(functions, 'chatWithUlly');
      const result = await chatWithUlly({ messages, maxTokens, systemPrompt });
      return result.data.text;
    } catch (error: any) {
      console.error('Firebase Function Error:', error);
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

  async diagnoseExtraction(base64Image: string, machineModel: string, context: string): Promise<string> {
    this.validateImageSize(base64Image);
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `You are a professional coffee equipment diagnostic assistant. Analyze this image.

Machine model: ${machineModel}
Context: ${context}

Provide a diagnosis covering:
1. What you observe in the image
2. Potential issues identified
3. Recommended fixes or adjustments
4. Parts that may need replacement (if applicable)

Be specific and actionable. Use professional coffee terminology.`,
          },
        ],
      },
    ];

    return this.sendRequest(messages, 1500);
  }

  async chat(text: string): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `You are Ully, a coffee AI. Only answer coffee-related questions...

User: ${text}`,
      },
    ];

    return this.sendRequest(messages, 1024);
  }

  async identifyPart(base64Image: string): Promise<string> {
    this.validateImageSize(base64Image);
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `You are a coffee equipment parts expert. Identify this part...`,
          },
        ],
      },
    ];

    return this.sendRequest(messages, 1500);
  }
}

export default new ClaudeService();
