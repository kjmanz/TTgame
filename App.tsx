import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CHARACTERS } from './constants';
import { Character, StoryState, StorySegment, HistoryItem, SceneCandidate } from './types';
import CharacterCard from './components/CharacterCard';
import CharacterFilter from './components/CharacterFilter';
import StoryReader from './components/StoryReader';
import ApiKeyScreen, { getStoredApiKey, getStoredImageStyle, getStoredStreamingMode } from './components/ApiKeyScreen';
import ModelSelector from './components/ModelSelector';
import PreferenceSettings from './components/PreferenceSettings';
import { generateStorySegment, generateStorySegmentStreaming, generateSceneImage, editSceneImage, extractImageScenes, generateImageFromScene } from './services/openRouterService';

// Save slot system (3 slots)
const SAVE_SLOT_KEYS = [
  'takeru_tales_slot_1',
  'takeru_tales_slot_2',
  'takeru_tales_slot_3'
];

interface SaveSlotInfo {
  charName: string;
  chapter: number;
  part: number;
  date: string;
}

const loadSlotInfo = (): (SaveSlotInfo | null)[] => {
  return SAVE_SLOT_KEYS.map(key => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: StoryState = JSON.parse(saved);
        if (parsed.selectedCharacter) {
          return {
            charName: parsed.selectedCharacter.name,
            chapter: parsed.currentChapter,
            part: parsed.currentPart,
            date: new Date(parsed.lastSaveDate || Date.now()).toLocaleString()
          };
        }
      }
    } catch (e) {
      console.error(`Failed to load slot ${key}:`, e);
    }
    return null;
  });
};

// Default save key (backward compatibility - uses first slot)
const SAVE_KEY = SAVE_SLOT_KEYS[0];

// Helper functions for slot management
const saveToSlot = (slotIndex: number, state: StoryState): boolean => {
  if (slotIndex < 0 || slotIndex >= 3) return false;
  try {
    const stateWithTimestamp = { ...state, lastSaveDate: Date.now() };
    localStorage.setItem(SAVE_SLOT_KEYS[slotIndex], JSON.stringify(stateWithTimestamp));
    return true;
  } catch (e) {
    console.error(`Failed to save to slot ${slotIndex}:`, e);
    return false;
  }
};

