import { memoryService } from './memory';
import { sessionService } from './session';
import { billingService } from './billing';
import type { Plan } from './billing';
import { AzureOpenAI } from '@azure/openai';

export interface ChatRequest {
  userId: string;
  sessionId: string;
  userText: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  assistantText: string;
  controlTags?: {
    emotion?: string;
    gesture?: string[];
    intensity?: number;
  };
}

export interface ASRResult {
  text: string;
}

export interface TTSResult {
  audio: Buffer;
  visemeEvents?: Array<{ time: number; viseme: string }>;
}

export class OrchestratorService {
  private openAIClient: AzureOpenAI | null = null;

  private getOpenAIClient(): AzureOpenAI {
    if (this.openAIClient) {
      return this.openAIClient;
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

    if (!endpoint || !apiKey || !deploymentName) {
      throw new Error('Azure OpenAI configuration is missing. Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME');
    }

    this.openAIClient = new AzureOpenAI({
      endpoint,
      apiKey,
    });

    return this.openAIClient;
  }

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    const user = await billingService.getUser(request.userId);
    const plan = user?.plan || 'FREE';

    // Get memory summary
    const memorySummary = await memoryService.getMemorySummary(request.userId);

    // Get history
    const history = request.history || await sessionService.getHistory(request.sessionId);

    // Build messages with memory context
    const messages = this.buildMessagesWithMemory(
      memorySummary,
      history,
      request.userText
    );

    // Call LLM
    const assistantText = await this.callLLM(messages);

    // Save messages
    await sessionService.createMessage({
      sessionId: request.sessionId,
      role: 'USER',
      content: request.userText,
    });

    await sessionService.createMessage({
      sessionId: request.sessionId,
      role: 'ASSISTANT',
      content: assistantText,
    });

    // Update memory summary
    const allMessages = [
      ...history,
      { role: 'user', content: request.userText },
      { role: 'assistant', content: assistantText },
    ];
    const newSummary = await memoryService.generateSummary(allMessages);
    await memoryService.updateMemory(request.userId, newSummary, plan);

    return {
      assistantText,
      controlTags: {
        emotion: 'warm',
        gesture: [],
        intensity: 0.6,
      },
    };
  }

  private buildMessagesWithMemory(
    memorySummary: string,
    history: Array<{ role: string; content: string }>,
    userText: string
  ) {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // System prompt
    messages.push({
      role: 'system',
      content: this.getSystemPrompt(memorySummary),
    });

    // History - convert from database format
    messages.push(...history.map((msg: any) => ({
      role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    })));

    // Current user message
    messages.push({
      role: 'user',
      content: userText,
    });

    return messages;
  }

  private getSystemPrompt(memorySummary: string): string {
    return `You are Acoda, a warm and gentle AI companion. You speak in a friendly, concise manner.

${memorySummary ? `Context from previous conversations:\n${memorySummary}\n` : ''}

Guidelines:
- Be warm and brief in your responses
- Ask clarifying questions when needed
- Never claim to be human or have real experiences
- Do not provide medical, legal, or financial advice
- If you detect crisis or danger, suggest seeking professional help

Keep responses conversational and natural.`;
  }

  private async callLLM(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
    try {
      const client = this.getOpenAIClient();
      const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;

      // Convert messages to Azure OpenAI format
      const azureMessages = messages.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await client.chat.completions.create({
        model: deploymentName,
        messages: azureMessages,
        temperature: 0.7,
        maxTokens: 500,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';
      
      if (!assistantMessage) {
        throw new Error('No response from Azure OpenAI');
      }

      return assistantMessage;
    } catch (error) {
      console.error('Azure OpenAI error:', error);
      
      // Fallback to placeholder if Azure OpenAI is not configured
      if (error instanceof Error && error.message.includes('configuration is missing')) {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        return `I understand you said: "${lastUserMessage?.content || ''}". Please configure Azure OpenAI to enable full functionality.`;
      }

      throw error;
    }
  }
}

export const orchestratorService = new OrchestratorService();
