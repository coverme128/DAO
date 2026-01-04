'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/config';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function TestPage() {
  const [asrResult, setAsrResult] = useState<TestResult | null>(null);
  const [asrLoading, setAsrLoading] = useState(false);
  const [asrFile, setAsrFile] = useState<File | null>(null);

  const [llmResult, setLlmResult] = useState<TestResult | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmInput, setLlmInput] = useState('Hello, how are you?');

  const [ttsResult, setTtsResult] = useState<TestResult | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsInput, setTtsInput] = useState('Hello, this is a test of text to speech.');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // ASR测试
  const testASR = async () => {
    if (!asrFile) {
      setAsrResult({
        success: false,
        message: '请先选择音频文件',
      });
      return;
    }

    setAsrLoading(true);
    setAsrResult(null);

    try {
      const formData = new FormData();
      formData.append('audio', asrFile);

      const response = await fetch(api.asr, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAsrResult({
          success: true,
          message: 'ASR测试成功',
          data: data,
        });
      } else {
        setAsrResult({
          success: false,
          message: 'ASR测试失败',
          error: data.error || '未知错误',
          data: data,
        });
      }
    } catch (error) {
      setAsrResult({
        success: false,
        message: 'ASR测试失败',
        error: error instanceof Error ? error.message : '网络错误',
      });
    } finally {
      setAsrLoading(false);
    }
  };

  // LLM测试
  const testLLM = async () => {
    if (!llmInput.trim()) {
      setLlmResult({
        success: false,
        message: '请输入测试文本',
      });
      return;
    }

    setLlmLoading(true);
    setLlmResult(null);

    try {
      // 使用测试用的userId和sessionId
      const response = await fetch(api.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user',
          sessionId: 'test-session',
          userText: llmInput,
          history: [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLlmResult({
          success: true,
          message: 'LLM测试成功',
          data: data,
        });
      } else {
        setLlmResult({
          success: false,
          message: 'LLM测试失败',
          error: data.error || '未知错误',
          data: data,
        });
      }
    } catch (error) {
      setLlmResult({
        success: false,
        message: 'LLM测试失败',
        error: error instanceof Error ? error.message : '网络错误',
      });
    } finally {
      setLlmLoading(false);
    }
  };

  // TTS测试
  const testTTS = async () => {
    if (!ttsInput.trim()) {
      setTtsResult({
        success: false,
        message: '请输入测试文本',
      });
      return;
    }

    setTtsLoading(true);
    setTtsResult(null);
    setTtsAudioUrl(null);

    try {
      const response = await fetch(api.tts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsInput,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setTtsAudioUrl(audioUrl);

        setTtsResult({
          success: true,
          message: 'TTS测试成功，音频已生成',
          data: {
            contentType: response.headers.get('Content-Type'),
            size: audioBlob.size,
          },
        });
      } else {
        const data = await response.json();
        setTtsResult({
          success: false,
          message: 'TTS测试失败',
          error: data.error || '未知错误',
          data: data,
        });
      }
    } catch (error) {
      setTtsResult({
        success: false,
        message: 'TTS测试失败',
        error: error instanceof Error ? error.message : '网络错误',
      });
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API接口测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试ASR、LLM、TTS基础接口的连接和功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ASR测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ASR测试
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择音频文件
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAsrFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-gray-700 dark:file:text-gray-300"
                />
              </div>
              <button
                onClick={testASR}
                disabled={asrLoading || !asrFile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {asrLoading ? '测试中...' : '测试ASR'}
              </button>
              {asrResult && (
                <div className={`p-4 rounded-md ${
                  asrResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`font-medium ${
                    asrResult.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {asrResult.message}
                  </p>
                  {asrResult.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      错误: {asrResult.error}
                    </p>
                  )}
                  {asrResult.data && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(asrResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LLM测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              LLM测试
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输入测试文本
                </label>
                <textarea
                  value={llmInput}
                  onChange={(e) => setLlmInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入要测试的文本..."
                />
              </div>
              <button
                onClick={testLLM}
                disabled={llmLoading || !llmInput.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {llmLoading ? '测试中...' : '测试LLM'}
              </button>
              {llmResult && (
                <div className={`p-4 rounded-md ${
                  llmResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`font-medium ${
                    llmResult.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {llmResult.message}
                  </p>
                  {llmResult.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      错误: {llmResult.error}
                    </p>
                  )}
                  {llmResult.data && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(llmResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* TTS测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              TTS测试
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输入测试文本
                </label>
                <textarea
                  value={ttsInput}
                  onChange={(e) => setTtsInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入要转换为语音的文本..."
                />
              </div>
              <button
                onClick={testTTS}
                disabled={ttsLoading || !ttsInput.trim()}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {ttsLoading ? '测试中...' : '测试TTS'}
              </button>
              {ttsResult && (
                <div className={`p-4 rounded-md ${
                  ttsResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`font-medium ${
                    ttsResult.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {ttsResult.message}
                  </p>
                  {ttsResult.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      错误: {ttsResult.error}
                    </p>
                  )}
                  {ttsResult.data && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(ttsResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {ttsAudioUrl && (
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={ttsAudioUrl} type="audio/mpeg" />
                    您的浏览器不支持音频播放。
                  </audio>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

