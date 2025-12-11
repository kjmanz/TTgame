import React, { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'openrouter_api_key';
const XAI_API_KEY_STORAGE_KEY = 'xai_api_key';
const MODEL_STORAGE_KEY = 'openrouter_model';
const IMAGE_MODEL_STORAGE_KEY = 'openrouter_image_model';
const IMAGE_STYLE_STORAGE_KEY = 'image_style';
const STREAMING_MODE_STORAGE_KEY = 'streaming_mode';

// 利用可能な文章生成モデル一覧
// ※推奨モデルのみに絞っています
export const AVAILABLE_TEXT_MODELS = [
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek V3',
    description: '高品質、日本語OK、安定して3000文字出力',
    price: '$0.55/M'
  },
  {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    description: '高速、高品質、無検閲、日本語OK',
    price: '$3/M'
  }
];

// 利用可能な画像生成モデル一覧
export const AVAILABLE_IMAGE_MODELS = [
  {
    id: 'none',
    name: '画像生成を無効化',
    description: '画像生成しない',
    price: '無料'
  },
  {
    id: 'grok-2-image-1212',
    name: 'Grok 2 Image',
    description: 'xAI画像生成（要xAI APIキー）',
    price: '$0.01/枚'
  }
];

// 画像スタイル選択肢
export const AVAILABLE_IMAGE_STYLES = [
  {
    id: 'photorealistic',
    name: '実写風',
    description: 'フォトリアリスティック、写真のような画像'
  },
  {
    id: 'realistic_anime',
    name: 'リアル系アニメ',
    description: '写実的なアニメ風、CG・3Dアニメ調'
  },
  {
    id: 'illustration_anime',
    name: 'イラスト系アニメ',
    description: '2Dイラスト・手描き風アニメ調'
  }
];

interface ApiKeyScreenProps {
  onApiKeySet: () => void;
}

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const clearStoredApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const getStoredXaiApiKey = (): string | null => {
  return localStorage.getItem(XAI_API_KEY_STORAGE_KEY);
};

export const setStoredXaiApiKey = (key: string): void => {
  localStorage.setItem(XAI_API_KEY_STORAGE_KEY, key);
};

export const getStoredModel = (): string => {
  return localStorage.getItem(MODEL_STORAGE_KEY) || AVAILABLE_TEXT_MODELS[0].id;
};

export const setStoredModel = (modelId: string): void => {
  localStorage.setItem(MODEL_STORAGE_KEY, modelId);
};

export const getStoredImageModel = (): string => {
  return localStorage.getItem(IMAGE_MODEL_STORAGE_KEY) || AVAILABLE_IMAGE_MODELS[0].id;
};

export const setStoredImageModel = (modelId: string): void => {
  localStorage.setItem(IMAGE_MODEL_STORAGE_KEY, modelId);
};

export const getStoredImageStyle = (): string => {
  return localStorage.getItem(IMAGE_STYLE_STORAGE_KEY) || AVAILABLE_IMAGE_STYLES[0].id;
};

export const setStoredImageStyle = (styleId: string): void => {
  localStorage.setItem(IMAGE_STYLE_STORAGE_KEY, styleId);
};

// Streaming mode: true = streaming display, false = batch display
export const getStoredStreamingMode = (): boolean => {
  const stored = localStorage.getItem(STREAMING_MODE_STORAGE_KEY);
  return stored === null ? true : stored === 'true'; // default is streaming mode
};

export const setStoredStreamingMode = (enabled: boolean): void => {
  localStorage.setItem(STREAMING_MODE_STORAGE_KEY, enabled.toString());
};

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [xaiApiKey, setXaiApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_TEXT_MODELS[0].id);
  const [selectedImageModel, setSelectedImageModel] = useState(AVAILABLE_IMAGE_MODELS[0].id);
  const [streamingMode, setStreamingMode] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if API key already exists
    const existingKey = getStoredApiKey();
    if (existingKey) {
      onApiKeySet();
    }
    // Load saved model preferences
    const savedModel = getStoredModel();
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    const savedImageModel = getStoredImageModel();
    if (savedImageModel) {
      setSelectedImageModel(savedImageModel);
    }
    // Load xAI API key
    const savedXaiKey = getStoredXaiApiKey();
    if (savedXaiKey) {
      setXaiApiKey(savedXaiKey);
    }
    // Load streaming mode preference
    setStreamingMode(getStoredStreamingMode());
  }, [onApiKeySet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('OpenRouter APIキーを入力してください');
      return;
    }

    if (!apiKey.startsWith('sk-or-')) {
      setError('有効なOpenRouter APIキーを入力してください（sk-or-で始まる必要があります）');
      return;
    }

    // Validate xAI API key if Grok 2 Image is selected
    if (selectedImageModel === 'grok-2-image-1212' && !xaiApiKey.trim()) {
      setError('Grok 2 Imageを使用するには、xAI APIキーが必要です');
      return;
    }

    setIsLoading(true);

    try {
      // Simple validation - try a minimal API call
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('APIキーが無効です');
      }

      setStoredApiKey(apiKey);
      setStoredModel(selectedModel);
      setStoredImageModel(selectedImageModel);
      setStoredStreamingMode(streamingMode);
      if (xaiApiKey.trim()) {
        setStoredXaiApiKey(xaiApiKey);
      }
      onApiKeySet();
    } catch (err) {
      setError('APIキーの検証に失敗しました。正しいキーを入力してください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-gray-100 font-serif flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
            🔑
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-wider text-gray-100 mb-3">
            API設定
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            APIキーと使用するモデルを設定してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="apiKey" className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              OpenRouter API Key（必須）
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="xaiApiKey" className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              xAI API Key（画像生成用・任意）
            </label>
            <input
              type="password"
              id="xaiApiKey"
              value={xaiApiKey}
              onChange={(e) => setXaiApiKey(e.target.value)}
              placeholder="xai-..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              ※ Grok 2 Image使用時のみ必要
            </p>
          </div>

          <div>
            <label htmlFor="model" className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              📝 文章生成モデル
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              disabled={isLoading}
            >
              {AVAILABLE_TEXT_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="bg-[#1a1a1d] text-gray-100">
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageModel" className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              🖼️ 画像生成モデル
            </label>
            <select
              id="imageModel"
              value={selectedImageModel}
              onChange={(e) => setSelectedImageModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              disabled={isLoading}
            >
              {AVAILABLE_IMAGE_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="bg-[#1a1a1d] text-gray-100">
                  {model.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedImageModel === 'grok-2-image-1212' && '※ xAI APIキーが必要です'}
            </p>
          </div>

          {/* Streaming Mode Toggle */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
              ⚡ テキスト表示モード
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${streamingMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio"
                  name="streamingMode"
                  checked={streamingMode}
                  onChange={() => setStreamingMode(true)}
                  className="w-4 h-4 text-indigo-500"
                />
                <div>
                  <p className="font-medium text-white text-sm">リアルタイム</p>
                  <p className="text-xs text-gray-400">文字が流れるように表示</p>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!streamingMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio"
                  name="streamingMode"
                  checked={!streamingMode}
                  onChange={() => setStreamingMode(false)}
                  className="w-4 h-4 text-indigo-500"
                />
                <div>
                  <p className="font-medium text-white text-sm">一括表示</p>
                  <p className="text-xs text-gray-400">生成完了後に表示</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? '検証中...' : '設定を保存'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4 transition-colors"
          >
            OpenRouter APIキーを取得 →
          </a>
          <a
            href="https://console.x.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4 transition-colors"
          >
            xAI APIキーを取得 →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyScreen;

