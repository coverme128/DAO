// TTS Provider Interface
export interface TTSProvider {
  speak(text: string, options?: TTSOptions): Promise<TTSResult>;
}

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface TTSResult {
  audio: Buffer;
  visemeEvents?: Array<{ time: number; viseme: string }>;
}

// Azure Speech Service Implementation
export class AzureTTSProvider implements TTSProvider {
  private speechKey: string;
  private speechRegion: string;
  private defaultVoice: string = 'en-US-JennyNeural'; // Warm, friendly female voice

  constructor() {
    this.speechKey = process.env.AZURE_SPEECH_KEY || '';
    this.speechRegion = process.env.AZURE_SPEECH_REGION || '';
  }

  async speak(text: string, options?: TTSOptions): Promise<TTSResult> {
    if (!this.speechKey || !this.speechRegion) {
      throw new Error('Azure Speech Services configuration is missing. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION');
    }

    if (!text || text.trim().length === 0) {
      return {
        audio: Buffer.from(''),
        visemeEvents: [],
      };
    }

    try {
      const sdk = require('microsoft-cognitiveservices-speech-sdk');

      // Create speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.speechKey,
        this.speechRegion
      );

      // Set voice
      const voice = options?.voice || this.defaultVoice;
      speechConfig.speechSynthesisVoiceName = voice;

      // Set output format to MP3
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_SynthOutputFormat, 'audio-24khz-48kbitrate-mono-mp3');

      // Build SSML with voice, rate, and pitch
      let ssmlText = text;
      const rateValue = options?.rate !== undefined ? Math.max(0.5, Math.min(2.0, options.rate)) : 1.0;
      const pitchValue = options?.pitch !== undefined ? `${options.pitch > 0 ? '+' : ''}${options.pitch}%` : '0%';

      if (options?.rate !== undefined || options?.pitch !== undefined) {
        ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody rate="${rateValue}" pitch="${pitchValue}">${text}</prosody></voice></speak>`;
      } else {
        ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
      }

      // Create synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

      // Collect audio data and viseme events
      const audioChunks: Buffer[] = [];
      const visemeEvents: Array<{ time: number; viseme: string }> = [];

      synthesizer.synthesizing = (s: any, e: any) => {
        // Streaming audio chunks (optional for MVP)
      };

      synthesizer.visemeReceived = (s: any, e: any) => {
        // Viseme events for mouth synchronization
        visemeEvents.push({
          time: e.audioOffset / 10000000, // Convert to seconds
          viseme: this.mapVisemeId(e.visemeId),
        });
      };

      // Synthesize speech
      return new Promise<TTSResult>((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssmlText,
          (result: any) => {
            synthesizer.close();

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              // Get audio data
              const audioData = result.audioData;
              const audioBuffer = Buffer.from(audioData);

              resolve({
                audio: audioBuffer,
                visemeEvents: visemeEvents.length > 0 ? visemeEvents : undefined,
              });
            } else if (result.reason === sdk.ResultReason.Canceled) {
              const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
              reject(new Error(`TTS canceled: ${cancellation.reason} - ${cancellation.errorDetails}`));
            } else {
              reject(new Error(`TTS synthesis failed: ${result.reason}`));
            }
          },
          (error: any) => {
            synthesizer.close();
            reject(new Error(`TTS error: ${error}`));
          }
        );
      });
    } catch (error) {
      console.error('TTS error:', error);
      throw new Error(`TTS processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Azure viseme ID to viseme name
   * Viseme IDs: 0=silence, 1=aa, 2=aa, 3=aa, 4=aa, 5=aa, 6=aa, 7=aa, 8=aa, 9=aa, 10=aa, 11=aa, 12=aa, 13=aa, 14=aa, 15=aa, 16=aa, 17=aa, 18=aa, 19=aa, 20=aa, 21=aa
   */
  private mapVisemeId(visemeId: number): string {
    const visemeMap: Record<number, string> = {
      0: 'silence',
      1: 'aa', 2: 'aa', 3: 'aa', 4: 'aa', 5: 'aa',
      6: 'E', 7: 'E', 8: 'E', 9: 'E',
      10: 'I', 11: 'I', 12: 'I', 13: 'I',
      14: 'O', 15: 'O', 16: 'O', 17: 'O',
      18: 'U', 19: 'U', 20: 'U', 21: 'U',
    };
    return visemeMap[visemeId] || 'aa';
  }
}

export const ttsProvider = new AzureTTSProvider();
