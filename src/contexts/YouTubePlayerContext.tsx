/**
 * Persistent YouTube Player Context
 * 
 * Manages a global YouTube player that continues playing across navigation
 */

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface VideoData {
  videoId: string;
  title: string;
  artist: string;
  startSeconds?: number;
}

interface YouTubePlayerContextValue {
  currentVideo: VideoData | null;
  isPlaying: boolean;
  currentTime: number; // Current playback time in seconds
  duration: number; // Total duration in seconds
  playVideo: (video: VideoData) => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setIsPlaying: (playing: boolean) => void;
  seekTo: (seconds: number) => void;
}

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | null>(null);

export function YouTubePlayerProvider({ children }: { children: ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time while playing
  useEffect(() => {
    if (isPlaying && currentVideo) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentVideo]);

  const playVideo = (video: VideoData) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setCurrentTime(video.startSeconds || 0);
  };

  const pauseVideo = () => {
    setIsPlaying(false);
  };

  const stopVideo = () => {
    setCurrentVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
  };

  return (
    <YouTubePlayerContext.Provider
      value={{
        currentVideo,
        isPlaying,
        currentTime,
        duration,
        playVideo,
        pauseVideo,
        stopVideo,
        setIsPlaying,
        seekTo,
      }}
    >
      {children}
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer() {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error('useYouTubePlayer must be used within YouTubePlayerProvider');
  }
  return context;
}
