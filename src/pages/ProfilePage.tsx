import { useState } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { ChordBadge } from '@/components/ChordBadge';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  Music,
  Link as LinkIcon,
  Sparkles,
  Heart,
  Bookmark,
  ChevronRight,
  Zap,
  Crown,
} from 'lucide-react';

// Mock taste DNA data
const tasteDNA = {
  favoriteProgressions: [
    { progression: ['vi', 'IV', 'I', 'V'], count: 42 },
    { progression: ['I', 'V', 'vi', 'IV'], count: 38 },
    { progression: ['i', 'VII', 'VI', 'VII'], count: 24 },
  ],
  preferredModes: [
    { mode: 'minor', percentage: 58 },
    { mode: 'major', percentage: 42 },
  ],
  energyPreference: 0.72,
  cadencePreference: 'loop',
};

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 glass-strong safe-top">
          <div className="px-4 py-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </header>

        <main className="px-4 py-8 max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Sign in to see your profile</h2>
            <p className="text-muted-foreground">
              Track your harmonic taste DNA and saved songs
            </p>
          </div>

          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Sign in
          </Button>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong safe-top">
        <div className="px-4 py-4 max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 glass rounded-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.email?.[0].toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate">{user.email?.split('@')[0]}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 glass rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-medium">Credits</span>
            </div>
            <span className="text-sm text-muted-foreground">Free tier</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <span className="text-sm font-medium">25/100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Credits reset monthly. Used for track analysis.
          </p>
        </motion.div>

        {/* Taste DNA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-bold">Your Taste DNA</h3>
          </div>

          {/* Favorite progressions */}
          <div className="p-4 glass rounded-2xl space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Favorite Progressions
            </h4>
            {tasteDNA.favoriteProgressions.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="flex gap-1">
                  {item.progression.map((chord, i) => (
                    <ChordBadge key={i} chord={chord} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.count} songs
                </span>
              </div>
            ))}
          </div>

          {/* Mode preference */}
          <div className="p-4 glass rounded-2xl space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Mode Preference
            </h4>
            <div className="flex gap-2">
              {tasteDNA.preferredModes.map((item) => (
                <div
                  key={item.mode}
                  className="flex-1 p-3 rounded-xl bg-muted/50 text-center"
                >
                  <span className="text-lg font-bold">{item.percentage}%</span>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.mode}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Energy level */}
          <div className="p-4 glass rounded-2xl space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Energy Preference
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{ width: `${tasteDNA.energyPreference * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </motion.div>

        {/* Connected providers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h3 className="font-bold flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Connected Services
          </h3>

          <button className="w-full p-4 glass rounded-2xl flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div className="text-left">
                <span className="font-medium">Spotify</span>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="w-full p-4 glass rounded-2xl flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-[#FF0000]" />
              </div>
              <div className="text-left">
                <span className="font-medium">YouTube Music</span>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <button className="p-4 glass rounded-2xl flex flex-col items-center gap-2 hover:bg-muted/30 transition-colors">
            <Heart className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium">Liked</span>
            <span className="text-xs text-muted-foreground">0 songs</span>
          </button>

          <button className="p-4 glass rounded-2xl flex flex-col items-center gap-2 hover:bg-muted/30 transition-colors">
            <Bookmark className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Saved</span>
            <span className="text-xs text-muted-foreground">0 songs</span>
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
