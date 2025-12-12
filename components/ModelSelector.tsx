import React, { useState } from 'react';
import {
    AVAILABLE_TEXT_MODELS,
    AVAILABLE_IMAGE_MODELS,
    AVAILABLE_IMAGE_STYLES,
    getStoredModel,
    setStoredModel,
    getStoredImageModel,
    setStoredImageModel,
    getStoredImageStyle,
    setStoredImageStyle,
    getStoredXaiApiKey,
    setStoredXaiApiKey,
    getStoredApiKey,
    setStoredApiKey,
    getStoredStreamingMode,
    setStoredStreamingMode,
    getStoredInnerThoughtsMode,
    setStoredInnerThoughtsMode,
    getStoredFontSize,
    setStoredFontSize,
    getStoredImageCount,
    setStoredImageCount
} from './ApiKeyScreen';

interface ModelSelectorProps {
    onClose: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onClose }) => {
    const [textModel, setTextModel] = useState(getStoredModel());
    const [imageModel, setImageModel] = useState(getStoredImageModel());
    const [imageStyle, setImageStyle] = useState(getStoredImageStyle());
    const [xaiApiKey, setXaiApiKey] = useState(getStoredXaiApiKey() || '');
    const [apiKey, setApiKey] = useState(getStoredApiKey() || '');
    const [streamingMode, setStreamingMode] = useState(getStoredStreamingMode());
    const [innerThoughtsMode, setInnerThoughtsMode] = useState(getStoredInnerThoughtsMode());
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(getStoredFontSize());
    const [imageCount, setImageCount] = useState<1 | 2 | 4>(getStoredImageCount());
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Toggle states for editing API keys (hidden if already saved)
    const [showApiKeyEdit, setShowApiKeyEdit] = useState(!getStoredApiKey());
    const [showXaiKeyEdit, setShowXaiKeyEdit] = useState(!getStoredXaiApiKey());

    const handleSave = () => {
        // Validate OpenRouter API key
        if (!apiKey.trim()) {
            setError('OpenRouter APIキーを入力してください');
            return;
        }
        if (!apiKey.startsWith('sk-or-')) {
            setError('有効なOpenRouter APIキーを入力してください（sk-or-で始まる必要があります）');
            return;
        }

        // Validate xAI API key if Grok 2 Image is selected
        if (imageModel === 'grok-2-image-1212' && !xaiApiKey.trim()) {
            setError('Grok 2 Imageを使用するには、xAI APIキーが必要です');
            return;
        }

        setStoredApiKey(apiKey);
        setStoredModel(textModel);
        setStoredImageModel(imageModel);
        setStoredImageStyle(imageStyle);
        setStoredStreamingMode(streamingMode);
        setStoredInnerThoughtsMode(innerThoughtsMode);
        setStoredFontSize(fontSize);
        setStoredImageCount(imageCount);
        if (xaiApiKey.trim()) {
            setStoredXaiApiKey(xaiApiKey);
        }
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold text-gray-100 tracking-wider">
                        ⚙️ モデル設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* OpenRouter API Key */}
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                            🔑 OpenRouter API Key
                        </label>
                        {showApiKeyEdit ? (
                            <>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                                <a
                                    href="https://openrouter.ai/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block"
                                >
                                    OpenRouter APIキーを取得 →
                                </a>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 font-mono text-sm">
                                    sk-or-••••••••••••••
                                </div>
                                <button
                                    onClick={() => setShowApiKeyEdit(true)}
                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-all"
                                >
                                    変更
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                            📝 文章生成モデル
                        </label>
                        <select
                            value={textModel}
                            onChange={(e) => setTextModel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        >
                            {AVAILABLE_TEXT_MODELS.map((model) => (
                                <option key={model.id} value={model.id} className="bg-[#1a1a1d] text-gray-100">
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {AVAILABLE_TEXT_MODELS.find(m => m.id === textModel)?.description}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                            🖼️ 画像生成モデル
                        </label>
                        <select
                            value={imageModel}
                            onChange={(e) => setImageModel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        >
                            {AVAILABLE_IMAGE_MODELS.map((model) => (
                                <option key={model.id} value={model.id} className="bg-[#1a1a1d] text-gray-100">
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {AVAILABLE_IMAGE_MODELS.find(m => m.id === imageModel)?.description}
                        </p>
                    </div>

                    {imageModel !== 'none' && (
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                                🎨 画像スタイル
                            </label>
                            <select
                                value={imageStyle}
                                onChange={(e) => setImageStyle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            >
                                {AVAILABLE_IMAGE_STYLES.map((style) => (
                                    <option key={style.id} value={style.id} className="bg-[#1a1a1d] text-gray-100">
                                        {style.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {AVAILABLE_IMAGE_STYLES.find(s => s.id === imageStyle)?.description}
                            </p>
                        </div>
                    )}

                    {/* Streaming Mode Toggle */}
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                            ⚡ テキスト表示モード
                        </label>
                        <div className="flex gap-3">
                            <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${streamingMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                <input
                                    type="radio"
                                    name="streamingMode"
                                    checked={streamingMode}
                                    onChange={() => setStreamingMode(true)}
                                    className="w-3 h-3 text-indigo-500"
                                />
                                <div>
                                    <p className="font-medium text-white text-xs">リアルタイム</p>
                                    <p className="text-[10px] text-gray-400">文字が流れるように表示</p>
                                </div>
                            </label>
                            <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${!streamingMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                <input
                                    type="radio"
                                    name="streamingMode"
                                    checked={!streamingMode}
                                    onChange={() => setStreamingMode(false)}
                                    className="w-3 h-3 text-indigo-500"
                                />
                                <div>
                                    <p className="font-medium text-white text-xs">一括表示</p>
                                    <p className="text-[10px] text-gray-400">生成完了後に表示</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Inner Thoughts Mode Toggle */}
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                            💭 女性の内心（本音）表示
                        </label>
                        <div className="flex gap-3">
                            <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${innerThoughtsMode ? 'bg-pink-900/30 border-pink-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                <input
                                    type="radio"
                                    name="innerThoughtsMode"
                                    checked={innerThoughtsMode}
                                    onChange={() => setInnerThoughtsMode(true)}
                                    className="w-3 h-3 text-pink-500"
                                />
                                <div>
                                    <p className="font-medium text-white text-xs">ON</p>
                                    <p className="text-[10px] text-gray-400">本音を（　）で表示</p>
                                </div>
                            </label>
                            <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${!innerThoughtsMode ? 'bg-pink-900/30 border-pink-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                <input
                                    type="radio"
                                    name="innerThoughtsMode"
                                    checked={!innerThoughtsMode}
                                    onChange={() => setInnerThoughtsMode(false)}
                                    className="w-3 h-3 text-pink-500"
                                />
                                <div>
                                    <p className="font-medium text-white text-xs">OFF</p>
                                    <p className="text-[10px] text-gray-400">セリフのみ表示</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Font Size Toggle */}
                    <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                            📖 文字サイズ
                        </label>
                        <div className="flex gap-2">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setFontSize(size)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${fontSize === size
                                            ? 'bg-green-900/30 border-green-500 text-green-200'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                        }`}
                                >
                                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Count Toggle */}
                    {imageModel !== 'none' && (
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                🖼️ 画像生成枚数
                            </label>
                            <div className="flex gap-2">
                                {([1, 2, 4] as const).map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setImageCount(count)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${imageCount === count
                                                ? 'bg-purple-900/30 border-purple-500 text-purple-200'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        {count}枚
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                複数枚生成時はバリエーションから選択できます
                            </p>
                        </div>
                    )}

                    {imageModel === 'grok-2-image-1212' && (
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                                🔑 xAI API Key（画像生成用）
                            </label>
                            {showXaiKeyEdit ? (
                                <>
                                    <input
                                        type="password"
                                        value={xaiApiKey}
                                        onChange={(e) => setXaiApiKey(e.target.value)}
                                        placeholder="xai-..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        <a
                                            href="https://console.x.ai/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-400 hover:text-indigo-300 underline"
                                        >
                                            xAI APIキーを取得 →
                                        </a>
                                    </p>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 font-mono text-sm">
                                        xai-••••••••••••••
                                    </div>
                                    <button
                                        onClick={() => setShowXaiKeyEdit(true)}
                                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-all"
                                    >
                                        変更
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded-lg text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all border border-white/10"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {saved ? '✓ 保存完了' : '保存'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-600">
                        現在: {AVAILABLE_TEXT_MODELS.find(m => m.id === getStoredModel())?.name || '未設定'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModelSelector;

