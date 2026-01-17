-- Create track_comments table for comments on tracks
CREATE TABLE public.track_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.track_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_locations table for opt-in location sharing
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  sharing_enabled BOOLEAN NOT NULL DEFAULT true,
  radius_km INTEGER NOT NULL DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nearby_listeners cache table
CREATE TABLE public.nearby_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID NOT NULL,
  artist TEXT,
  listened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_activity ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.track_comments 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.track_comments 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.track_comments 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.track_comments 
FOR DELETE USING (auth.uid() = user_id);

-- User locations policies (opt-in only visible to those who also share)
CREATE POLICY "Users can manage own location" ON public.user_locations 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users who share can see others who share" ON public.user_locations 
FOR SELECT USING (
  sharing_enabled = true 
  AND EXISTS (
    SELECT 1 FROM public.user_locations ul 
    WHERE ul.user_id = auth.uid() 
    AND ul.sharing_enabled = true
  )
);

-- Nearby activity policies
CREATE POLICY "Users can record own activity" ON public.nearby_activity 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users who share location can see nearby activity" ON public.nearby_activity 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_locations ul 
    WHERE ul.user_id = auth.uid() 
    AND ul.sharing_enabled = true
  )
);

-- Indexes for performance
CREATE INDEX idx_track_comments_track_id ON public.track_comments(track_id);
CREATE INDEX idx_track_comments_parent_id ON public.track_comments(parent_id);
CREATE INDEX idx_nearby_activity_track_id ON public.nearby_activity(track_id);
CREATE INDEX idx_nearby_activity_artist ON public.nearby_activity(artist);
CREATE INDEX idx_user_locations_coords ON public.user_locations(latitude, longitude);

-- Triggers for updated_at
CREATE TRIGGER update_track_comments_updated_at
BEFORE UPDATE ON public.track_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();