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
    setStoredXaiApiKey
} from './ApiKeyScreen';

interface ModelSelectorProps {
    onClose: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onClose }) => {
    const [textModel, setTextModel] = useState(getStoredModel());
    const [imageModel, setImageModel] = useState(getStoredImageModel());
    const [imageStyle, setImageStyle] = useState(getStoredImageStyle());
    const [xaiApiKey, setXaiApiKey] = useState(getStoredXaiApiKey() || '');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = () => {
        // Validate xAI API key if Grok 2 Image is selected
        if (imageModel === 'grok-2-image-1212' && !xaiApiKey.trim()) {
            setError('Grok 2 Imageを使用するには、xAI APIキーが必要です');
            return;
        }

        setStoredModel(textModel);
        setStoredImageModel(imageModel);
        setStoredImageStyle(imageStyle);
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

                <div className="space-y-5">
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

                    {imageModel === 'grok-2-image-1212' && (
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                                🔑 xAI API Key（画像生成用）
                            </label>
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

