/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Video } from '../types';
import { CheckCircle2, MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 cursor-pointer group mb-4"
      onClick={() => onClick(video)}
      id={`video-${video.id}`}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727] shadow-sm group-hover:rounded-none transition-all duration-200 ease-in-out">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-[#000000cc] text-white text-[12px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm">
          {video.duration}
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
      </div>
      
      <div className="flex gap-3 px-1">
        <div className="flex-shrink-0 pt-0.5">
          <img 
            src={video.channelAvatar} 
            alt={video.channelName}
            className="w-9 h-9 rounded-full object-cover transition-opacity hover:opacity-90"
          />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between gap-2">
            <h3 className="text-[#f1f1f1] font-bold text-[16px] line-clamp-2 leading-[1.4] mb-1 group-hover:text-white transition-colors">
              {video.title}
            </h3>
            <button className="h-fit mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#272727] rounded-full">
               <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="text-[#aaa] text-[14px] flex flex-col leading-snug">
            <div className="flex items-center gap-1 hover:text-white transition-colors group/channel">
              <span className="truncate">{video.channelName}</span>
              {(video.isVerified || true) && <CheckCircle2 className="w-3 h-3 fill-[#aaa] text-[#0f0f0f]" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span>{video.views}</span>
              <span className="w-0.5 h-0.5 bg-[#aaa] rounded-full" />
              <span>{video.postedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VideoCard;
