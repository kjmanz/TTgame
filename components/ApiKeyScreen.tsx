import React, { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'openrouter_api_key';
const MODEL_STORAGE_KEY = 'openrouter_model';
const IMAGE_MODEL_STORAGE_KEY = 'openrouter_image_model';

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
// ※価格順：安い順に並んでいます
// ※注意: OpenRouterの画像生成モデルは全てNSFWコンテンツを生成できません
export const AVAILABLE_IMAGE_MODELS = [
  {
    id: 'none',
    name: '画像生成を無効化（推奨）',
    description: 'NSFW画像は生成不可のため無効化推奨',
    price: '無料'
  },
  {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    description: '最安・高速（NSFW不可）',
    price: '$0.001/枚'
  },
  {
    id: 'openai/gpt-5-image-mini',
    name: 'GPT-5 Image Mini',
    description: '高品質・実写風（NSFW不可）',
    price: '$1.1/M'
  },
  {
    id: 'openai/gpt-5-image',
    name: 'GPT-5 Image',
    description: '最高品質（NSFW不可）',
    price: '$5/M'
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

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_TEXT_MODELS[0].id);
  const [selectedImageModel, setSelectedImageModel] = useState(AVAILABLE_IMAGE_MODELS[0].id);
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
  }, [onApiKeySet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('APIキーを入力してください');
      return;
    }

    if (!apiKey.startsWith('sk-or-')) {
      setError('有効なOpenRouter APIキーを入力してください（sk-or-で始まる必要があります）');
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
            OpenRouter APIキーと使用するモデルを設定してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="apiKey" className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              OpenRouter API Key
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
            <p className="text-xs text-gray-500 mt-1">
              ※ Dolphin 3.0 (無料・無検閲) がおすすめ
            </p>
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
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ※ FLUX 1.1 Pro (高品質・無検閲) がおすすめ
            </p>
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

        <div className="mt-6 text-center">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4 transition-colors"
          >
            APIキーを取得する →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyScreen;
