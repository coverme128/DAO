// ASR Provider Interface
export interface ASRProvider {
  transcribe(audio: Buffer, options?: ASROptions): Promise<ASRResult>;
}

export interface ASROptions {
  language?: string;
  format?: string;
}

export interface ASRResult {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
}

// Azure Speech Service Implementation
export class AzureASRProvider implements ASRProvider {
  private speechKey: string;
  private speechRegion: string;

  constructor() {
    this.speechKey = process.env.AZURE_SPEECH_KEY || '';
    this.speechRegion = process.env.AZURE_SPEECH_REGION || '';
  }

  async transcribe(audio: Buffer, options?: ASROptions): Promise<ASRResult> {
    if (!this.speechKey || !this.speechRegion) {
      throw new Error('Azure Speech Services configuration is missing. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION');
    }

    try {
      const sdk = require('microsoft-cognitiveservices-speech-sdk');
      
      // Create speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.speechKey,
        this.speechRegion
      );

      // Set language (default to English)
      speechConfig.speechRecognitionLanguage = options?.language || 'en-US';

      // Create push audio input stream
      const pushStream = sdk.AudioInputStream.createPushStream();
      
      // Write audio data to stream
      pushStream.write(audio);
      pushStream.close();

      // Create audio config from stream
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      // Create recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Perform recognition (single-shot)
      return new Promise<ASRResult>((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result: any) => {
            recognizer.close();

            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              resolve({
                text: result.text,
              });
            } else if (result.reason === sdk.ResultReason.NoMatch) {
              reject(new Error('No speech could be recognized. Please try again.'));
            } else if (result.reason === sdk.ResultReason.Canceled) {
              const cancellation = sdk.CancellationDetails.fromResult(result);
              reject(new Error(`Recognition canceled: ${cancellation.reason} - ${cancellation.errorDetails}`));
            } else {
              reject(new Error(`Recognition failed: ${result.reason}`));
            }
          },
          (error: any) => {
            recognizer.close();
            reject(new Error(`Recognition error: ${error}`));
          }
        );
      });
    } catch (error) {
      console.error('ASR error:', error);
      throw new Error(`ASR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const asrProvider = new AzureASRProvider();
