/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CategoryBar from './components/CategoryBar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import ShortsCarousel from './components/ShortsCarousel';
import { Video, Category, Playlist } from './types';
import { VIDEOS } from './constants';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Play, Shuffle, Repeat } from 'lucide-react';
import { getCustomAIInterests, rankVideosByPreference } from './services/customRecommendationEngine';

const EXTERNAL_APIS = [
    'https://xeroxyt-nt-apiv1-0ydt.onrender.com',
    'https://xeroxyt-nt-apiv1.onrender.com',
    'https://xeroxyt-nt-apiv1-5vsz.onrender.com',
    'https://xeroxyt-nt-apiv1-m28t.onrender.com'
];

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination & Prefetch states
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prefetchedVideos, setPrefetchedVideos] = useState<Video[]>([]);
  const [prefetchedShorts, setPrefetchedShorts] = useState<any[]>([]);
  const [isPrefetching, setIsPrefetching] = useState(false);

  const [activeTab, setActiveTab] = useState('ホーム');
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'relevance',
    duration: '',
    date: ''
  });

  // Playlist state
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('xerotube_playlists');
    return saved ? JSON.parse(saved) : [{ id: 'favorites', title: '高く評価した動画', videos: [] }];
  });
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  // Persistence State
  const [history, setHistory] = useState<Video[]>(() => {
    const saved = localStorage.getItem('xerotube_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('xerotube_subs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('xerotube_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('xerotube_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('xerotube_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const fetchVideos = async (isNewSearch: boolean = true) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (activeTab === '登録チャンネル' || activeTab === '履歴' || activeTab === '再生リスト') {
        setIsLoading(false);
        return;
      }
      if (!isNewSearch) return;

      const query = searchQuery || selectedCategory || 'trending';
      const url = `/api/search?q=${encodeURIComponent(query)}`;
      
      let res;
      try {
        res = await fetch(url);
      } catch (e) {
        // Fallback for static environments like GitHub Pages
        console.warn('API server unavailable, using mock data');
        const mockVideos = VIDEOS.filter(v => 
          v.title.toLowerCase().includes(query.toLowerCase()) || 
          v.channelName.toLowerCase().includes(query.toLowerCase()) ||
          query === 'all' || query === 'trending'
        );
        setVideos(mockVideos.length > 0 ? mockVideos : VIDEOS);
        setShorts([]);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        // Try external fallbacks if the local one fails
        const randomApi = EXTERNAL_APIS[Math.floor(Math.random() * EXTERNAL_APIS.length)];
        const fallbackRes = await fetch(`${randomApi}/api/search?q=${encodeURIComponent(query)}`);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setVideos(data.videos || []);
          setShorts(data.shorts || []);
          return;
        }
        throw new Error('All fallbacks failed');
      }

      const data = await res.json();
      setVideos(data.videos || []);
      setShorts(data.shorts || []);
      setNextPage(2);
      setPrefetchedVideos([]);
      setPrefetchedShorts([]);
    } catch (err) {
      console.error(err);
      // Final fallback to mock data on error
      setVideos(VIDEOS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrefetch = async () => {
    if (!nextPage || isPrefetching || activeTab === '履歴' || activeTab === '再生リスト' || activeTab === '登録チャンネル') return;
    setIsPrefetching(true);
    try {
      let query = searchQuery || selectedCategory;
      if (!query || query === 'all') query = '日本 人気';
      if (query === 'trending') query = '急上昇 日本';
      
      const randomApi = EXTERNAL_APIS[Math.floor(Math.random() * EXTERNAL_APIS.length)];
      const url = `${randomApi}/api/search?q=${encodeURIComponent(query)}&page=${nextPage}`;
      
      let res;
      try {
        res = await fetch(url);
      } catch (e) {
         setIsPrefetching(false);
         return;
      }
      
      if (!res.ok) throw new Error('Prefetch failed');
      const data = await res.json();
      
      const formatVideo = (v: any) => ({
          id: v.video_id || v.id,
          title: v.title?.text || v.title || "",
          thumbnail: v.thumbnails?.[0]?.url || (v.thumbnail?.thumbnails?.[0]?.url) || v.thumbnail?.[0]?.url || "",
          channelName: v.author?.name || "Unknown",
          channelAvatar: v.author?.thumbnails?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.author?.name || "YT")}`,
          views: v.short_view_count?.text || v.views || "0",
          postedAt: v.published?.text || "最近",
          duration: v.length_text?.text || v.duration?.toString() || "0:00",
          description: v.snippets?.[0]?.text?.text || "",
          isVerified: v.author?.badges?.some((b:any) => b.metadataBadgeRenderer?.icon?.iconType === "CHECK_CIRCLE") || false
      });

      const rawVideos = (data.videos || []);
      const vids = rawVideos.filter((v: any) => v.type === 'Video').map(formatVideo);
      const newShorts = rawVideos.filter((v: any) => v.type === 'ShortsLockupView' || v.is_short).map((v: any) => ({
          id: v.on_tap_endpoint?.payload?.videoId || v.video_id || v.id,
          title: v.title?.text || v.title || v.accessibility_text || "",
          thumbnail: v.thumbnail?.[0]?.url || v.thumbnails?.[0]?.url || "",
          views: v.short_view_count?.text || v.views || "0"
      }));

      setPrefetchedVideos(vids);
      setPrefetchedShorts(newShorts);
      setNextPage(data.nextPageToken ? parseInt(data.nextPageToken) : null);
    } catch (err) {
      console.error('Prefetch error:', err);
      // If failed, maybe try again later by not setting nextPage to null
    } finally {
      setIsPrefetching(false);
    }
  };

  useEffect(() => {
    if (nextPage && prefetchedVideos.length === 0 && !isPrefetching) {
      fetchPrefetch();
    }
  }, [nextPage, prefetchedVideos.length, isPrefetching]);

  useEffect(() => {
    const timer = setTimeout(() => fetchVideos(true), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, activeTab]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (history.length === 0) {
        setRecommendations([]);
        return;
      }
      try {
        const keywords = getCustomAIInterests(history);
        const res = await fetch(`/api/recommendations?keywords=${encodeURIComponent(keywords)}`);
        if (res.ok) {
          const data = await res.json();
          const ranked = rankVideosByPreference(data, history);
          setRecommendations(ranked);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecommendations();
  }, [history.length]);

  const handleVideoSelect = (video: Video, playlistContext?: Playlist) => {
    setSelectedVideo(video);
    if (playlistContext) {
      setCurrentPlaylist(playlistContext);
      setPlaylistIndex(playlistContext.videos.findIndex(v => v.id === video.id));
    } else {
      setCurrentPlaylist(null);
    }
    setHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      return [video, ...filtered].slice(0, 50);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePlaylist = () => {
    const name = prompt('再生リストの名前を入力してください:');
    if (name) {
      setPlaylists(prev => [...prev, { id: Date.now().toString(), title: name, videos: [] }]);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 500 >= 
      document.documentElement.offsetHeight
    ) {
      if (!isLoading && !selectedVideo && activeTab !== '履歴' && activeTab !== '再生リスト' && activeTab !== '登録チャンネル') {
        if (prefetchedVideos.length > 0) {
          setVideos(prev => [...prev, ...prefetchedVideos]);
          setShorts(prev => [...prev, ...prefetchedShorts]);
          setPrefetchedVideos([]);
          setPrefetchedShorts([]);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefetchedVideos, isLoading, selectedVideo, activeTab, prefetchedShorts]);

  const handleBackToHome = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-gray-500 selection:text-white">
      <Navbar 
        onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onSearchSubmit={() => {
          setActiveTab('ホーム');
          setSelectedCategory('all');
          fetchVideos(true);
        }}
      />
      
      {!selectedVideo && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          subscriptionsCount={subscriptions.length}
          activeTab={activeTab}
          onTabSelect={(tab) => {
            setActiveTab(tab);
            if (tab === 'ホーム') setSelectedCategory('all');
            if (tab === '急上昇') setSelectedCategory('trending');
            if (tab === 'ショート') setSelectedCategory('shorts');
            setSearchQuery('');
          }}
        />
      )}

      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: selectedVideo ? 0 : (isSidebarCollapsed ? 72 : 240),
          width: selectedVideo ? '100%' : `calc(100% - ${selectedVideo ? 0 : (isSidebarCollapsed ? 72 : 240)}px)`
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="pt-14 min-h-screen"
      >
        <AnimatePresence mode="wait">
          {!selectedVideo ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!searchQuery && activeTab !== '履歴' && activeTab !== '再生リスト' && (
                <CategoryBar 
                  activeId={selectedCategory} 
                  onSelect={(id) => {
                    setSelectedCategory(id);
                    setActiveTab('ホーム');
                  }} 
                />
              )}
              
              <div className="p-4 lg:p-6 lg:pt-4">
                {activeTab === '履歴' && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-black mb-4">再生履歴</h2>
                    {history.length === 0 && (
                      <p className="text-[#888]">履歴はありません。</p>
                    )}
                  </div>
                )}

                {activeTab === '再生リスト' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black">再生リスト</h2>
                       <button onClick={handleCreatePlaylist} className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-full cursor-pointer hover:bg-[#d9d9d9] transition-colors">
                          <Plus className="w-5 h-5" /> 作成
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {playlists.map(pl => (
                         <div key={pl.id} className="bg-[#1c1c1c] rounded-2xl overflow-hidden border border-[#272727] group cursor-pointer" onClick={() => {
                           if(pl.videos.length > 0) handleVideoSelect(pl.videos[0], pl);
                         }}>
                            <div className="aspect-video bg-[#272727] relative flex items-center justify-center">
                               {pl.videos[0] ? (
                                  <>
                                    <img src={pl.videos[0].thumbnail} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                       <Play className="w-12 h-12 fill-white text-white" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                       <ListVideoIcon className="w-4 h-4" /> {pl.videos.length}本
                                    </div>
                                  </>
                               ) : (
                                  <span className="text-[#888] font-medium">（動画がありません）</span>
                               )}
                            </div>
                            <div className="p-4">
                               <h3 className="font-bold text-lg">{pl.title}</h3>
                               <p className="text-[#aaa] text-sm mt-1">動画 {pl.videos.length}本</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {(selectedCategory === 'shorts' || activeTab === 'ショート') ? (
                   <div className="flex flex-wrap gap-4 justify-center">
                     {shorts.length > 0 ? (
                       <ShortsCarousel shorts={shorts} onVideoClick={handleVideoSelect} />
                     ) : (
                       <div className="flex items-center justify-center py-10 w-full">
                         <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                       </div>
                     )}
                   </div>
                ) : activeTab !== '再生リスト' && (
                  <>
                    {(activeTab === 'ホーム' || searchQuery) && shorts.length > 0 && (
                      <>
                        <ShortsCarousel shorts={shorts} onVideoClick={handleVideoSelect} />
                        <hr className="my-6 border-t-4 border-[#303030]" />
                      </>
                    )}

                    {activeTab === 'ホーム' && recommendations.length > 0 && !searchQuery && (
                      <div className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xl:gap-6">
                          {recommendations.slice(0, 5).map((video, index) => (
                            <div key={`rec-${video.id}-${index}`}>
                              <VideoCard 
                                video={video} 
                                onClick={handleVideoSelect} 
                              />
                            </div>
                          ))}
                        </div>
                        <hr className="mt-10 border-t-4 border-[#303030]" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 xl:gap-6">
                      {(activeTab === '履歴' ? history : videos).map((video, index) => (
                        <div key={`${video.id}-${index}`}>
                          <VideoCard 
                            video={video} 
                            onClick={handleVideoSelect} 
                          />
                        </div>
                      ))}
                    </div>

                    {isPrefetching && (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                         <div className="w-8 h-8 border-4 border-white/10 border-t-[#3ea6ff] rounded-full animate-spin" />
                         <span className="text-[14px] text-[#aaa] font-medium tracking-tight">次を読み込み中...</span>
                      </div>
                    )}
                  </>
                )}
                {isLoading && activeTab !== '履歴' && activeTab !== '再生リスト' && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="player-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="px-4 pt-4 flex gap-4">
                <button 
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] border border-[#272727] hover:bg-[#333] rounded-full text-sm font-medium transition-all cursor-pointer w-fit"
                >
                  <span className="text-lg leading-none mb-0.5">←</span> 戻る
                </button>
              </div>
              <VideoPlayerView 
                video={selectedVideo} 
                videos={videos}
                shorts={shorts}
                recommendations={recommendations}
                onVideoClick={handleVideoSelect}
                isSubscribed={subscriptions.includes(selectedVideo.channelName)}
                onToggleSub={() => {
                  setSubscriptions(prev => 
                    prev.includes(selectedVideo.channelName)
                      ? prev.filter(s => s !== selectedVideo.channelName)
                      : [...prev, selectedVideo.channelName]
                  );
                }}
                playlists={playlists}
                onAddToPlaylist={(playlistId) => {
                  setPlaylists(prev => prev.map(p => 
                    p.id === playlistId && !p.videos.some(v => v.id === selectedVideo.id) 
                      ? { ...p, videos: [...p.videos, selectedVideo] } 
                      : p
                  ));
                }}
                currentPlaylistContext={currentPlaylist}
                playlistIndex={playlistIndex}
                onPlaylistNext={() => {
                   if(currentPlaylist && playlistIndex < currentPlaylist.videos.length - 1) {
                      handleVideoSelect(currentPlaylist.videos[playlistIndex + 1], currentPlaylist);
                   }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {!isSidebarCollapsed && !selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}

function FilterOptions({ options, value, onChange }: { options: {label: string, val: string}[], value: string, onChange: (val: string) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {options.map(opt => (
        <li 
          key={opt.val} 
          onClick={() => onChange(opt.val)}
          className={`cursor-pointer px-2 py-1.5 rounded-lg text-[14px] transition-colors ${value === opt.val ? 'font-medium text-white' : 'text-[#aaa] hover:text-[#f1f1f1]'}`}
        >
          {opt.label}
        </li>
      ))}
    </ul>
  );
}

function ListVideoIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/><path d="m16 12 5 3-5 3v-6Z"/></svg>
  )
}

