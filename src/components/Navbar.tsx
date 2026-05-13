/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Menu, Bell, Video, User, Mic, PlusSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function Navbar({ onMenuClick, searchQuery, onSearchChange, onSearchSubmit }: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors cursor-pointer active:bg-[#3f3f3f]"
          id="menu-toggle"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-0.5 cursor-pointer group relative pt-1" id="logo" onClick={() => { onSearchChange(''); onSearchSubmit(); }}>
          <div className="flex items-center pl-1">
            <div className="bg-[#FF0000] w-[30px] h-[21px] rounded-[6px] flex items-center justify-center mr-1">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
            </div>
            <span className="text-[19px] font-bold text-white tracking-tighter flex items-start" style={{ fontFamily: '"YouTube Sans", Roboto, sans-serif' }}>
              YouTube
              <span className="text-[10px] font-normal text-[#aaa] ml-0.5 mt-[1px]">JP</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[720px] flex items-center gap-3 ml-12">
        <div className="flex-1 flex items-center h-10">
          <form 
            onSubmit={handleSubmit} 
            className={`flex-1 flex items-center bg-[#121212] border ${isSearchFocused ? 'border-[#1c62b9] ml-0' : 'border-[#303030] ml-8'} rounded-l-full overflow-hidden h-full transition-all duration-100 ease-in-out shadow-inner`}
          >
            {isSearchFocused && (
              <div className="pl-4 pr-2">
                <Search className="w-4 h-4 text-[#aaa]" />
              </div>
            )}
            <input 
              type="text" 
              placeholder="検索" 
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-white px-4 py-2 outline-none placeholder:text-[#888] text-[16px] font-normal"
            />
          </form>
          <button 
            type="submit" 
            className="bg-[#222222] border border-[#303030] border-l-0 px-5 py-2 hover:bg-[#272727] transition-colors cursor-pointer rounded-r-full h-full flex items-center justify-center group"
            id="search-btn"
            title="検索"
          >
            <Search className="w-5 h-5 text-white stroke-[1.2px]" />
          </button>
        </div>
        <button className="p-2.5 bg-[#181818] hover:bg-[#272727] rounded-full transition-colors cursor-pointer ml-1 active:bg-[#3f3f3f]" title="音声で検索">
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-[#272727] rounded-full transition-colors cursor-pointer active:bg-[#3f3f3f]" title="作成">
          <PlusSquare className="w-6 h-6 text-white stroke-[1.5px]" />
        </button>
        <button className="p-2 hover:bg-[#272727] rounded-full transition-colors cursor-pointer active:bg-[#3f3f3f]" title="通知">
          <Bell className="w-6 h-6 text-white stroke-[1.5px]" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden ml-2 cursor-pointer border border-[#272727]">
          <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </nav>
  );
}
