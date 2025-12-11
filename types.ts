
export interface Character {
  id: string;
  name: string;
  age: number;
  role: string;
  height: string;
  measurements: string;
  hairStyle: string;
  workplace: string;
  personality: string;
  relationship: string;
  habit: string;
  hometown: string;      // Origin/Hometown
  hobby: string;         // Interests
  favoriteDrink: string; // Alcohol preference
  description: string;
  visualPrompt: string;

  // Personalization Fields
  firstPerson: string;   // 一人称 (e.g., 私, あたし, ウチ)
  callingTakeru: string; // タケルの呼び方 (e.g., タケルさん, 部長, あなた)
  speechTone: string;    // 話し方・口調 (e.g., 敬語, タメ口, 甘え口調)

  // Scenario Hooks (Randomized - 3 patterns)
  scenarioHook: string[];

  // Sensory Fields
  scent: string;         // 香り・匂い
  weakness: string;      // 弱点・性感帯
  feature: string;       // 身体的特徴

  // Sexual Attributes
  orgasmExperience: string; // 絶頂経験 (e.g. あり(膣), なし)
  sensitivity: string;      // 感度 (e.g. 開発済み, クリスに弱い)
  experienceCount: string;  // 経験人数 (e.g. 5人, 処女)
}

export interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
  meta?: {
    chapter: number;
    part: number;
    location: string | null;
    date?: string; // Added date
    time?: string; // Added time
    choices: string[];
    isChapterEnd: boolean;
    imageUrl: string | null;
    summary: string | null; // Stores the summary at this point in time
  };
}

export interface StorySegment {
  chapter: number;
  part: number;
  text: string;
  location: string | null;
  date: string; // Added date
  time: string; // Added time
  choices: string[];
  isChapterEnd: boolean;
  summary: string; // AI generated summary of the story so far + this segment
}

// Scene candidate for image generation selection
export interface SceneCandidate {
  id: number;
  description: string;      // Japanese description for user display
  imagePrompt: string;      // English prompt for image generation
  isNsfw: boolean;          // NSFW flag
}

export interface StoryState {
  currentPhase: 'API_KEY_SETUP' | 'SELECTION' | 'LOADING_STORY' | 'STREAMING' | 'READING' | 'LOADING_IMAGE' | 'EDITING_IMAGE' | 'SELECTING_SCENE' | 'EXTRACTING_SCENES';
  selectedCharacter: Character | null;
  history: HistoryItem[];
  currentSegment: StorySegment | null;
  currentChapter: number;
  currentPart: number;
  currentLocation: string | null;
  currentSummary: string; // The rolling summary of the story
  generatedImageUrl: string | null;
  sceneCandidates: SceneCandidate[] | null; // Scene candidates for image generation
  streamingText: string | null; // Text being streamed in real-time
  error: string | null;
}