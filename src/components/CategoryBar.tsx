/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CATEGORIES } from '../constants';

interface CategoryBarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryBar({ activeId, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-4 lg:px-6 no-scrollbar bg-[#0f0f0f] border-b border-transparent sticky top-14 z-30">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`px-3 py-1.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 border border-transparent ${
            activeId === category.id 
              ? 'bg-white text-black' 
              : 'bg-[#ffffff1A] text-white hover:bg-[#ffffff26]'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
