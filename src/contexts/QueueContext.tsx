import { createContext, useContext, useState, ReactNode } from 'react';
import { Track } from '@/types';

interface QueueContextType {
  queue: Track[];
  currentIndex: number;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: (track: Track) => void;
  playLater: (track: Track) => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;
  setCurrentIndex: (index: number) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
  };

  const playNext = (track: Track) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, track);
      return newQueue;
    });
  };

  const playLater = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const moveInQueue = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentIndex,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        playLater,
        moveInQueue,
        setCurrentIndex,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within QueueProvider');
  }
  return context;
}
