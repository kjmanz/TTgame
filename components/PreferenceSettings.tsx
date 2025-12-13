import React, { useState } from 'react';
import {
    PlayPreferences,
    MainSituation,
    RelationshipDynamic,
    ForeplayPreference,
    PositionPreference,
    FinishPreference,
    FemaleReactionType,
    FetishEmphasis,
    ComparisonTarget,
    DEFAULT_PREFERENCES
} from '../types';
import { getStoredPreferences, setStoredPreferences } from './ApiKeyScreen';

interface PreferenceSettingsProps {
    onClose: () => void;
}

// 選択肢のラベル定義
const MAIN_SITUATIONS: { id: MainSituation; label: string; desc: string }[] = [
    { id: 'pure_love', label: '純愛', desc: 'ロマンチックな展開' },
    { id: 'affair', label: '不倫', desc: '禁断の関係、背徳感' },
    { id: 'ntr_take', label: '寝取り(攻)', desc: '他の男から奪う' },
    { id: 'ntr_taken', label: '寝取られ(受)', desc: '女性が他の男に' },
    { id: 'sm_dom', label: 'SM(S)', desc: '支配する側' },
    { id: 'sm_sub', label: 'SM(M)', desc: '服従する側' },
    { id: 'oneshota', label: 'おねショタ風', desc: '年上女性にリード' },
    { id: 'reverse_rape', label: '逆レイプ', desc: '女性から強引に' },
    { id: 'molester', label: '痴漢', desc: '公共の場で秘密に' },
    { id: 'exhibitionism', label: '露出', desc: '見られるスリル' },
    // 追加15種類
    { id: 'prostitution', label: '援交/パパ活', desc: '金銭が絡む関係' },
    { id: 'teacher_student', label: '教師と生徒', desc: '禁断の師弟関係' },
    { id: 'hypnosis', label: '催眠/洗脳', desc: '催眠術で服従' },
    { id: 'blackmail', label: '脅迫/弱み', desc: '秘密を握られて' },
    { id: 'drunk', label: '泥酔/酩酊', desc: '酔った勢いで' },
    { id: 'sleeping', label: '夜這い/睡眠姦', desc: '眠っている間に' },
    { id: 'virginity', label: '処女喪失', desc: '初めてを奪う' },
    { id: 'reunion', label: '再会セックス', desc: '昔の恋人と再会' },
    { id: 'revenge', label: '復讐/報復', desc: '寝取り返し' },
    { id: 'voyeur', label: '覗き/盗撮', desc: '見てはいけない' },
    { id: 'office_affair', label: 'オフィスラブ', desc: '会議室で残業中に' },
    { id: 'masquerade', label: '仮面/匿名', desc: '素性を隠した関係' },
    { id: 'forbidden_love', label: '禁忌/タブー', desc: '義母、義姉など' },
    { id: 'service', label: 'ご奉仕/メイド', desc: '献身的な奉仕' },
    { id: 'swap', label: 'スワッピング', desc: '複数人での行為' },
];

const RELATIONSHIP_DYNAMICS: { id: RelationshipDynamic; label: string }[] = [
    { id: 'boss_subordinate', label: '上司と部下' },
    { id: 'age_gap_older', label: '年下×年上' },
    { id: 'first_meeting', label: '初対面' },
    { id: 'ex_partner', label: '元カレ元カノ' },
    { id: 'childhood_friend', label: '幼馴染' },
    { id: 'mentor_student', label: '師弟関係' },
    // 追加12種類
    { id: 'married_woman', label: '人妻×独身' },
    { id: 'widow', label: '未亡人' },
    { id: 'celebrity', label: '芸能人/アイドル' },
    { id: 'customer_service', label: '客と店員' },
    { id: 'patient_nurse', label: '患者と看護師' },
    { id: 'landlord_tenant', label: '大家と店子' },
    { id: 'stepfamily', label: '義理の家族' },
    { id: 'rivals', label: 'ライバル同士' },
    { id: 'online_meetup', label: 'ネット知り合い' },
    { id: 'one_night', label: '一夜限り' },
    { id: 'secret_lovers', label: '秘密の恋人' },
    { id: 'sugar_daddy', label: 'パトロン関係' },
];

const FOREPLAY_PREFERENCES: { id: ForeplayPreference; label: string }[] = [
    { id: 'kissing', label: 'キス重視' },
    { id: 'breast_play', label: '胸責め' },
    { id: 'cunnilingus', label: 'クンニ' },
    { id: 'fellatio', label: 'フェラ' },
    { id: 'fingering', label: '手マン' },
    { id: 'teasing', label: '焦らし' },
    { id: 'dirty_talk', label: '言葉責め' },
    // 追加10種類
    { id: 'rimming', label: 'アナル舐め' },
    { id: 'footjob', label: '足コキ' },
    { id: 'paizuri', label: 'パイズリ' },
    { id: 'sixty_nine', label: 'シックスナイン' },
    { id: 'nipple_play', label: '乳首責め' },
    { id: 'spanking', label: 'お尻叩き' },
    { id: 'blindfold', label: '目隠しプレイ' },
    { id: 'ice_play', label: '温冷プレイ' },
    { id: 'oil_massage', label: 'オイルマッサージ' },
    { id: 'vibrator', label: 'バイブ/おもちゃ' },
];

