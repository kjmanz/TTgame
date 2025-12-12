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
];

const RELATIONSHIP_DYNAMICS: { id: RelationshipDynamic; label: string }[] = [
    { id: 'boss_subordinate', label: '上司と部下' },
    { id: 'age_gap_older', label: '年下×年上' },
    { id: 'first_meeting', label: '初対面' },
    { id: 'ex_partner', label: '元カレ元カノ' },
    { id: 'childhood_friend', label: '幼馴染' },
    { id: 'teacher_student', label: '師弟関係' },
];

const FOREPLAY_PREFERENCES: { id: ForeplayPreference; label: string }[] = [
    { id: 'kissing', label: 'キス重視' },
    { id: 'breast_play', label: '胸責め' },
    { id: 'cunnilingus', label: 'クンニ' },
    { id: 'fellatio', label: 'フェラ' },
    { id: 'fingering', label: '手マン' },
    { id: 'teasing', label: '焦らし' },
    { id: 'dirty_talk', label: '言葉責め' },
];

const POSITION_PREFERENCES: { id: PositionPreference; label: string }[] = [
    { id: 'missionary', label: '正常位' },
    { id: 'doggy', label: '後背位' },
    { id: 'cowgirl', label: '騎乗位' },
    { id: 'standing', label: '立位' },
    { id: 'sitting', label: '座位' },
];

const FINISH_PREFERENCES: { id: FinishPreference; label: string }[] = [
    { id: 'creampie', label: '中出し' },
    { id: 'facial', label: '顔射' },
    { id: 'oral_finish', label: '口内射精' },
    { id: 'pull_out', label: '外出し' },
];

const FEMALE_REACTIONS: { id: FemaleReactionType; label: string; desc: string }[] = [
    { id: 'shy', label: '恥じらい型', desc: '「ダメ…見ないで…」' },
    { id: 'honest', label: '素直型', desc: '「気持ちいい…もっと」' },
    { id: 'tsundere', label: 'ツンデレ型', desc: '「別に感じてないし…」' },
    { id: 'lewd', label: '淫乱型', desc: '「もっと激しく！」' },
    { id: 'silent', label: '無口型', desc: '体の反応で表現' },
    { id: 'begging', label: 'おねだり型', desc: '「お願い…入れて」' },
    { id: 'dominant', label: 'ドS型', desc: '「まだイっちゃダメ」' },
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
                                        例：「{prefs.comparisonTarget === 'ex_boyfriend' ? '元彼' : prefs.comparisonTarget === 'husband' ? '旦那' : '今彼'}よりずっと大きい…」
                                        「{prefs.comparisonTarget === 'ex_boyfriend' ? '元彼' : prefs.comparisonTarget === 'husband' ? '旦那' : '今彼'}はこんなこと…してくれなかった」
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
