/**
 * Admin Dashboard
 * 
 * Central hub for admin operations:
 * - User management
 * - Content moderation
 * - Analytics
 * - System settings
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/shared';
import { useAdminStats, useFlaggedContent } from '@/hooks/api/useAdmin';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Activity,
  BarChart3,
  Settings,
  Flag,
  Music2,
  Heart,
  Shield,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: flagged = [] } = useFlaggedContent();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PageLayout
      title="Admin Dashboard"
      description="System management and analytics"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active (7d)</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalTracks}</p>
                <p className="text-xs text-muted-foreground">Tracks</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalPlays}</p>
                <p className="text-xs text-muted-foreground">Total Plays</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalInteractions}</p>
                <p className="text-xs text-muted-foreground">Interactions</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Flagged Content Alert */}
        {flagged.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium">Flagged Content Requires Attention</p>
                  <p className="text-sm text-muted-foreground">
                    {flagged.length} item{flagged.length !== 1 ? 's' : ''} awaiting moderation
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setActiveTab('moderation')}
                >
                  Review Now
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="moderation">
                <Flag className="w-4 h-4 mr-2" />
                Moderation
                {flagged.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                    {flagged.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">System Health</h3>
                <p className="text-sm text-muted-foreground">
                  Analytics dashboard coming soon...
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4 mt-6">
              <UserManagementPanel />
            </TabsContent>

            <TabsContent value="moderation" className="space-y-4 mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Content Moderation Queue</h3>
                {flagged.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No flagged content to review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {flagged.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {item.tracks?.title || 'Unknown Track'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Flagged by {item.profiles?.username || 'Anonymous'} •{' '}
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Dismiss
                            </Button>
                            <Button size="sm" variant="destructive">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">System Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Settings panel coming soon...
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageLayout>
  );
}