const POSITION_PREFERENCES: { id: PositionPreference; label: string }[] = [
    { id: 'missionary', label: '正常位' },
    { id: 'doggy', label: '後背位' },
    { id: 'cowgirl', label: '騎乗位' },
    { id: 'standing', label: '立位' },
    { id: 'sitting', label: '座位' },
    // 追加8種類
    { id: 'side', label: '側位/横入れ' },
    { id: 'piledriver', label: '屈曲位/駅弁' },
    { id: 'prone_bone', label: '寝バック' },
    { id: 'face_sitting', label: '顔面騎乗' },
    { id: 'sixty_nine_pos', label: '69体位' },
    { id: 'wall_pin', label: '壁ドン挿入' },
    { id: 'desk_sex', label: '机上位' },
    { id: 'bathtub', label: '風呂場プレイ' },
];

const FINISH_PREFERENCES: { id: FinishPreference; label: string }[] = [
    { id: 'creampie', label: '中出し' },
    { id: 'facial', label: '顔射' },
    { id: 'oral_finish', label: '口内射精' },
    { id: 'pull_out', label: '外出し' },
    // 追加5種類
    { id: 'multiple_creampie', label: '連続中出し' },
    { id: 'body_cumshot', label: '全身射精' },
    { id: 'cum_swallow', label: 'ごっくん' },
    { id: 'ruined_orgasm', label: '寸止め射精' },
    { id: 'breeding', label: '種付けプレス' },
];

const FEMALE_REACTIONS: { id: FemaleReactionType; label: string; desc: string }[] = [
    { id: 'shy', label: '恥じらい型', desc: '「ダメ…見ないで…」' },
    { id: 'honest', label: '素直型', desc: '「気持ちいい…もっと」' },
    { id: 'tsundere', label: 'ツンデレ型', desc: '「別に感じてないし…」' },
    { id: 'lewd', label: '淫乱型', desc: '「もっと激しく！」' },
    { id: 'silent', label: '無口型', desc: '体の反応で表現' },
    { id: 'begging', label: 'おねだり型', desc: '「お願い…入れて」' },
    { id: 'dominant', label: 'ドS型', desc: '「まだイっちゃダメ」' },
    // 追加10種類
    { id: 'resistance', label: '抵抗型', desc: '「やめて…嫌…」' },
    { id: 'corrupted', label: '堕ち型', desc: '「もう戻れない…」' },
    { id: 'yandere', label: 'ヤンデレ型', desc: '「私だけのもの…」' },
    { id: 'masochist', label: 'ドM型', desc: '「もっと酷くして」' },
    { id: 'kuudere', label: 'クーデレ型', desc: '「…別に、嫌じゃない」' },
    { id: 'gyaru', label: 'ギャル型', desc: '「マジウケる〜♡」' },
    { id: 'ojousama', label: 'お嬢様型', desc: '「こんな下品な…」' },
    { id: 'innocent', label: '天然型', desc: '「これって気持ちいい？」' },
    { id: 'experienced', label: '熟練型', desc: '「ここが気持ちいいでしょ？」' },
    { id: 'verbal', label: '実況型', desc: '「今、奥まで入ってる…」' },
];

const FETISH_OPTIONS: { id: FetishEmphasis; label: string }[] = [
    { id: 'feet', label: '足' },
    { id: 'breasts', label: '胸' },
    { id: 'butt', label: '尻' },
    { id: 'smell', label: '匂い' },
    { id: 'voice', label: '声' },
    { id: 'sweat', label: '汗' },
    { id: 'uniform', label: '制服' },
    { id: 'underwear', label: '下着' },
    { id: 'saliva', label: '唾液' },
    { id: 'hair', label: '毛' },
    // 追加15種類
    { id: 'nape', label: 'うなじ' },
    { id: 'armpit', label: '腋' },
    { id: 'tongue', label: '舌' },
    { id: 'eyes', label: '瞳/目線' },
    { id: 'lips', label: '唇' },
    { id: 'navel', label: 'へそ' },
    { id: 'thighs', label: '太もも' },
    { id: 'back', label: '背中' },
    { id: 'hands', label: '手/指' },
    { id: 'neck', label: '首' },
    { id: 'belly', label: 'お腹' },
    { id: 'tan_lines', label: '日焼け跡' },
    { id: 'glasses', label: '眼鏡' },
    { id: 'crying', label: '涙' },
    { id: 'ahegao', label: 'アヘ顔' },
];

