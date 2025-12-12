import React from 'react';

interface CharacterFilterProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    ageFilters: string[];
    onAgeFilterToggle: (ageRange: string) => void;
    relationshipFilters: string[];
    onRelationshipFilterToggle: (relationship: string) => void;
    sortBy: 'id' | 'name' | 'age';
    onSortChange: (sort: 'id' | 'name' | 'age') => void;
    onClearFilters: () => void;
    resultCount: number;
    totalCount: number;
}

const CharacterFilter: React.FC<CharacterFilterProps> = ({
    searchQuery,
    onSearchChange,
    ageFilters,
    onAgeFilterToggle,
    relationshipFilters,
    onRelationshipFilterToggle,
    sortBy,
    onSortChange,
    onClearFilters,
    resultCount,
    totalCount
}) => {
    const ageRanges = [
        { label: '10代', value: '10s' },
        { label: '20代', value: '20s' },
        { label: '30代', value: '30s' },
        { label: '40代', value: '40s' },
        { label: '50代+', value: '50s' }
    ];

    const relationships = [
        { label: '既婚', value: '既婚' },
        { label: '未婚', value: 'フリー,独身,彼氏なし,恋人なし' },
        { label: 'バツあり', value: '離婚,元妻,未亡人' }
    ];

    const sortOptions = [
        { label: 'ID順', value: 'id' as const },
        { label: '名前順', value: 'name' as const },
        { label: '年齢順', value: 'age' as const }
    ];

    return (
        <div className="w-full max-w-6xl mb-6 bg-[#151518]/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="名前、役職、職場で検索..."
                        className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Age Filter */}
                <div>
                    <label className="text-xs text-gray-400 font-serif tracking-wider mb-2 block">年齢</label>
                    <div className="flex flex-wrap gap-2">
                        {ageRanges.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => onAgeFilterToggle(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${ageFilters.includes(value)
                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Relationship Filter */}
                <div>
                    <label className="text-xs text-gray-400 font-serif tracking-wider mb-2 block">関係性</label>
                    <div className="flex flex-wrap gap-2">
                        {relationships.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => onRelationshipFilterToggle(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${relationshipFilters.includes(value)
                                    ? 'bg-pink-600 text-white border-pink-500'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sort and Results Row */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                {/* Sort Buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-serif mr-2">並び順:</span>
                    {sortOptions.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => onSortChange(value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === value
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Result Count and Clear Button */}
                <div className="flex items-center gap-3 text-xs text-gray-400 font-serif">
                    {resultCount === totalCount ? (
                        <span>{totalCount}人</span>
                    ) : (
                        <span>
                            <span className="text-indigo-400 font-bold">{resultCount}</span> / {totalCount}人
                        </span>
                    )}
                    {(searchQuery || ageFilters.length > 0 || relationshipFilters.length > 0) && (
                        <button
                            onClick={onClearFilters}
                            className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 hover:text-white rounded text-[10px] font-bold tracking-wider transition-all border border-red-500/30"
                        >
                            ✕ クリア
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterFilter;
