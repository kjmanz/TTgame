
import React from 'react';
import { Character } from '../types';

interface Props {
  character: Character;
  onSelect: (char: Character) => void;
}

const CharacterCard: React.FC<Props> = ({ character, onSelect }) => {
  // Extract numeric ID from character.id (e.g., "1_character" -> "1")
  const numericId = character.id.split('_')[0];
  // Use relative path that works with Vite/GitHub Pages
  const imageUrl = `./characters/${numericId}.jpg`;

  return (
    <div
      onClick={() => onSelect(character)}
      className="group relative bg-[#fcfaf5] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/30 flex flex-col h-full border border-gray-200/60"
    >
      {/* Character Portrait Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-200 overflow-hidden">
        <img
          src={imageUrl}
          alt={character.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            // Hide image on error, show placeholder gradient
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Name overlay on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[10px] font-serif text-white/70 tracking-widest uppercase mb-0.5">
            No. {numericId}
          </p>
          <h3 className="text-2xl font-serif font-bold text-white leading-tight drop-shadow-lg">
            {character.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium bg-white/20 backdrop-blur-sm text-white tracking-wider">
              {character.age}歳
            </span>
            <span className="text-xs font-serif text-white/80">
              {character.role}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 opacity-80"></div>

      {/* Main Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow relative">
        <div className="bg-[#f5f2eb] rounded-lg p-3 md:p-4 border border-[#e5e2d9] mb-4">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm font-serif">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] tracking-wider">RELATIONSHIP</span>
              <span className="text-gray-800 font-medium">{character.relationship}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] tracking-wider">FIGURE</span>
              <span className="text-gray-800 font-medium">{character.height} / {character.measurements}</span>
            </div>
            <div className="col-span-2 h-px bg-gray-300/50 my-1"></div>
            <div className="flex flex-col col-span-2">
              <span className="text-gray-400 text-[10px] tracking-wider mb-0.5">SCENT</span>
              <span className="text-indigo-900 font-medium italic">「{character.scent}」</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-gray-400 text-[10px] tracking-wider mb-0.5">SECRET</span>
              <span className="text-rose-800 font-medium">{character.weakness}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex-grow">
          <p className="text-sm text-gray-700 leading-7 font-serif text-justify line-clamp-4 md:line-clamp-none opacity-90 group-hover:opacity-100 transition-opacity">
            {character.description}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center">
          <span className="relative inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-400 group-hover:text-indigo-800 transition-colors uppercase tracking-[0.2em] duration-300">
            Select Story
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
