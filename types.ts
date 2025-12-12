
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

  // === NEW: 拡張キャラクター設定 ===
  // 心理・性癖設定
  secretFetish?: string;      // 秘密の性癖 (e.g. 「実はMだけど隠してる」)
  pastTrauma?: string;        // 過去のトラウマ (e.g. 「元彼に酷いことされた」)
  forbiddenDesire?: string;   // 禁断の願望 (e.g. 「一度でいいから痴漢されたい」)

  // 声・音声設定
  voiceType?: string;         // 声のタイプ (e.g. 「低くハスキー」「幼い高め」「色っぽいお姉さん声」)

  // 詳細な体の特徴
  nippleType?: string;        // 乳首タイプ (e.g. 「ピンクで小さめ」「大きく浮き出やすい」)
  pubicHair?: string;         // 陰毛 (e.g. 「薄め」「処理している」「自然」)
  vaginalTightness?: string;  // 膣の締まり (e.g. 「キツキツ」「柔らかく包み込む」)
  clitorisSize?: string;      // クリトリス (e.g. 「敏感で大きめ」「皮被り」)
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

// A. メインシチュエーション（排他選択：1つ）- 25種類
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
  | 'exhibitionism'   // 露出
  // 追加15種類
  | 'prostitution'    // 援助交際/パパ活
  | 'teacher_student' // 教師と生徒
  | 'hypnosis'        // 催眠/洗脳
  | 'blackmail'       // 脅迫/弱み
  | 'drunk'           // 泥酔/酩酊
  | 'sleeping'        // 夜這い/睡眠姦
  | 'virginity'       // 処女喪失
  | 'reunion'         // 再会セックス
  | 'revenge'         // 復讐/報復
  | 'voyeur'          // 覗き/盗撮
  | 'office_affair'   // オフィスラブ
  | 'masquerade'      // 仮面/匿名
  | 'forbidden_love'  // 禁忌/タブー
  | 'service'         // ご奉仕/メイド
  | 'swap';           // スワッピング/乱交

// B. 関係性ダイナミクス（複数選択可）- 18種類
export type RelationshipDynamic =
  | 'boss_subordinate'  // 上司と部下
  | 'age_gap_older'     // 年下×年上
  | 'first_meeting'     // 初対面
  | 'ex_partner'        // 元カレ元カノ
  | 'childhood_friend'  // 幼馴染
  | 'mentor_student'    // 師弟関係
  // 追加12種類
  | 'married_woman'     // 人妻×独身男性
  | 'widow'             // 未亡人
  | 'celebrity'         // 芸能人/アイドル
  | 'customer_service'  // 客と店員
  | 'patient_nurse'     // 患者と看護師
  | 'landlord_tenant'   // 大家と店子
  | 'stepfamily'        // 義理の家族
  | 'rivals'            // ライバル/敵同士
  | 'online_meetup'     // ネット知り合い
  | 'one_night'         // 一夜限りの関係
  | 'secret_lovers'     // 秘密の恋人
  | 'sugar_daddy';      // パトロン関係

// C. プレイ内容の好み - 前戯17種類
export type ForeplayPreference =
  | 'kissing'           // キス重視
  | 'breast_play'       // 胸責め
  | 'cunnilingus'       // クンニ
  | 'fellatio'          // フェラ
  | 'fingering'         // 手マン
  | 'teasing'           // 焦らし
  | 'dirty_talk'        // 言葉責め
  // 追加10種類
  | 'rimming'           // アナル舐め
  | 'footjob'           // 足コキ
  | 'paizuri'           // パイズリ
  | 'sixty_nine'        // シックスナイン
  | 'nipple_play'       // 乳首責め集中
  | 'spanking'          // お尻叩き
  | 'blindfold'         // 目隠しプレイ
  | 'ice_play'          // アイスキューブ/温冷
  | 'oil_massage'       // オイルマッサージ
  | 'vibrator';         // バイブ/おもちゃ

// 体位13種類
export type PositionPreference =
  | 'missionary'        // 正常位
  | 'doggy'             // 後背位
  | 'cowgirl'           // 騎乗位
  | 'standing'          // 立位
  | 'sitting'           // 座位
  // 追加8種類
  | 'side'              // 側位/横入れ
  | 'piledriver'        // 屈曲位/駅弁
  | 'prone_bone'        // 寝バック
  | 'face_sitting'      // 顔面騎乗
  | 'sixty_nine_pos'    // 69体位
  | 'wall_pin'          // 壁ドン挿入
  | 'desk_sex'          // 机上位
  | 'bathtub';          // 風呂場プレイ

// フィニッシュ9種類
export type FinishPreference =
  | 'creampie'          // 中出し
  | 'facial'            // 顔射
  | 'oral_finish'       // 口内射精
  | 'pull_out'          // 外出し
  // 追加5種類
  | 'multiple_creampie' // 連続中出し
  | 'body_cumshot'      // 全身射精
  | 'cum_swallow'       // ごっくん
  | 'ruined_orgasm'     // 寸止め射精
  | 'breeding';         // 種付けプレス

// D. 女性キャラの反応タイプ（1つ選ぶ）- 17種類
export type FemaleReactionType =
  | 'shy'               // 恥じらい型
  | 'honest'            // 素直型
  | 'tsundere'          // ツンデレ型
  | 'lewd'              // 淫乱型
  | 'silent'            // 無口型
  | 'begging'           // おねだり型
  | 'dominant'          // ドS型
  // 追加10種類
  | 'resistance'        // 抵抗型
  | 'corrupted'         // 堕ち型
  | 'yandere'           // ヤンデレ型
  | 'masochist'         // ドM型
  | 'kuudere'           // クーデレ型
  | 'gyaru'             // ギャル型
  | 'ojousama'          // お嬢様型
  | 'innocent'          // 天然型
  | 'experienced'       // 熟練型
  | 'verbal';           // 実況型

// F. フェチ強調設定（複数選択可）- 25種類
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
  | 'hair'              // 毛フェチ
  // 追加15種類
  | 'nape'              // うなじ
  | 'armpit'            // 腋
  | 'tongue'            // 舌
  | 'eyes'              // 瞳/目線
  | 'lips'              // 唇
  | 'navel'             // へそ
  | 'thighs'            // 太もも
  | 'back'              // 背中
  | 'hands'             // 手/指
  | 'neck'              // 首
  | 'belly'             // お腹
  | 'tan_lines'         // 日焼け跡
  | 'glasses'           // 眼鏡
  | 'crying'            // 涙
  | 'ahegao';           // アヘ顔

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