
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
    scenes?: SceneCandidate[]; // Pre-calculated scene candidates
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
  scenes?: SceneCandidate[]; // Pre-calculated scene candidates
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

// ===========================================
// プレイ嗜好設定 (Play Preferences)
// ===========================================

// A. メインシチュエーション（排他選択：1つ）
export type MainSituation =
  | 'pure_love'       // 純愛
  | 'affair'          // 不倫
  | 'ntr_take'        // 寝取り（奪う）
  | 'ntr_taken'       // 寝取られ（奪われる）
  | 'sm_dom'          // SM（S側）
  | 'sm_sub'          // SM（M側）
  | 'oneshota'        // おねショタ風
  | 'reverse_rape'    // 逆レイプ
  | 'molester'        // 痴漢
  | 'exhibitionism';  // 露出

// B. 関係性ダイナミクス（複数選択可）
export type RelationshipDynamic =
  | 'boss_subordinate'  // 上司と部下
  | 'age_gap_older'     // 年下×年上
  | 'first_meeting'     // 初対面
  | 'ex_partner'        // 元カレ元カノ
  | 'childhood_friend'  // 幼馴染
  | 'teacher_student';  // 師弟関係

// C. プレイ内容の好み
export type ForeplayPreference =
  | 'kissing'           // キス重視
  | 'breast_play'       // 胸責め
  | 'cunnilingus'       // クンニ
  | 'fellatio'          // フェラ
  | 'fingering'         // 手マン
  | 'teasing'           // 焦らし
  | 'dirty_talk';       // 言葉責め

export type PositionPreference =
  | 'missionary'        // 正常位
  | 'doggy'             // 後背位
  | 'cowgirl'           // 騎乗位
  | 'standing'          // 立位
  | 'sitting';          // 座位

export type FinishPreference =
  | 'creampie'          // 中出し
  | 'facial'            // 顔射
  | 'oral_finish'       // 口内射精
  | 'pull_out';         // 外出し

// D. 女性キャラの反応タイプ（1つ選ぶ）
export type FemaleReactionType =
  | 'shy'               // 恥じらい型
  | 'honest'            // 素直型
  | 'tsundere'          // ツンデレ型
  | 'lewd'              // 淫乱型
  | 'silent'            // 無口型
  | 'begging'           // おねだり型
  | 'dominant';         // ドS型

// F. フェチ強調設定（複数選択可）
export type FetishEmphasis =
  | 'feet'              // 足フェチ
  | 'breasts'           // 胸フェチ
  | 'butt'              // 尻フェチ
  | 'smell'             // 匂いフェチ
  | 'voice'             // 声フェチ
  | 'sweat'             // 汗フェチ
  | 'uniform'           // 制服フェチ
  | 'underwear'         // 下着フェチ
  | 'saliva'            // 唾液フェチ
  | 'hair';             // 毛フェチ

// 比較対象タイプ（行為中に名前を出す）
export type ComparisonTarget =
  | 'ex_boyfriend'      // 元彼
  | 'current_boyfriend' // 今彼
  | 'husband';          // 旦那

// メイン設定インターフェース
export interface PlayPreferences {
  // A. メインシチュエーション（排他選択：1つ）
  mainSituation: MainSituation;

  // B. 関係性ダイナミクス（複数選択可）
  relationshipDynamics: RelationshipDynamic[];

  // C. プレイ内容の好み
  foreplayPreferences: ForeplayPreference[];
  positionPreferences: PositionPreference[];
  finishPreferences: FinishPreference[];

  // D. 女性キャラの反応タイプ（1つ選ぶ）
  femaleReactionType: FemaleReactionType;

  // F. フェチ強調設定（複数選択可）
  fetishEmphasis: FetishEmphasis[];

  // 比較セリフシステム
  comparisonEnabled: boolean;          // 比較セリフを有効化
  comparisonTarget: ComparisonTarget;  // 比較対象
}

// デフォルト設定
export const DEFAULT_PREFERENCES: PlayPreferences = {
  mainSituation: 'pure_love',
  relationshipDynamics: [],
  foreplayPreferences: ['kissing', 'breast_play'],
  positionPreferences: ['missionary', 'doggy'],
  finishPreferences: ['creampie'],
  femaleReactionType: 'honest',
  fetishEmphasis: [],
  comparisonEnabled: false,
  comparisonTarget: 'ex_boyfriend'
};