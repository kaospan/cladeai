import { useState } from 'react';
import { PageLayout } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats, useFlaggedContent } from '@/hooks/api/useAdmin';
import { Users, Music, PlayCircle, Heart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: flaggedContent } = useFlaggedContent();

  const metrics = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Active (7d)',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Total Tracks',
      value: stats?.totalTracks || 0,
      icon: Music,
      color: 'text-purple-500',
    },
    {
      title: 'Total Plays',
      value: stats?.totalPlays || 0,
      icon: PlayCircle,
      color: 'text-orange-500',
    },
    {
      title: 'Interactions',
      value: stats?.totalInteractions || 0,
      icon: Heart,
      color: 'text-pink-500',
    },
  ];

  return (
    <PageLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Flagged Content Alert */}
        {flaggedContent && flaggedContent.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {flaggedContent.length} items flagged for review. Check the Moderation tab.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {statsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-20" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))
                : metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <Card key={metric.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium">
                            {metric.title}
                          </CardTitle>
                          <Icon className={`h-4 w-4 ${metric.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {metric.value.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
            </div>

            {/* Analytics Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Charts and visualizations will be added here
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                Coming soon: Active users, popular tracks, and system metrics charts
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User management panel will be added here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>
                  Review flagged content and take action
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedContent && flaggedContent.length > 0 ? (
                  <p className="text-muted-foreground">
                    {flaggedContent.length} items awaiting review
                  </p>
                ) : (
                  <p className="text-muted-foreground">No flagged content</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure feature flags, rate limits, and system preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings panel will be added here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
