/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Video, Playlist } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, MessageSquare, Flame, PlusSquare, ListVideo, Play, Shuffle, Repeat } from 'lucide-react';
import ShortsCarousel from './ShortsCarousel';

interface VideoPlayerViewProps {
  video: Video;
  videos: Video[];
  shorts?: any[];
  recommendations: Video[];
  onVideoClick: (video: Video) => void;
  isSubscribed: boolean;
  onToggleSub: () => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (id: string) => void;
  currentPlaylistContext?: Playlist | null;
  playlistIndex?: number;
  onPlaylistNext?: () => void;
}

const APIS = [
    'https://xeroxyt-nt-apiv1-0ydt.onrender.com',
    'https://xeroxyt-nt-apiv1.onrender.com',
    'https://xeroxyt-nt-apiv1-5vsz.onrender.com',
    'https://xeroxyt-nt-apiv1-m28t.onrender.com'
];

export default function VideoPlayerView({ video, videos, shorts = [], recommendations, onVideoClick, isSubscribed, onToggleSub, playlists = [], onAddToPlaylist, currentPlaylistContext, playlistIndex = 0, onPlaylistNext }: VideoPlayerViewProps) {
  const [detailedVideo, setDetailedVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const randomApi = APIS[Math.floor(Math.random() * APIS.length)];
        
        const res = await fetch(`${randomApi}/api/video?id=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          setDetailedVideo({
            description: data.secondary_info?.description?.text || data.primary_info?.description?.text || data.basic_info?.short_description || "",
            views: data.primary_info?.view_count?.view_count?.text || data.basic_info?.view_count?.toString() || "0",
            postedAt: data.primary_info?.published?.text || "最近",
            subscribers: data.secondary_info?.owner?.subscriber_count?.text || "非公開",
            likes: data.basic_info?.like_count || data.primary_info?.menu?.top_level_buttons?.[0]?.like_button?.toggle_button?.default_button?.title || "0",
            channelName: data.secondary_info?.owner?.author?.name || undefined,
            channelAvatar: data.secondary_info?.owner?.author?.thumbnails?.[0]?.url || undefined,
          });
          
          if (data.watch_next_feed && Array.isArray(data.watch_next_feed)) {
             setRelatedVideos(data.watch_next_feed.map((v: any) => ({
                 id: v.content_id || v.id,
                 title: v.metadata?.title?.text || v.title?.text || v.title || "",
                 thumbnail: v.content_image?.image?.[0]?.url || v.thumbnail?.[0]?.url || v.thumbnails?.[0]?.url || "",
                 channelName: v.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || v.author?.name || v.short_byline_text?.runs?.[0]?.text || "Unknown",
                 views: v.metadata?.metadata?.metadata_rows?.[1]?.metadata_parts?.[0]?.text?.text || v.short_view_count_text?.simpleText || v.view_count?.text || "",
                 postedAt: v.metadata?.metadata?.metadata_rows?.[1]?.metadata_parts?.[1]?.text?.text || v.published?.text || "",
                 duration: v.content_image?.overlays?.[0]?.badges?.[0]?.text || v.length_text?.simpleText || "",
                 description: "",
                 isVerified: false
             })));
          }

          // Set initial likes from data
          const likeStr = data.basic_info?.like_count?.toString() || data.primary_info?.menu?.top_level_buttons?.[0]?.like_button?.toggle_button?.default_button?.title;
          if (likeStr) {
            const match = likeStr.match(/(\d+)/);
            if (match) {
               const val = parseInt(match[1]);
               setLikes(likeStr.includes('万') || likeStr.includes('K') ? val * 1000 : val);
            }
          }
        }

        const commentsRes = await fetch(`${randomApi}/api/comments?id=${video.id}`);
        if (commentsRes.ok) {
          const cData = await commentsRes.json();
          if (cData.comments) {
              setComments(cData.comments.map((c: any) => ({
                  id: c.comment_id,
                  user: c.author?.name || 'User',
                  avatar: c.author?.thumbnails?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}`,
                  text: c.text || '',
                  time: c.published_time || '',
                  likes: c.like_count || '0'
              })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
    
    setShowFullDescription(false);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video.id]);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikes(prev => prev + 1);
      if (isDisliked) setIsDisliked(false);
    }
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  const currentDescription = detailedVideo?.description || video.description;
  const currentSubscribers = detailedVideo?.subscribers || "非公開";

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://ui-avatars.com/api/?name=You',
      text: commentText,
      time: 'たった今',
      likes: '0'
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  // We add an invisible dummy iframe listener for 'autoplay next' simulating
  // Actually, youtube iframe embed api needs script load, we will just use next button for now.

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 xl:p-6 max-w-[1800px] mx-auto text-white">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl relative border border-[#272727]">
          <iframe 
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>

        <div className="mt-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight">{video.title}</h1>
          
          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <img 
                  src={detailedVideo?.channelAvatar || video.channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName)}`} 
                  alt={detailedVideo?.channelName || video.channelName} 
                  className="w-[40px] h-[40px] rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col mr-3 cursor-pointer">
                <span className="font-bold text-[#f1f1f1] text-[16px] leading-tight">{detailedVideo?.channelName || video.channelName}</span>
                <span className="text-[12px] text-[#aaa]">{currentSubscribers} のチャンネル登録者</span>
              </div>
              <button 
                onClick={onToggleSub}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all cursor-pointer ${
                  isSubscribed 
                    ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' 
                    : 'bg-white text-black hover:bg-[#d9d9d9]'
                }`}
              >
                {isSubscribed ? '登録済み' : 'チャンネル登録'}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-visible no-scrollbar relative">
              <div className="flex items-center bg-[#272727] rounded-full overflow-hidden h-9">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 h-full transition-colors border-r border-[#3f3f3f] cursor-pointer hover:bg-[#3f3f3f] ${
                    isLiked ? 'text-white' : ''
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-[14px] font-medium">{detailedVideo?.likes || (likes > 0 ? (likes / 1000).toFixed(1) + 'K' : '0')}</span>
                </button>
                <button 
                  onClick={handleDislike}
                  className={`px-4 h-full transition-colors cursor-pointer hover:bg-[#3f3f3f] ${
                    isDisliked ? 'text-white' : ''
                  }`}
                >
                  <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <button className="flex items-center gap-2 bg-[#272727] h-9 px-4 rounded-full hover:bg-[#3f3f3f] transition-colors cursor-pointer">
                <Share2 className="w-5 h-5" />
                <span className="text-[14px] font-medium hidden md:block">共有</span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                  className="flex items-center gap-2 bg-[#272727] h-9 px-4 rounded-full hover:bg-[#3f3f3f] transition-colors cursor-pointer"
                >
                  <PlusSquare className="w-5 h-5" />
                  <span className="text-[14px] font-medium hidden md:block">保存</span>
                </button>
                
                {showPlaylistMenu && (
                  <div className="absolute right-0 top-11 bg-[#272727] rounded-xl shadow-2xl py-2 w-56 z-50 border border-[#3f3f3f]">
                    <div className="px-4 py-2 border-b border-[#3f3f3f]">
                      <span className="text-sm font-bold">再生リストに保存</span>
                    </div>
                    {playlists.map(pl => (
                      <button 
                        key={pl.id}
                        onClick={() => {
                          if (onAddToPlaylist) onAddToPlaylist(pl.id);
                          setShowPlaylistMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center justify-between transition-colors"
                      >
                         <span className="text-sm truncate pr-2">{pl.title}</span>
                         {pl.videos.some(v => v.id === video.id) && (
                           <span className="text-xs bg-[#3ea6ff] text-black px-1.5 py-0.5 rounded font-bold">保存済</span>
                         )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="bg-[#272727] h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#3f3f3f] transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            onClick={() => !showFullDescription && setShowFullDescription(true)}
            className={`mt-4 bg-[#272727] rounded-xl p-3 text-[14px] transition-all ${!showFullDescription ? 'hover:bg-[#3f3f3f] cursor-pointer' : ''}`}
          >
            <div className="flex items-center gap-2 font-medium text-[14px] mb-1">
              <span>{detailedVideo?.views || video.views} 回視聴</span>
              <span className="text-[#aaa]">•</span>
              <span>{detailedVideo?.postedAt || video.postedAt}</span>
            </div>
            <p className={`text-[#f1f1f1] whitespace-pre-wrap leading-relaxed ${!showFullDescription ? 'line-clamp-2' : ''}`}>
              {currentDescription}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDescription(!showFullDescription);
              }}
              className="mt-2 font-bold text-white text-[14px]"
            >
              {showFullDescription ? '一部を表示' : '...もっと見る'}
            </button>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <div className="flex items-center gap-8 mb-6">
              <h2 className="text-[20px] font-bold">{comments.length} 件のコメント</h2>
              <button className="flex items-center gap-2 text-[14px] font-medium text-white hover:bg-[#272727] px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <div className="w-4 h-[2px] bg-white" />
                  <div className="w-3 h-[2px] bg-white" />
                  <div className="w-2 h-[2px] bg-white" />
                </div>
                並べ替え
              </button>
            </div>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="https://ui-avatars.com/api/?name=You&background=random" alt="You" />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="コメントを追加..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-transparent border-b border-[#3f3f3f] px-1 py-1.5 outline-none focus:border-white transition-all text-[14px] placeholder:text-[#aaa]"
                />
                {commentText && (
                  <div className="flex justify-end gap-2 mt-3">
                    <button type="button" onClick={() => setCommentText('')} className="px-4 py-2 text-[14px] font-medium hover:bg-[#272727] rounded-full transition-colors cursor-pointer">キャンセル</button>
                    <button type="submit" className="px-4 py-2 text-[14px] font-medium bg-[#3ea6ff] text-black rounded-full hover:bg-[#65b8ff] transition-colors cursor-pointer">コメント</button>
                  </div>
                )}
              </div>
            </form>

            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={comment.id || index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
                    <img src={comment.avatar} alt="User" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[13px] mb-1">
                      <span className="font-bold text-[#f1f1f1] cursor-pointer">{comment.user}</span>
                      <span className="text-[#aaa]">{comment.time}</span>
                    </div>
                    <p className="text-[14px] text-[#f1f1f1] leading-[1.4] whitespace-pre-wrap">{comment.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <button className="flex items-center gap-1.5 hover:bg-[#272727] p-1.5 rounded-full text-white transition-colors cursor-pointer">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-[12px] text-[#aaa]">{comment.likes}</span>
                      </button>
                      <button className="hover:bg-[#272727] p-1.5 rounded-full text-white transition-colors cursor-pointer">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1.5 rounded-full text-[12px] font-medium text-white hover:bg-[#272727] transition-all cursor-pointer">
                        返信
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Recommendations & Playlist */}
      <div className="xl:w-[400px] flex flex-col gap-4">
        {currentPlaylistContext && (
          <div className="bg-[#1c1c1c] border border-[#272727] rounded-xl overflow-hidden shadow-lg p-4">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="font-bold text-lg leading-tight">{currentPlaylistContext.title}</h3>
              <div className="flex items-center justify-between">
                 <span className="text-sm text-[#aaa]">
                   {playlistIndex + 1} / {currentPlaylistContext.videos.length}
                 </span>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setIsLooping(!isLooping)} className={`p-2 rounded-full transition-colors ${isLooping ? 'bg-white text-black' : 'hover:bg-[#272727]'}`}>
                      <Repeat className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 rounded-full transition-colors ${isShuffle ? 'bg-white text-black' : 'hover:bg-[#272727]'}`}>
                      <Shuffle className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
               {currentPlaylistContext.videos.map((v, idx) => (
                 <div 
                   key={v.id + idx}
                   onClick={() => onVideoClick(v)}
                   className={`flex gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${idx === playlistIndex ? 'bg-[#3f3f3f]' : 'hover:bg-[#272727]'}`}
                 >
                   <div className="flex items-center justify-center w-4 h-full text-[#aaa] text-xs font-medium">
                     {idx === playlistIndex ? <Play className="w-3 h-3 fill-white" /> : idx + 1}
                   </div>
                   <div className="relative w-24 flex-shrink-0 aspect-video rounded overflow-hidden">
                     <img src={v.thumbnail} className="w-full h-full object-cover" />
                     {idx === playlistIndex && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-1/2 h-1/2 flex gap-1 items-center justify-center"><div className="w-1 h-3 bg-white animate-pulse"></div><div className="w-1 h-2 bg-white animate-pulse" style={{animationDelay: '100ms'}}></div><div className="w-1 h-4 bg-white animate-pulse" style={{animationDelay: '200ms'}}></div></div></div>}
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-medium line-clamp-2 text-white">{v.title}</span>
                      <span className="text-[12px] text-[#aaa] mt-1 truncate">{v.channelName}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['すべて', '関連', 'ライブ', '最近アップロードされた動画'].map((label, idx) => (
            <button 
              key={label}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                idx === 0 ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mix normal search results and personalized recommendations */}
        {useMemo(() => {
          const apiRecs = relatedVideos.filter((v: any) => v.id !== video.id).map((v: any) => ({ ...v, isApiRec: true }));
          const recs = recommendations.filter(v => v.id !== video.id).map(v => ({ ...v, isRec: true }));
          const vids = videos.filter(v => v.id !== video.id).map(v => ({ ...v, isRec: false }));
          
          let combined = apiRecs.length > 0 ? apiRecs : [...recs.slice(0, 5), ...vids];
          
          const uniqueIds = new Set();
          return combined.filter(v => {
            if (!v.id || uniqueIds.has(v.id)) return false;
            uniqueIds.add(v.id);
            return true;
          });
        }, [videos, recommendations, relatedVideos, video.id]).map((v: any, index: number) => {
          return (
            <React.Fragment key={v.id}>
              {index === 2 && shorts?.length > 0 && (
                <div className="my-2 bg-[#0f0f0f] border-y border-[#303030] py-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-4 px-2 text-white">
                    <Flame className="w-6 h-6 text-red-500 fill-current" />
                    <span className="font-bold text-[18px]">ショート</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x px-2">
                    {shorts.map((short) => (
                      <div 
                        key={short.id} 
                        className="flex-none w-[140px] snap-start cursor-pointer group"
                        onClick={() => onVideoClick({
                           id: short.id,
                           title: short.title,
                           thumbnail: short.thumbnail,
                           channelName: short.channelName,
                           views: short.views,
                           postedAt: '最近',
                           duration: '',
                           description: '',
                           isVerified: false
                        })}
                      >
                         <div className="aspect-[9/16] rounded-xl overflow-hidden bg-[#272727]">
                            <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         </div>
                         <div className="mt-2">
                           <h4 className="text-[14px] font-medium line-clamp-3 leading-tight">{short.title}</h4>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div 
                className="flex gap-2 cursor-pointer group"
                onClick={() => onVideoClick(v)}
              >
                <div className="relative w-[168px] flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-[#272727]">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute bottom-1 right-1 bg-[#000000cc] text-[12px] font-medium px-1 rounded">
                    {v.duration}
                  </div>
                  {v.isRec && (
                    <div className="absolute top-1 left-1 bg-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest">
                      独自AI予測
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 pr-6 mt-1">
                  <h3 className="text-[14px] font-medium text-[#f1f1f1] line-clamp-2 leading-[1.3] group-hover:text-white mb-1">
                    {v.title}
                  </h3>
                  <div className="text-[12px] text-[#aaa] flex flex-col leading-tight">
                     <span className="hover:text-white transition-colors">{v.channelName}</span>
                     <div className="flex items-center gap-1 mt-0.5">
                       <span>{v.postedAt}</span>
                     </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
