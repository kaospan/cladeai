import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Radio, Settings2, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  useNearbyListeners, 
  useUserLocation, 
  useUpdateLocation, 
  useDisableLocationSharing 
} from '@/hooks/api/useNearbyListeners';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface NearbyListenersSheetProps {
  trackId?: string;
  artist?: string;
  trackTitle?: string;
}

export function NearbyListenersSheet({ trackId, artist, trackTitle }: NearbyListenersSheetProps) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [radius, setRadius] = useState(50);
  const [requestingLocation, setRequestingLocation] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: userLocation, isLoading: locationLoading } = useUserLocation();
  const { data: nearbyListeners = [], isLoading: listenersLoading } = useNearbyListeners(trackId, artist);
  const updateLocation = useUpdateLocation();
  const disableSharing = useDisableLocationSharing();

  useEffect(() => {
    if (userLocation?.radius_km) {
      setRadius(userLocation.radius_km);
    }
  }, [userLocation?.radius_km]);

  const requestLocationPermission = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setRequestingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      await updateLocation.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        sharingEnabled: true,
        radiusKm: radius,
      });
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setRequestingLocation(false);
    }
  };

  const handleRadiusChange = async (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    
    if (userLocation) {
      await updateLocation.mutateAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        sharingEnabled: true,
        radiusKm: newRadius,
      });
    }
  };

  const handleToggleSharing = async (enabled: boolean) => {
    if (enabled && !userLocation) {
      await requestLocationPermission();
    } else if (!enabled) {
      await disableSharing.mutateAsync();
    } else if (userLocation) {
      await updateLocation.mutateAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        sharingEnabled: enabled,
        radiusKm: radius,
      });
    }
  };

  const isSharing = userLocation?.sharing_enabled ?? false;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-muted-foreground hover:text-foreground"
        >
          <div className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all relative">
            <Users className="w-6 h-6" />
            {isSharing && nearbyListeners.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {nearbyListeners.length}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Nearby</span>
        </motion.button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              {trackTitle ? `Listeners of "${trackTitle}"` : 'Nearby Music Lovers'}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="py-4 space-y-4">
                {/* Location sharing toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <Label htmlFor="location-sharing">Share my location</Label>
                  </div>
                  <Switch
                    id="location-sharing"
                    checked={isSharing}
                    onCheckedChange={handleToggleSharing}
                    disabled={updateLocation.isPending || disableSharing.isPending}
                  />
                </div>

                {/* Radius slider */}
                {isSharing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Discovery radius</Label>
                      <span className="text-sm text-muted-foreground">{radius} km</span>
                    </div>
                    <Slider
                      value={[radius]}
                      onValueChange={handleRadiusChange}
                      min={5}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Your location is only visible to others who also share theirs.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col h-[calc(80vh-10rem)]">
          <ScrollArea className="flex-1 py-4">
            {!user ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Sign in to discover nearby listeners</p>
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              </div>
            ) : !isSharing ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">Enable location sharing</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover people nearby who love the same music
                </p>
                <Button 
                  onClick={requestLocationPermission}
                  disabled={requestingLocation}
                  className="gap-2"
                >
                  {requestingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Enable Location
                </Button>
              </div>
            ) : listenersLoading || locationLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : nearbyListeners.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No listeners nearby yet</p>
                <p className="text-sm">Check back later or expand your radius</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {nearbyListeners.map((listener, index) => (
                  <motion.div
                    key={listener.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 mb-4 p-3 rounded-xl glass hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={listener.avatar_url} />
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {listener.display_name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{listener.display_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listener.distance_km} km
                        </span>
                      </div>
                      
                      {listener.last_artist && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Recently listened to {listener.last_artist}
                        </p>
                      )}
                      
                      {listener.listened_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(listener.listened_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
