/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, User2, Settings, Flag, HelpCircle, MessageSquareShare, ChevronRight, ListVideo, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isCollapsed: boolean;
  subscriptionsCount?: number;
  activeTab: string;
  onTabSelect: (tab: string) => void;
}

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'ホーム' },
  { icon: PlayCircle, label: 'ショート' },
  { icon: PlaySquare, label: '登録チャンネル' },
];

const MY_PAGE_ITEMS = [
  { icon: History, label: '履歴' },
  { icon: ListVideo, label: '再生リスト' },
  { icon: PlaySquare, label: '作成した動画' },
  { icon: Clock, label: '後で見る' },
  { icon: ThumbsUp, label: '高く評価した動画' },
];

const SUB_CHANNELS = [
  { name: 'はじめしゃちょー(hajime)', avatar: 'H' },
  { name: "Fischer's", avatar: 'F' },
  { name: '東海オンエア', avatar: 'T' },
  { name: 'きまぐれクックKimag...', avatar: 'K' },
  { name: '兄者弟者', avatar: 'A' },
];

export default function Sidebar({ isCollapsed, subscriptionsCount = 0, activeTab, onTabSelect }: SidebarProps) {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-14 left-0 bottom-0 bg-[#0f0f0f] text-white z-40 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <ul className="px-2 pt-2">
          {SIDEBAR_ITEMS.map((item, idx) => (
            <li key={idx} className="mb-0.5">
              <SidebarItem 
                icon={item.icon} 
                label={item.label} 
                isCollapsed={isCollapsed} 
                active={activeTab === item.label} 
                onClick={() => onTabSelect(item.label)}
              />
            </li>
          ))}
        </ul>

        <div className="px-2">
          <hr className="my-3 border-[#303030] mx-2" />
          
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-1 px-3 py-2 cursor-pointer hover:bg-[#272727] rounded-lg group">
                  <span className="text-[16px] font-bold">マイページ</span>
                  <ChevronRight className="w-4 h-4 text-[#aaa] group-hover:text-white" />
                </div>
                <ul className="space-y-0.5">
                  {MY_PAGE_ITEMS.map((item, idx) => (
                    <li key={idx}>
                      <SidebarItem 
                        icon={item.icon} 
                        label={item.label} 
                        isCollapsed={isCollapsed} 
                        active={activeTab === item.label}
                        onClick={() => onTabSelect(item.label)}
                      />
                    </li>
                  ))}
                </ul>
                
                <hr className="my-3 border-[#303030] mx-2" />
                <h3 className="px-3 py-2 text-[16px] font-bold">登録チャンネル</h3>
                <ul className="space-y-0.5">
                  {SUB_CHANNELS.map((ch, idx) => (
                    <li key={idx}>
                      <button className="w-full flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-[#272727] transition-colors cursor-pointer group active:bg-[#3f3f3f]">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`} 
                          className="w-6 h-6 rounded-full flex-shrink-0" 
                          alt=""
                        />
                        <span className="text-[14px] font-normal truncate flex-1 text-left">{ch.name}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button className="w-full flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-[#272727] transition-colors cursor-pointer group active:bg-[#3f3f3f]">
                      <div className="w-6 h-6 border border-[#303030] rounded-full flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                      <span className="text-[14px] font-normal">もっと見る</span>
                    </button>
                  </li>
                </ul>

                <hr className="my-3 border-[#303030] mx-2" />
                <h3 className="px-3 py-2 text-[16px] font-bold">探索</h3>
                <ul className="space-y-0.5 pb-2">
                   <SidebarItem 
                      icon={Compass} 
                      label="急上昇" 
                      isCollapsed={isCollapsed} 
                      active={activeTab === '急上昇'}
                      onClick={() => onTabSelect('急上昇')}
                   />
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="flex flex-col items-center gap-1 w-full py-4 text-center cursor-pointer hover:bg-[#272727] active:bg-[#3f3f3f]">
                  <History className="w-6 h-6" />
                  <span className="text-[10px]">履歴</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  isCollapsed, 
  active = false,
  badge,
  onClick
}: { 
  icon: any, 
  label: string, 
  isCollapsed: boolean,
  active?: boolean,
  badge?: number,
  onClick?: () => void
}) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-full flex items-center transition-all cursor-pointer group px-3 py-2.5 rounded-lg active:scale-[0.98] ${
        active 
          ? 'bg-[#272727] text-white' 
          : 'text-[#f1f1f1] hover:bg-[#272727]'
      } ${isCollapsed ? 'flex-col gap-1.5 justify-center py-4 px-1 rounded-none text-center' : 'gap-6'}`}
    >
      <div className="relative flex items-center justify-center">
        <Icon className={`w-6 h-6 flex-shrink-0 transition-all ${active ? 'fill-white stroke-none' : 'group-hover:scale-110'}`} />
      </div>
      {!isCollapsed && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className={`text-[14px] truncate transition-all ${active ? 'font-bold' : 'font-normal'}`}>{label}</span>
        </div>
      )}
      {isCollapsed && (
        <span className="text-[10px] font-normal transition-colors leading-none">{label}</span>
      )}
    </button>
  );
}
