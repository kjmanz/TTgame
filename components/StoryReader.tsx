import React, { useState, useEffect, useRef } from 'react';
import { Character, StorySegment, SceneCandidate } from '../types';

interface Props {
  character: Character;
  segment: StorySegment;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  onChoice: (choice: string) => void;
  onUndo: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
  generatedImageUrl: string | null;
  onGenerateImage: () => void;
  onEditImage: (prompt: string) => void;
  isGeneratingImage: boolean;
  isEditingImage: boolean;
  isExtractingScenes: boolean;
  isSelectingScene: boolean;
  sceneCandidates: SceneCandidate[] | null;
  onSelectScene: (scene: SceneCandidate) => void;
  onCancelSceneSelection: () => void;
}

const StoryReader: React.FC<Props> = ({
  character,
  segment,
  history,
  onChoice,
  onUndo,
  onRegenerate,
  isLoading,
  generatedImageUrl,
  onGenerateImage,
  onEditImage,
  isGeneratingImage,
  isEditingImage,
  isExtractingScenes,
  isSelectingScene,
  sceneCandidates,
  onSelectScene,
  onCancelSceneSelection
}) => {
  const [customInput, setCustomInput] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const textRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Scroll to top on new chapter/segment and close modal
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = 0;
    }
    setIsChoiceModalOpen(false);
  }, [segment]);

  // Scroll history to bottom when opened
  useEffect(() => {
    if (isHistoryModalOpen && historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [isHistoryModalOpen]);

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (val) {
      setLastAction(val);
      setIsChoiceModalOpen(false); // Close immediately for feedback
      setCustomInput('');
      onChoice(val);
    }
  };

  const handleEditImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEditImage(editPrompt);
      setEditPrompt('');
      setShowEditInput(false);
    }
  };

  const handleSelectChoice = (choice: string) => {
    setLastAction(choice);
    setIsChoiceModalOpen(false);
    onChoice(choice);
  };

  // Helper to split text into paragraphs for better spacing and animation
  // allowAnimation flag controls whether fade-in is used (disable for history)
  const renderFormattedText = (text: string, allowAnimation = true) => {
    if (!text) return "読み込みエラーが発生しました。再試行してください。";

    // Split by newlines and filter empty lines
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

    return paragraphs.map((para, idx) => (
      <p
        key={idx}
        className={`mb-8 md:mb-12 leading-[2.2] md:leading-[2.6] tracking-wider text-justify text-[1.05rem] md:text-xl text-ink/90 font-serif font-medium ${allowAnimation ? 'opacity-0 animate-fade-in-slow' : ''}`}
        style={allowAnimation ? {
          animationDelay: `${idx * 0.2}s`,
          animationFillMode: 'forwards'
        } : {}}
      >
        {para}
      </p>
    ));
  };

  const isInitialLoad = isLoading && (!segment.text || segment.text.length === 0);

  return (
    <div className="flex flex-col lg:flex-row h-full max-w-7xl mx-auto gap-0 lg:gap-8 pb-32 lg:pb-10 relative">

      {/* FULLSCREEN LOADING OVERLAY - 文章生成中 */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-[#0f0f12]/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="w-24 h-24 rounded-full border-4 border-indigo-900/30 flex items-center justify-center">
              {/* Spinning ring */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
              {/* Pulsing inner circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center animate-pulse">
                <span className="text-3xl">✒︎</span>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-100 mb-3 tracking-wider">物語を執筆中...</h3>
          <p className="text-gray-400 text-sm font-serif tracking-widest animate-pulse">WRITING STORY</p>
          <div className="mt-8 flex gap-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LOADING OVERLAY - 画像生成中 */}
      {(isGeneratingImage || isEditingImage) && (
        <div className="fixed inset-0 z-[200] bg-[#0f0f12]/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="w-24 h-24 rounded-full border-4 border-pink-900/30 flex items-center justify-center">
              {/* Spinning ring */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
              {/* Pulsing inner circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center animate-pulse">
                <span className="text-3xl">🎨</span>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-100 mb-3 tracking-wider">
            {isEditingImage ? '画像を編集中...' : '画像を生成中...'}
          </h3>
          <p className="text-gray-400 text-sm font-serif tracking-widest animate-pulse">
            {isEditingImage ? 'EDITING IMAGE' : 'GENERATING IMAGE'}
          </p>
          <div className="mt-8 flex gap-1.5">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LOADING OVERLAY - シーン抽出中 */}
      {isExtractingScenes && (
        <div className="fixed inset-0 z-[200] bg-[#0f0f12]/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="w-24 h-24 rounded-full border-4 border-purple-900/30 flex items-center justify-center">
              {/* Spinning ring */}
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              {/* Pulsing inner circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center animate-pulse">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-100 mb-3 tracking-wider">シーンを分析中...</h3>
          <p className="text-gray-400 text-sm font-serif tracking-widest animate-pulse">EXTRACTING SCENES</p>
          <div className="mt-8 flex gap-1.5">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* SCENE SELECTION MODAL */}
      {isSelectingScene && sceneCandidates && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onCancelSceneSelection}
          />

          <div className="relative bg-[#1a1a1d] w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 flex justify-between items-center border-b border-purple-500/30">
              <div>
                <h3 className="font-serif font-bold text-lg flex items-center gap-2 tracking-widest">
                  <span>🎨</span> シーンを選択
                </h3>
                <p className="text-purple-200/70 text-xs mt-1">画像生成するシーンを選んでください</p>
              </div>
              <button
                onClick={onCancelSceneSelection}
                className="text-white/50 hover:text-white transition-colors p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto bg-gradient-to-b from-[#1a1a1d] to-[#151518]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sceneCandidates.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => onSelectScene(scene)}
                    className="text-left p-4 rounded-xl bg-[#222228] text-gray-200 border border-white/5 shadow-sm hover:shadow-lg hover:border-purple-500/50 hover:bg-[#2a2a32] active:scale-[0.99] transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3 relative z-10">
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/30 text-xs font-serif text-purple-300 group-hover:bg-purple-800 group-hover:text-white transition-colors mt-0.5">
                        {scene.id}
                      </span>
                      <div className="flex-1">
                        <span className="font-serif text-sm leading-snug block">{scene.description}</span>
                        {scene.isNsfw && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-red-900/50 border border-red-500/30 text-red-300 text-[10px] font-bold rounded tracking-wider">
                            🔞 NSFW
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-[#151518]">
              <button
                onClick={onCancelSceneSelection}
                className="w-full py-3 text-gray-400 hover:text-white font-serif text-sm tracking-wider transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Side: Visuals & Stats (Mobile: Top) */}
      <div className="lg:w-[400px] flex-shrink-0 flex flex-col gap-4 order-1 lg:order-none mb-6 lg:mb-0 lg:sticky lg:top-24 h-fit z-10">

        {/* Image Display Area - Collapsible or smaller on mobile */}
        <div className="relative w-full aspect-[16/9] lg:aspect-[3/4] bg-[#0f0f12] rounded-lg lg:rounded-xl overflow-hidden shadow-2xl border border-white/5 group">
          {generatedImageUrl ? (
            <img
              src={generatedImageUrl}
              alt="Generated Scene"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
              <span className="text-3xl mb-3 opacity-30">❖</span>
              <p className="font-serif text-sm tracking-widest opacity-60">SCENE VISUALIZATION</p>
            </div>
          )}

          {/* Controls Overlay - More subtle */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {generatedImageUrl && (
              <button
                onClick={() => setShowEditInput(!showEditInput)}
                disabled={isEditingImage || isGeneratingImage}
                className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded text-[10px] font-bold tracking-wider hover:bg-black/90 border border-white/10"
              >
                EDIT
              </button>
            )}

            <button
              onClick={onGenerateImage}
              disabled={isGeneratingImage || isEditingImage || isLoading}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider shadow-lg transition-all border
                ${(isGeneratingImage || isEditingImage)
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-indigo-900/90 text-indigo-100 border-indigo-500/30 hover:bg-indigo-800'}
              `}
            >
              {(isGeneratingImage || isEditingImage) ? 'PROCESSING...' : (generatedImageUrl ? 'REGENERATE' : 'GENERATE IMAGE')}
            </button>
          </div>
        </div>

        {/* Image Edit Input */}
        {showEditInput && generatedImageUrl && (
          <form onSubmit={handleEditImageSubmit} className="bg-[#1a1a1a] p-3 rounded-lg border border-white/10 animate-fade-in shadow-xl">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-serif mb-2"
              placeholder="情景を具体的に指示..."
              autoFocus
            />
            <button
              type="submit"
              disabled={!editPrompt.trim()}
              className="w-full bg-indigo-900 text-indigo-100 py-1.5 rounded text-xs font-bold tracking-widest hover:bg-indigo-800"
            >
              UPDATE VISUAL
            </button>
          </form>
        )}

        {/* Character Info Card (Compact) */}
        <div className="bg-[#151518] rounded-lg p-4 border border-white/5 shadow-lg hidden lg:block">
          <div className="flex justify-between items-baseline mb-2 border-b border-white/5 pb-2">
            <h2 className="text-xl font-serif font-bold text-gray-200">{character.name}</h2>
            <span className="text-xs text-indigo-400 font-serif">{character.role}</span>
          </div>
          <div className="text-xs text-gray-400 font-serif space-y-1">
            <div className="flex justify-between"><span>関係</span><span>{character.relationship}</span></div>
            <div className="flex justify-between"><span>香り</span><span className="text-gray-300">{character.scent}</span></div>
            <div className="flex justify-between"><span>現在地</span><span className="text-indigo-300">{segment.location || "不明"}</span></div>
            {(segment.date || segment.time) && (
              <div className="flex justify-between">
                <span>日時</span>
                <span className="text-indigo-300">
                  {segment.date} {segment.time}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Text & Interaction (The Book) */}
      <div className="flex-1 flex flex-col h-full order-2 lg:order-none relative isolate">

        {/* Book Container */}
        <div className="bg-[#fcfaf2] text-[#2d2d2d] rounded-none md:rounded-r-xl lg:rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border-l-0 lg:border-l-[12px] border-[#2c2c2c] lg:border-[#3a2a2a] relative min-h-[60vh] lg:min-h-[80vh]">

          {/* Paper Texture Overlay (Subtle noise) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

          {/* Header (Chapter Info) */}
          <div className="h-16 border-b border-[#e5e2d0] flex items-center justify-between px-6 bg-[#f7f5ed] relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3">
              <span className="font-serif font-bold text-xl text-[#1a1a1a] tracking-widest">第{segment.chapter}章</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 border border-gray-300 px-1.5 py-px rounded">Part {segment.part}</span>
                <div className="flex items-center gap-2 text-[10px] font-serif text-indigo-900 opacity-80">
                  {segment.location && (
                    <span className="flex items-center gap-1">
                      <span className="text-indigo-600">📍</span> {segment.location}
                    </span>
                  )}
                  {(segment.date || segment.time) && (
                    <span className="flex items-center gap-1 border-l border-gray-300 pl-2">
                      <span className="text-indigo-600">🕒</span> {segment.date} {segment.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onRegenerate}
                disabled={isLoading || history.length < 2}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200/50 transition-colors disabled:opacity-30"
                title="再生成"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200/50 transition-colors"
                title="履歴"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </button>
            </div>
          </div>

          {/* Content Scroll Area */}
          {/* Added ample bottom padding (pb-32) to ensure text isn't hidden behind the sticky footer */}
          <div ref={textRef} className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 relative scroll-smooth pb-40">

            {/* INITIAL LOADING */}
            {isInitialLoad ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[40vh] space-y-6 opacity-60">
                <div className="w-px h-20 bg-gradient-to-b from-transparent via-gray-400 to-transparent animate-pulse"></div>
                <p className="text-gray-500 font-serif text-sm tracking-[0.2em] animate-pulse">WRITING STORY...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {/* Story Text */}
                <div key={`${segment.chapter}-${segment.part}`} className="drop-shadow-sm">
                  {renderFormattedText(segment.text, true)}
                </div>

                {/* End of Section Marker */}
                {!isLoading && (
                  <div className="flex justify-center my-10 opacity-30">
                    <span className="text-xl font-serif">❦</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OVERLAY LOADING (For subsequent parts) */}
          {isLoading && !isInitialLoad && (
            <div className="absolute inset-0 bg-[#fcfaf2]/60 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-500">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-2 border-indigo-100 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-2 border-indigo-900/20 border-t-indigo-800 rounded-full animate-spin"></div>
                  <span className="font-serif text-lg">✒︎</span>
                </div>
                <p className="text-xs font-serif text-gray-500 tracking-widest uppercase">Writing Next Scene...</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* STICKY FOOTER ACTION BUTTON (Mobile & Desktop) */}
      {!isLoading && !isInitialLoad && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pointer-events-none flex justify-center bg-gradient-to-t from-[#0f0f12] via-[#0f0f12]/95 to-transparent pb-6 pt-12">
          <div className="w-full max-w-2xl flex flex-col gap-3 pointer-events-auto items-center">

            {/* Main Action Button */}
            <button
              onClick={() => setIsChoiceModalOpen(true)}
              className="w-full md:w-auto md:min-w-[300px] py-4 px-8 bg-gradient-to-r from-indigo-900 to-[#2a1b3d] text-[#fcfaf2] font-serif font-bold text-lg rounded-full shadow-[0_10px_30px_-10px_rgba(49,46,129,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(49,46,129,0.7)] hover:-translate-y-1 transition-all duration-300 border border-indigo-500/30 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-xl group-hover:rotate-12 transition-transform duration-300">✦</span>
              <span className="tracking-widest">次の展開を選ぶ</span>
            </button>

            {/* Undo Link (Subtle) */}
            {history.length >= 3 && (
              <button
                onClick={onUndo}
                className="text-gray-500 text-xs font-serif flex items-center gap-1 hover:text-indigo-400 transition-colors px-4 py-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="tracking-wider">やり直す</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHOICE MODAL - Bottom Sheet Style */}
      {isChoiceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsChoiceModalOpen(false)}
          />

          <div className="relative bg-[#fcfaf5] w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#1a1a1a] text-[#fcfaf2] p-5 flex justify-between items-center border-b border-indigo-900/30">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2 tracking-widest">
                <span>◇</span> 選択肢
              </h3>
              <button
                onClick={() => setIsChoiceModalOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto bg-gradient-to-b from-[#fcfaf5] to-[#f5f2eb]">
              <div className="space-y-3">
                {segment.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectChoice(choice)}
                    className="w-full text-left p-5 rounded-xl bg-white text-[#2d2d2d] border border-[#e5e2d0] shadow-sm hover:shadow-md hover:border-indigo-800/50 hover:bg-indigo-50/30 active:scale-[0.99] transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-xs font-serif text-gray-500 group-hover:border-indigo-800 group-hover:text-indigo-800 transition-colors mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-serif text-lg leading-snug">{choice}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#f5f2eb] text-gray-400 font-serif tracking-widest">OR WRITE YOUR OWN</span>
                </div>
              </div>

              <form onSubmit={handleSubmitCustom}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="自由に入力してください..."
                    className="flex-1 p-4 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-900 font-serif shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!customInput.trim()}
                    className="bg-[#1a1a1a] text-white px-6 rounded-xl font-bold font-serif hover:bg-indigo-900 disabled:opacity-50 transition-colors"
                  >
                    決定
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsHistoryModalOpen(false)}
          />

          <div className="relative bg-[#fcfaf5] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col h-[85vh]">
            <div className="bg-[#3e3a36] text-[#fcfaf5] p-4 flex justify-between items-center shadow-md z-10">
              <h3 className="font-serif font-bold text-lg tracking-widest">
                HISTORY
              </h3>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div ref={historyRef} className="flex-1 overflow-y-auto p-6 md:p-10 font-serif bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#fcfaf5]">
              {history.length === 0 ? (
                <p className="text-center text-gray-400 my-10 text-sm">記録はありません</p>
              ) : (
                <div className="space-y-10">
                  {history.map((item, idx) => (
                    <div key={idx} className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`
                          max-w-[95%] rounded-lg p-0
                          ${item.role === 'user'
                          ? 'bg-transparent text-right'
                          : 'text-left'
                        }
                        `}>
                        {item.role === 'user' ? (
                          <div className="inline-block bg-indigo-50/50 border border-indigo-100 rounded-lg px-4 py-3">
                            <span className="text-[10px] text-indigo-400 font-bold block mb-1 uppercase tracking-wider">Choice</span>
                            <p className="text-gray-700 text-sm">{item.parts[0].text.replace(/^【.*?】:\s*/, '').replace(/^【行動】:\s*/, '')}</p>
                          </div>
                        ) : (
                          <div className="text-ink text-base md:text-lg leading-loose border-l-2 border-gray-200 pl-4">
                            {renderFormattedText(item.parts[0].text, false)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryReader;