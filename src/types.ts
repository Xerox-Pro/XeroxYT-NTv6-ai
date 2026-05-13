/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar?: string;
  views: string;
  postedAt: string;
  duration: string;
  description?: string;
  isVerified?: boolean;
}

export interface Category {
  id: string;
  label: string;
}

export interface Playlist {
  id: string;
  title: string;
  videos: Video[];
}