const COMPARISON_TARGETS: { id: ComparisonTarget; label: string }[] = [
    { id: 'ex_boyfriend', label: '元彼' },
    { id: 'current_boyfriend', label: '今彼' },
    { id: 'husband', label: '旦那' },
];

const PreferenceSettings: React.FC<PreferenceSettingsProps> = ({ onClose }) => {
    const [prefs, setPrefs] = useState<PlayPreferences>(getStoredPreferences());
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'situation' | 'play' | 'fetish' | 'comparison'>('situation');

    const handleSave = () => {
        setStoredPreferences(prefs);
        setSaved(true);
        setTimeout(() => onClose(), 500);
    };

    // ランダム選択ヘルパー関数
    const getRandomElement = <T,>(array: T[]): T => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const getRandomElements = <T,>(array: T[], min: number, max: number): T[] => {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, array.length));
    };

    // すべての設定をランダム化
    const handleRandomize = () => {
        const randomPrefs: PlayPreferences = {
            // メインシチュエーションから1つ選択
            mainSituation: getRandomElement(MAIN_SITUATIONS).id,

            // 関係性ダイナミクスから0～3個選択
            relationshipDynamics: getRandomElements(
                RELATIONSHIP_DYNAMICS.map(r => r.id),
                0,
                3
            ),

            // 前戯の好みから1～5個選択
            foreplayPreferences: getRandomElements(
                FOREPLAY_PREFERENCES.map(f => f.id),
                1,
                5
            ),

            // 体位の好みから1～3個選択
            positionPreferences: getRandomElements(
                POSITION_PREFERENCES.map(p => p.id),
                1,
                3
            ),

            // フィニッシュの好みから1～2個選択
            finishPreferences: getRandomElements(
                FINISH_PREFERENCES.map(f => f.id),
                1,
                2
            ),

            // 女性の反応タイプから1つ選択
            femaleReactionType: getRandomElement(FEMALE_REACTIONS).id,

            // フェチ強調から0～5個選択
            fetishEmphasis: getRandomElements(
                FETISH_OPTIONS.map(f => f.id),
                0,
                5
            ),

            // 比較セリフをランダムに有効化/無効化
            comparisonEnabled: Math.random() > 0.5,
            comparisonTarget: getRandomElement(COMPARISON_TARGETS).id,

            // 呼び方親密化をランダムに有効化/無効化
            dynamicCallingEnabled: Math.random() > 0.5,
        };

        setPrefs(randomPrefs);
    };

    // Toggle helpers for array fields
    const toggleArrayItem = <T extends string>(
        field: keyof PlayPreferences,
        item: T
    ) => {
        const currentArray = prefs[field] as T[];
        if (currentArray.includes(item)) {
            setPrefs({ ...prefs, [field]: currentArray.filter(i => i !== item) });
        } else {
            setPrefs({ ...prefs, [field]: [...currentArray, item] });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1d] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-serif font-bold text-gray-100 tracking-wider flex items-center gap-2">
                        🎭 プレイ嗜好設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-white/5">
                    {[
                        { id: 'situation', label: 'シチュ・反応' },
                        { id: 'play', label: 'プレイ内容' },
                        { id: 'fetish', label: 'フェチ' },
                        { id: 'comparison', label: '比較セリフ' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-3 px-4 text-sm font-bold tracking-wider transition-all ${activeTab === tab.id
                                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-900/20'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* シチュエーション・反応タブ */}
                    {activeTab === 'situation' && (
                        <>
                            {/* A. メインシチュエーション */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    A. メインシチュエーション（1つ選択）
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {MAIN_SITUATIONS.map(sit => (
                                        <button
                                            key={sit.id}
                                            onClick={() => setPrefs({ ...prefs, mainSituation: sit.id })}
                                            className={`p-3 rounded-lg border text-left transition-all ${prefs.mainSituation === sit.id
                                                ? 'bg-indigo-900/40 border-indigo-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="font-bold text-sm">{sit.label}</div>
                                            <div className="text-[10px] opacity-70">{sit.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* B. 関係性ダイナミクス */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    B. 関係性ダイナミクス（複数選択可）
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {RELATIONSHIP_DYNAMICS.map(rel => (
                                        <button
                                            key={rel.id}
                                            onClick={() => toggleArrayItem('relationshipDynamics', rel.id)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${prefs.relationshipDynamics.includes(rel.id)
                                                ? 'bg-purple-900/40 border-purple-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            {rel.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* D. 女性の反応タイプ */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    D. 女性の反応タイプ（1つ選択）
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {FEMALE_REACTIONS.map(react => (
                                        <button
                                            key={react.id}
                                            onClick={() => setPrefs({ ...prefs, femaleReactionType: react.id })}
                                            className={`p-3 rounded-lg border text-left transition-all ${prefs.femaleReactionType === react.id
                                                ? 'bg-pink-900/40 border-pink-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="font-bold text-sm">{react.label}</div>
                                            <div className="text-[10px] opacity-70">{react.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* プレイ内容タブ */}
                    {activeTab === 'play' && (
                        <>
                            {/* 前戯 */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    前戯の好み（複数選択可）
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {FOREPLAY_PREFERENCES.map(fp => (
                                        <button
                                            key={fp.id}
                                            onClick={() => toggleArrayItem('foreplayPreferences', fp.id)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${prefs.foreplayPreferences.includes(fp.id)
                                                ? 'bg-rose-900/40 border-rose-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            {fp.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 体位 */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    体位の好み（複数選択可）
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {POSITION_PREFERENCES.map(pos => (
                                        <button
                                            key={pos.id}
                                            onClick={() => toggleArrayItem('positionPreferences', pos.id)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${prefs.positionPreferences.includes(pos.id)
                                                ? 'bg-orange-900/40 border-orange-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* フィニッシュ */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                    フィニッシュの好み（複数選択可）
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {FINISH_PREFERENCES.map(fin => (
                                        <button
                                            key={fin.id}
                                            onClick={() => toggleArrayItem('finishPreferences', fin.id)}
                                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${prefs.finishPreferences.includes(fin.id)
                                                ? 'bg-red-900/40 border-red-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            {fin.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* フェチタブ */}
                    {activeTab === 'fetish' && (
                        <div>
                            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                F. フェチ強調設定（複数選択可）
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                選択したフェチは物語中で重点的に描写されます
                            </p>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {FETISH_OPTIONS.map(fet => (
                                    <button
                                        key={fet.id}
                                        onClick={() => toggleArrayItem('fetishEmphasis', fet.id)}
                                        className={`p-3 rounded-lg border text-center transition-all ${prefs.fetishEmphasis.includes(fet.id)
                                            ? 'bg-violet-900/40 border-violet-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="font-bold">{fet.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 比較セリフタブ */}
                    {activeTab === 'comparison' && (
                        <>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    物語が進行したり盛り上がったりすると、女性が主人公を呼ぶときの距離感を
                                    少しずつ親密に変化させます。オフにすると常にデフォルトの呼び方のまま固定されます。
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
                                <div>
                                    <div className="font-bold text-white">呼び方の親密化を有効化</div>
                                    <div className="text-xs text-gray-500">進行度や盛り上がりに応じて呼び方を変える</div>
                                </div>
                                <button
                                    onClick={() => setPrefs({ ...prefs, dynamicCallingEnabled: !prefs.dynamicCallingEnabled })}
                                    className={`w-14 h-8 rounded-full transition-all relative ${prefs.dynamicCallingEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
                                >
                                    <div
                                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.dynamicCallingEnabled ? 'left-7' : 'left-1'}`}
                                    />
                                </button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    有効にすると、行為中に女性が「◯◯よりすごい」「◯◯はもっと上手だった」など、
                                    他の男性と比較するセリフを言うようになります。
                                </p>
                            </div>

                            {/* 有効化トグル */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <div className="font-bold text-white">比較セリフを有効化</div>
                                    <div className="text-xs text-gray-500">他の男性との比較を言わせる</div>
                                </div>
                                <button
                                    onClick={() => setPrefs({ ...prefs, comparisonEnabled: !prefs.comparisonEnabled })}
                                    className={`w-14 h-8 rounded-full transition-all relative ${prefs.comparisonEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.comparisonEnabled ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* 比較対象選択 */}
                            {prefs.comparisonEnabled && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                                        比較対象を選択
                                    </h3>
                                    <div className="flex gap-2">
                                        {COMPARISON_TARGETS.map(target => (
                                            <button
                                                key={target.id}
                                                onClick={() => setPrefs({ ...prefs, comparisonTarget: target.id })}
                                                className={`flex-1 p-3 rounded-lg border text-center transition-all ${prefs.comparisonTarget === target.id
                                                    ? 'bg-amber-900/40 border-amber-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                    }`}
                                            >
                                                {target.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        例：「{prefs.comparisonTarget === 'ex_boyfriend' ? '元彼' : prefs.comparisonTarget === 'husband' ? '主人' : '彼氏'}よりずっと大きい…」
                                        「{prefs.comparisonTarget === 'ex_boyfriend' ? '元彼' : prefs.comparisonTarget === 'husband' ? '主人' : '彼氏'}はこんなこと…してくれなかった」
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all border border-white/10"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleRandomize}
                        className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all shadow-lg shadow-pink-500/20"
                    >
                        🎲 ランダム
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg tracking-wider uppercase text-sm transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {saved ? '✓ 保存完了' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferenceSettings;