const loadFromSlot = (slotIndex: number): StoryState | null => {
  if (slotIndex < 0 || slotIndex >= 3) return null;
  try {
    const saved = localStorage.getItem(SAVE_SLOT_KEYS[slotIndex]);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Failed to load from slot ${slotIndex}:`, e);
  }
  return null;
};

const deleteSlot = (slotIndex: number): boolean => {
  if (slotIndex < 0 || slotIndex >= 3) return false;
  try {
    localStorage.removeItem(SAVE_SLOT_KEYS[slotIndex]);
    return true;
  } catch (e) {
    console.error(`Failed to delete slot ${slotIndex}:`, e);
    return false;
  }
};

// Factory function to ensure a fresh state object every time
const getInitialState = (hasApiKey: boolean): StoryState => ({
  currentPhase: hasApiKey ? 'SELECTION' : 'API_KEY_SETUP',
  selectedCharacter: null,
  history: [],
  currentSegment: null,
  currentChapter: 1,
  currentPart: 1,
  currentLocation: null,
  currentSummary: "", // Initialize summary
  generatedImageUrl: null,
  sceneCandidates: null,
  streamingText: null,
  error: null
});

function App() {
  const [state, setState] = useState<StoryState>(() => getInitialState(!!getStoredApiKey()));
  // Store the function to retry the last failed action
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  // Model selector modal
  const [showModelSelector, setShowModelSelector] = useState(false);
  // Preference settings modal
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);
  // Save slot modal
  const [showSaveSlotModal, setShowSaveSlotModal] = useState(false);
  const [saveSlotMode, setSaveSlotMode] = useState<'save' | 'load'>('load');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [slotInfos, setSlotInfos] = useState<(SaveSlotInfo | null)[]>(loadSlotInfo());

  // Character filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilters, setAgeFilters] = useState<string[]>([]);
  const [relationshipFilters, setRelationshipFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'age'>('id');

  const [saveDataInfo, setSaveDataInfo] = useState<{
    charName: string;
    chapter: number;
    part: number;
    date: string;
  } | null>(null);

  // Filtered and sorted characters
  const filteredCharacters = useMemo(() => {
    let filtered = [...CHARACTERS];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(query) ||
        char.role.toLowerCase().includes(query) ||
        char.workplace.toLowerCase().includes(query) ||
        char.description.toLowerCase().includes(query)
      );
    }

    // Apply age filter
    if (ageFilters.length > 0) {
      filtered = filtered.filter(char => {
        const age = char.age;
        return ageFilters.some(filter => {
          if (filter === '10s') return age >= 10 && age < 20;
          if (filter === '20s') return age >= 20 && age < 30;
          if (filter === '30s') return age >= 30 && age < 40;
          if (filter === '40s') return age >= 40 && age < 50;
          if (filter === '50s') return age >= 50;
          return false;
        });
      });
    }

    // Apply relationship filter
    if (relationshipFilters.length > 0) {
      filtered = filtered.filter(char => {
        return relationshipFilters.some(filter => {
          const keywords = filter.split(',');
          return keywords.some(keyword =>
            char.relationship.includes(keyword)
          );
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ja');
      } else if (sortBy === 'age') {
        return a.age - b.age;
      } else {
        // ID sorting (default)
        const aNum = parseInt(a.id.split('_')[0], 10);
        const bNum = parseInt(b.id.split('_')[0], 10);
        return aNum - bNum;
      }
    });

    return filtered;
  }, [searchQuery, ageFilters, relationshipFilters, sortBy]);

  // Filter toggle handlers
  const handleAgeFilterToggle = useCallback((ageRange: string) => {
    setAgeFilters(prev =>
      prev.includes(ageRange)
        ? prev.filter(f => f !== ageRange)
        : [...prev, ageRange]
    );
  }, []);

  const handleRelationshipFilterToggle = useCallback((relationship: string) => {
    setRelationshipFilters(prev =>
      prev.includes(relationship)
        ? prev.filter(f => f !== relationship)
        : [...prev, relationship]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setAgeFilters([]);
    setRelationshipFilters([]);
    setSortBy('id');
  }, []);

  // Check for save data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed: StoryState = JSON.parse(saved);
        if (parsed.selectedCharacter) {
          setSaveDataInfo({
            charName: parsed.selectedCharacter.name,
            chapter: parsed.currentChapter,
            part: parsed.currentPart,
            date: new Date().toLocaleString()
          });
        }
      }
    } catch (e) {
      console.error("Failed to load save metadata", e);
    }
  }, []);

  // Auto-save effect: Save whenever we reach a stable 'READING' state
  useEffect(() => {
    if (state.currentPhase === 'READING' && state.selectedCharacter) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        // Update the info state to reflect the new save immediately
        setSaveDataInfo({
          charName: state.selectedCharacter.name,
          chapter: state.currentChapter,
          part: state.currentPart,
          date: new Date().toLocaleString()
        });
      } catch (e) {
        // Silent fail on auto-save is acceptable to avoid interrupting user flow
        console.warn("Auto-save failed (likely storage limit):", e);
      }
    }
  }, [state]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    setRetryAction(null);
  }, []);

  const handleResume = useCallback(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed: StoryState = JSON.parse(saved);
        setState(parsed);
      }
    } catch (e) {
      console.error("Failed to resume game", e);
      setState(prev => ({ ...prev, error: "セーブデータの読み込みに失敗しました。" }));
    }
  }, []);

  // Manual Save and Exit Function
  const handleSaveAndExit = useCallback(() => {
    // If we haven't started a story yet, just reset to selection
    if (!state.selectedCharacter) {
      setState(getInitialState(true));
      return;
    }

    // Prevent saving during unstable states
    if (state.currentPhase === 'LOADING_STORY' || state.currentPhase === 'LOADING_IMAGE' || state.currentPhase === 'EDITING_IMAGE') {
      alert("現在処理中です。完了してから保存してください。");
      return;
    }

    if (confirm("現在の物語を保存して、キャラクター選択画面に戻りますか？")) {
      try {
        // Attempt explicit save
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (storageError) {
          console.warn("Storage full, trying minimal save", storageError);
          // Fallback: Save without heavy history images if quota is exceeded
          const minimalState = {
            ...state,
            history: state.history.map(h => ({ ...h, meta: { ...h.meta, imageUrl: null } })),
            generatedImageUrl: null
          };
          localStorage.setItem(SAVE_KEY, JSON.stringify(minimalState));
          alert("容量不足のため、画像を除いたテキストデータのみ保存しました。");
        }

        // Update the resume info
        setSaveDataInfo({
          charName: state.selectedCharacter.name,
          chapter: state.currentChapter,
          part: state.currentPart,
          date: new Date().toLocaleString()
        });

      } catch (e) {
        console.error("Save completely failed", e);
        // Even if save fails, we want to exit
      } finally {
        // CRITICAL: Always reset state to return to title
        // Use setTimeout to allow render cycle to complete if needed
        setTimeout(() => {
          setState(getInitialState(true));
          setRetryAction(null);
        }, 50);
      }
    }
  }, [state]);

  // Handle API key set
  const handleApiKeySet = useCallback(() => {
    setState(prev => ({ ...prev, currentPhase: 'SELECTION' }));
  }, []);

  // Start the story (Always starts new, overwrites previous save eventually)
  const handleSelectCharacter = useCallback(async (char: Character) => {
    clearError();

    // Check streaming mode preference
    const useStreaming = getStoredStreamingMode();

    // 1. Immediately reset state to avoid stale data
    // 2. Set phase based on streaming mode
    const freshState = getInitialState(true);

    setState({
      ...freshState,
      currentPhase: useStreaming ? 'STREAMING' : 'LOADING_STORY',
      selectedCharacter: char,
      streamingText: useStreaming ? '' : null,
    });

    // 3. Clear the old save data immediately to enforce "only latest is saved"
    try {
      localStorage.removeItem(SAVE_KEY);
      setSaveDataInfo(null);
    } catch (e) {
      console.warn("Could not clear old save", e);
    }

    // 4. Generate Chapter 1, Part 1
    try {
      let result;

      if (useStreaming) {
        // Streaming mode: show text progressively
        result = await generateStorySegmentStreaming(
          char, 1, 1, [], null, "",
          (streamingText) => {
            setState(prev => ({
              ...prev,
              streamingText: streamingText
            }));
          }
        );
      } else {
        // Batch mode: wait for complete generation
        result = await generateStorySegment(char, 1, 1, [], null, "");
      }

      const newSegment: StorySegment = {
        chapter: 1,
        part: 1,
        text: result.text,
        location: result.location,
        date: result.date,
        time: result.time,
        choices: result.choices,
        isChapterEnd: result.isChapterEnd,
        summary: result.summary
      };

      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        currentSegment: newSegment,
        currentLocation: result.location,
        currentSummary: result.summary,
        streamingText: null,
        history: [
          {
            role: 'model',
            parts: [{ text: result.text }],
            meta: {
              chapter: 1,
              part: 1,
              location: result.location,
              date: result.date,
              time: result.time,
              choices: result.choices,
              isChapterEnd: result.isChapterEnd,
              imageUrl: null,
              summary: result.summary,
              scenes: result.scenes
            }
          }
        ]
      }));

      // 一括生成モードの場合のみ上部へスクロール（ストリーミング時はスクロールしない）
      if (!useStreaming) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "物語の開始に失敗しました。";
      setState(prev => ({
        ...prev,
        currentPhase: 'SELECTION',
        streamingText: null,
        error: errorMessage
      }));
      setRetryAction(() => () => handleSelectCharacter(char));
    }
  }, [clearError]);

  // Make a choice and continue story
  const handleChoice = useCallback(async (choice: string) => {
    if (!state.selectedCharacter || !state.currentSegment) return;
    clearError();

    // Check streaming mode preference
    const useStreaming = getStoredStreamingMode();

    // Determine next chapter and part
    let nextChapter = state.currentChapter;
    let nextPart = state.currentPart + 1;

    // If the previous segment was the end of a chapter, move to next chapter, part 1
    if (state.currentSegment.isChapterEnd) {
      nextChapter += 1;
      nextPart = 1;
    }

    if (nextChapter > 5) {
      if (confirm("物語が完結しました。最初の画面に戻りますか？")) {
        setState(getInitialState(true));
        localStorage.removeItem(SAVE_KEY);
        setSaveDataInfo(null);
        return;
      }
      return;
    }

    setState(prev => ({
      ...prev,
      currentPhase: useStreaming ? 'STREAMING' : 'LOADING_STORY',
      streamingText: useStreaming ? '' : null
    }));

    try {
      // Construct history for the model
      const currentHistory: HistoryItem[] = [
        ...state.history,
        { role: 'user', parts: [{ text: `【タケルの選択・発言】: ${choice}` }] }
      ];

      let result;

      if (useStreaming) {
        // Streaming mode: show text progressively
        result = await generateStorySegmentStreaming(
          state.selectedCharacter,
          nextChapter,
          nextPart,
          currentHistory,
          state.currentLocation,
          state.currentSummary,
          (streamingText) => {
            setState(prev => ({
              ...prev,
              streamingText: streamingText
            }));
          },
          choice
        );
      } else {
        // Batch mode: wait for complete generation
        result = await generateStorySegment(
          state.selectedCharacter,
          nextChapter,
          nextPart,
          currentHistory,
          state.currentLocation,
          state.currentSummary,
          choice
        );
      }

      const newSegment: StorySegment = {
        chapter: nextChapter,
        part: nextPart,
        text: result.text,
        location: result.location,
        date: result.date,
        time: result.time,
        choices: result.choices,
        isChapterEnd: result.isChapterEnd,
        summary: result.summary
      };

      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        currentSegment: newSegment,
        currentChapter: nextChapter,
        currentPart: nextPart,
        currentLocation: result.location,
        currentSummary: result.summary,
        streamingText: null,
        generatedImageUrl: newSegment.isChapterEnd ? null : prev.generatedImageUrl,
        history: [
          ...currentHistory,
          {
            role: 'model',
            parts: [{ text: result.text }],
            meta: {
              chapter: nextChapter,
              part: nextPart,
              location: result.location,
              date: result.date,
              time: result.time,
              choices: result.choices,
              isChapterEnd: result.isChapterEnd,
              imageUrl: newSegment.isChapterEnd ? null : prev.generatedImageUrl,
              summary: result.summary,
              scenes: result.scenes
            }
          }
        ]
      }));

      // 一括生成モードの場合のみ上部へスクロール（ストリーミング時はスクロールしない）
      if (!useStreaming) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        streamingText: null,
        error: "続きを生成できませんでした。NGワード等が含まれている可能性があります。"
      }));
      setRetryAction(() => () => handleChoice(choice));
    }
  }, [state, clearError]);

  // Undo last action
  const handleUndo = useCallback(() => {
    clearError();
    setState(prev => {
      // We need at least 3 items to undo: [Intro(Model), User, Response(Model)] -> [Intro(Model)]
      if (prev.history.length < 3) {
        alert("これ以上戻れません。");
        return prev;
      }

      const newHistory = [...prev.history];
      // Remove current Model Response
      newHistory.pop();
      // Remove last User Action
      newHistory.pop();

      // The new current state is the last item in the remaining history (which must be a model response)
      const lastModelItem = newHistory[newHistory.length - 1];

      if (!lastModelItem || lastModelItem.role !== 'model' || !lastModelItem.meta) {
        console.error("Invalid history state for undo");
        return prev;
      }

      const restoredMeta = lastModelItem.meta;

      return {
        ...prev,
        history: newHistory,
        currentChapter: restoredMeta.chapter,
        currentPart: restoredMeta.part,
        currentLocation: restoredMeta.location || prev.currentLocation,
        currentSummary: restoredMeta.summary || prev.currentSummary, // Restore summary
        generatedImageUrl: restoredMeta.imageUrl || null,
        currentSegment: {
          chapter: restoredMeta.chapter,
          part: restoredMeta.part,
          text: lastModelItem.parts[0].text,
          location: restoredMeta.location || "不明",
          date: restoredMeta.date || "", // Restore date
          time: restoredMeta.time || "", // Restore time
          choices: restoredMeta.choices,
          isChapterEnd: restoredMeta.isChapterEnd,
          summary: restoredMeta.summary || "",
          scenes: restoredMeta.scenes // Restore scenes
        },
        currentPhase: 'READING',
        error: null
      };
    });
  }, [clearError]);

  // Regenerate last response (Retry the same turn)
  const handleRegenerate = useCallback(async () => {
    if (!state.selectedCharacter || !state.currentSegment) return;
    clearError();

    // Need at least 2 items to regenerate: [User, Model(current)]
    if (state.history.length < 2) {
      // Cannot regenerate the very first intro segment easily without reset
      alert("最初のパートは再生成できません。トップに戻ってやり直してください。");
      return;
    }

    setState(prev => ({ ...prev, currentPhase: 'LOADING_STORY' }));

    try {
      const newHistory = [...state.history];
      // Remove current Model response
      newHistory.pop();

      // Get the last user action
      const lastUserItem = newHistory[newHistory.length - 1];
      let lastAction = "";
      if (lastUserItem && lastUserItem.role === 'user') {
        lastAction = lastUserItem.parts[0].text.replace(/^【.*?】:\s*/, '');
      }

      // Current chapter/part logic
      const chapter = state.currentChapter;
      const part = state.currentPart;

      // We need the summary from BEFORE the current turn
      let previousSummary = "";
      let contextLocation = state.currentLocation;

      if (newHistory.length >= 2) {
        const prevModelItem = newHistory[newHistory.length - 2];
        if (prevModelItem && prevModelItem.meta) {
          if (prevModelItem.meta.location) contextLocation = prevModelItem.meta.location;
          if (prevModelItem.meta.summary) previousSummary = prevModelItem.meta.summary;
        }
      }

      const result = await generateStorySegment(
        state.selectedCharacter,
        chapter,
        part,
        newHistory,
        contextLocation,
        previousSummary, // Pass PREVIOUS summary for regeneration
        lastAction
      );

      const newSegment: StorySegment = {
        chapter: chapter,
        part: part,
        text: result.text,
        location: result.location,
        date: result.date, // New
        time: result.time, // New
        choices: result.choices,
        isChapterEnd: result.isChapterEnd,
        summary: result.summary
      };

      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        currentSegment: newSegment,
        currentLocation: result.location,
        currentSummary: result.summary, // Update to new result summary
        history: [
          ...newHistory,
          {
            role: 'model',
            parts: [{ text: result.text }],
            meta: {
              chapter: chapter,
              part: part,
              location: result.location,
              date: result.date, // New
              time: result.time, // New
              choices: result.choices,
              isChapterEnd: result.isChapterEnd,
              imageUrl: prev.generatedImageUrl, // Keep image
              summary: result.summary,
              scenes: result.scenes
            }
          }
        ]
      }));

      // 生成完了後、画面上部へスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        error: "再生成に失敗しました。NGワード等が含まれている可能性があります。"
      }));
      // Capture retry action
      setRetryAction(() => () => handleRegenerate());
    }
  }, [state, clearError]);

  // Generate Image - Now extracts scenes first for selection
  const handleGenerateImage = useCallback(async () => {
    if (!state.selectedCharacter || !state.currentSegment) return;
    clearError();

    setState(prev => ({ ...prev, currentPhase: 'EXTRACTING_SCENES', sceneCandidates: null }));

    // OPTIMIZATION: If scenes are already generated with the story, use them immediately!
    if (state.currentSegment.scenes && state.currentSegment.scenes.length > 0) {
      setState(prev => ({
        ...prev,
        currentPhase: 'SELECTING_SCENE',
        sceneCandidates: state.currentSegment!.scenes! // Use the pre-calculated scenes
      }));
      return;
    }

    try {
      const imageStyle = getStoredImageStyle() as 'photorealistic' | 'realistic_anime' | 'illustration_anime';
      const scenes = await extractImageScenes(
        state.selectedCharacter,
        state.currentSegment.text,
        imageStyle
      );

      setState(prev => ({
        ...prev,
        currentPhase: 'SELECTING_SCENE',
        sceneCandidates: scenes
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        sceneCandidates: null,
        error: "シーンの抽出に失敗しました。"
      }));
      setRetryAction(() => () => handleGenerateImage());
    }
  }, [state, clearError]);

  // Select a scene and generate image
  const handleSelectScene = useCallback(async (scene: SceneCandidate) => {
    clearError();
    // Preserve current sceneCandidates before clearing
    const currentSceneCandidates = state.sceneCandidates;
    setState(prev => ({ ...prev, currentPhase: 'LOADING_IMAGE', sceneCandidates: null }));

    try {
      const imageUrl = await generateImageFromScene(scene);

      setState(prev => {
        // Update the metadata of the last history item to include the new image url
        const newHistory = [...prev.history];
        const lastItem = newHistory[newHistory.length - 1];
        if (lastItem && lastItem.role === 'model' && lastItem.meta) {
          lastItem.meta.imageUrl = imageUrl;
        }

        return {
          ...prev,
          currentPhase: 'READING',
          generatedImageUrl: imageUrl,
          history: newHistory
        };
      });
    } catch (err) {
      console.error(err);
      // Restore sceneCandidates on failure so user can try again
      setState(prev => ({
        ...prev,
        currentPhase: 'SELECTING_SCENE',
        sceneCandidates: currentSceneCandidates,
        error: "画像の生成に失敗しました。別のシーンを選ぶか、再試行してください。"
      }));
      setRetryAction(() => () => handleSelectScene(scene));
    }
  }, [state.sceneCandidates, clearError]);

  // Cancel scene selection
  const handleCancelSceneSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPhase: 'READING',
      sceneCandidates: null
    }));
  }, []);

  // Regenerate scenes from current story
  const handleRegenerateScenes = useCallback(async () => {
    if (!state.selectedCharacter || !state.currentSegment) return;
    clearError();

    setState(prev => ({ ...prev, currentPhase: 'EXTRACTING_SCENES' }));

    try {
      const imageStyle = getStoredImageStyle() as 'photorealistic' | 'realistic_anime' | 'illustration_anime';
      const scenes = await extractImageScenes(
        state.selectedCharacter,
        state.currentSegment.text,
        imageStyle
      );

      setState(prev => ({
        ...prev,
        currentPhase: 'SELECTING_SCENE',
        sceneCandidates: scenes
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        error: "シーンの再生成に失敗しました。"
      }));
      setRetryAction(() => () => handleRegenerateScenes());
    }
  }, [state, clearError]);

  // Edit Image
  const handleEditImage = useCallback(async (prompt: string) => {
    if (!state.generatedImageUrl) return;
    clearError();

    setState(prev => ({ ...prev, currentPhase: 'EDITING_IMAGE' }));

    try {
      const newImageUrl = await editSceneImage(
        state.generatedImageUrl,
        prompt
      );

      setState(prev => {
        // Update the metadata of the last history item
        const newHistory = [...prev.history];
        const lastItem = newHistory[newHistory.length - 1];
        if (lastItem && lastItem.role === 'model' && lastItem.meta) {
          lastItem.meta.imageUrl = newImageUrl;
        }

        return {
          ...prev,
          currentPhase: 'READING',
          generatedImageUrl: newImageUrl,
          history: newHistory
        };
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        currentPhase: 'READING',
        error: "画像の編集に失敗しました。"
      }));
      setRetryAction(() => () => handleEditImage(prompt));
    }
  }, [state, clearError]);

  return (
    <div className="min-h-screen bg-[#0f0f12] text-gray-100 font-serif selection:bg-indigo-900 selection:text-white pb-10">

      {/* Navbar / Header */}
      <header className="w-full p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-[#0f0f12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">
            🌙
          </div>
          <h1 className="text-lg md:text-xl font-serif font-bold tracking-[0.2em] text-gray-200">
            TAKERU'S TALES
          </h1>
        </div>

        {/* Navigation Buttons */}
        {state.currentPhase !== 'SELECTION' && (
          <div className="flex gap-2">
            <button
              onClick={handleSaveAndExit}
              disabled={state.currentPhase === 'LOADING_STORY' || state.currentPhase === 'LOADING_IMAGE'}
              className="text-[10px] md:text-xs bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 px-4 py-2 rounded transition-all flex items-center gap-2 tracking-widest uppercase disabled:opacity-50"
            >
              SAVE & EXIT
            </button>
          </div>
        )}
      </header>

      <main className="container mx-auto mt-6 md:mt-10 px-4">
        {state.error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-lg mb-6 text-center animate-bounce z-50 relative text-sm font-serif shadow-lg">
            <p className="mb-2">⚠️ {state.error}</p>
            {retryAction && (
              <button
                onClick={retryAction}
                className="mt-2 bg-red-800 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-bold tracking-widest uppercase transition-colors shadow-md"
              >
                再生成する (Retry)
              </button>
            )}
          </div>
        )}

        {state.currentPhase === 'API_KEY_SETUP' && (
          <ApiKeyScreen onApiKeySet={handleApiKeySet} />
        )}

        {state.currentPhase === 'SELECTION' && (
          <div className="flex flex-col items-center">

            {/* Settings Buttons - Made Sticky */}
            <div className="sticky top-[72px] z-40 w-full max-w-6xl flex justify-end gap-2 mb-4 bg-[#0f0f12]/95 backdrop-blur-md py-3 px-4 rounded-lg">
              <button
                onClick={() => setShowPreferenceSettings(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/10 px-4 py-2 rounded-lg transition-all text-sm"
              >
                🎭 嗜好設定
              </button>
              <button
                onClick={() => setShowModelSelector(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/10 px-4 py-2 rounded-lg transition-all text-sm"
              >
                ⚙️ モデル設定
              </button>
            </div>

            {/* Resume Button */}
            {saveDataInfo && (
              <div className="w-full max-w-2xl mb-12 animate-fade-in">
                <div
                  onClick={handleResume}
                  className="bg-gradient-to-r from-[#1a1a1d] to-[#151518] border border-indigo-900/30 p-6 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-all group flex items-center justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-200 mb-2 flex items-center gap-2 tracking-wider">
                      CONTINUE STORY
                    </h3>
                    <p className="text-gray-500 text-sm font-serif">
                      <span className="text-indigo-400">{saveDataInfo.charName}</span> <span className="mx-2">|</span> 第{saveDataInfo.chapter}章 Part{saveDataInfo.part}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-10 md:mb-16 max-w-2xl px-2">
              <p className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-70">Interactive Novel</p>
              <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6 text-gray-100 leading-tight">
                運命の相手を、<br />選び取れ。
              </h2>
              <p className="text-gray-500 leading-loose text-sm md:text-base font-serif">
                平凡な日常に潜む、ひとときの非日常。<br />
                今宵、あなたが紡ぐ物語は——。
              </p>
            </div>

            {/* Character Filter */}
            <CharacterFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              ageFilters={ageFilters}
              onAgeFilterToggle={handleAgeFilterToggle}
              relationshipFilters={relationshipFilters}
              onRelationshipFilterToggle={handleRelationshipFilterToggle}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              resultCount={filteredCharacters.length}
              totalCount={CHARACTERS.length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl pb-32">
              {filteredCharacters.map(char => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onSelect={handleSelectCharacter}
                />
              ))}
            </div>
          </div>
        )}

        {(state.currentPhase === 'READING' || state.currentPhase === 'LOADING_STORY' || state.currentPhase === 'STREAMING' || state.currentPhase === 'LOADING_IMAGE' || state.currentPhase === 'EDITING_IMAGE' || state.currentPhase === 'EXTRACTING_SCENES' || state.currentPhase === 'SELECTING_SCENE') && state.selectedCharacter && (
          <StoryReader
            character={state.selectedCharacter}
            segment={state.currentSegment || { chapter: 1, part: 1, text: '', location: '', date: '', time: '', choices: [], isChapterEnd: false, summary: '' }}
            history={state.history}
            onChoice={handleChoice}
            onUndo={handleUndo}
            onRegenerate={handleRegenerate}
            isLoading={state.currentPhase === 'LOADING_STORY'}
            isStreaming={state.currentPhase === 'STREAMING'}
            streamingText={state.streamingText}
            isGeneratingImage={state.currentPhase === 'LOADING_IMAGE'}
            isEditingImage={state.currentPhase === 'EDITING_IMAGE'}
            isExtractingScenes={state.currentPhase === 'EXTRACTING_SCENES'}
            isSelectingScene={state.currentPhase === 'SELECTING_SCENE'}
            sceneCandidates={state.sceneCandidates}
            onSelectScene={handleSelectScene}
            onCancelSceneSelection={handleCancelSceneSelection}
            onRegenerateScenes={handleRegenerateScenes}
            generatedImageUrl={state.generatedImageUrl}
            onGenerateImage={handleGenerateImage}
            onEditImage={handleEditImage}
          />
        )}
      </main>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <ModelSelector onClose={() => setShowModelSelector(false)} />
      )}

      {/* Preference Settings Modal */}
      {showPreferenceSettings && (
        <PreferenceSettings onClose={() => setShowPreferenceSettings(false)} />
      )}
    </div>
  );
}

export default App;