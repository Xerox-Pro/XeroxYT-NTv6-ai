/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Video, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'すべて' },
  { id: 'trending', label: '急上昇' },
  { id: 'music', label: '音楽' },
  { id: 'gaming', label: 'ゲーム' },
  { id: 'shorts', label: 'ショート' },
  { id: 'live', label: 'ライブ' },
  { id: 'news', label: 'ニュース' },
  { id: 'tech', label: 'テクノロジー' },
  { id: 'movies', label: '映画' },
  { id: 'anime', label: 'アニメ' },
  { id: 'programming', label: 'プログラミング' },
  { id: 'fitness', label: 'フィットネス' },
];

export const VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Exploring the Hidden Valleys of the Alps',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    channelName: 'WildEarth',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    views: '1.2M views',
    postedAt: '2 days ago',
    duration: '12:45',
    description: 'Join us as we trek through some of the most remote and beautiful locations in the Alps. This journey takes us deep into hidden valleys that few have ever seen.'
  },
  {
    id: '2',
    title: 'The Future of Interface Design: 2026 Edition',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000',
    channelName: 'DesignTheory',
    channelAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    views: '450K views',
    postedAt: '5 hours ago',
    duration: '08:20',
    description: 'We explore how spatial computing and AI are reshaping the way we interact with digital interfaces. Predictions for the next decade of design.'
  },
  {
    id: '3',
    title: 'Lofi Beats for Deep Coding Sessions',
    thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=1000',
    channelName: 'CodeWaves',
    channelAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    views: '3.1M views',
    postedAt: '1 year ago',
    duration: '24:00:00',
    description: '24/7 lofi hip hop radio - beats to relax/study/code to. The ultimate companion for your long nights of debugging.'
  },
  {
    id: '4',
    title: 'Mastering React 19: New Hooks and Features',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000',
    channelName: 'TechStack',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    views: '890K views',
    postedAt: '1 week ago',
    duration: '15:30',
    description: 'React 19 is here! In this tutorial, we dive deep into the new useActionState, useOptimistic, and much more.'
  },
  {
    id: '5',
    title: 'The Art of Minimalist Living',
    thumbnail: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000',
    channelName: 'ZenSpace',
    channelAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100',
    views: '2.4M views',
    postedAt: '3 weeks ago',
    duration: '10:15',
    description: 'How removing the clutter from your life can lead to more freedom and focus. Lessons from three years of minimalism.'
  },
  {
    id: '6',
    title: 'Cyberpunk 2077: Phantom Liberty - 4K Ray Tracing',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
    channelName: 'GameGraph',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    views: '5.6M views',
    postedAt: '2 months ago',
    duration: '22:40',
    description: 'Stunning 4K gameplay showcasing the full power of Ray Tracing Overdrive mode in the newest expansion.'
  }
];
