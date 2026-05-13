import React from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface ShortVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  views: string;
}

interface ShortsCarouselProps {
  shorts: ShortVideo[];
  onVideoClick: (video: any) => void;
}

export default function ShortsCarousel({ shorts, onVideoClick }: ShortsCarouselProps) {
  if (!shorts || shorts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-red-500">
          <Flame className="w-6 h-6 fill-current" />
        </div>
        <h2 className="text-[20px] font-bold">ショート</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x relative">
        {shorts.map((short, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={short.id}
            className="flex-none w-[160px] sm:w-[200px] lg:w-[240px] snap-start cursor-pointer group"
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
            <div className="aspect-[9/16] rounded-xl overflow-hidden bg-[#272727] relative">
              <img 
                src={short.thumbnail} 
                alt={short.title}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:to-black/90 transition-colors" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
                <h3 className="text-white font-semibold text-[15px] line-clamp-3 leading-tight mb-1 group-hover:underline">
                  {short.title}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
