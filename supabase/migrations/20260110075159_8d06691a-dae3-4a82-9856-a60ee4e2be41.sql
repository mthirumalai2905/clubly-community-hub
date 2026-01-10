-- Keep role as TEXT for simplicity but update to use new role values
-- Valid roles: 'moderator', 'co_lead', 'elder', 'member'

-- Update existing 'admin' roles to 'moderator'  
UPDATE public.club_memberships SET role = 'moderator' WHERE role = 'admin';

-- Add logo_url to clubs table
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create event_requests table for members/elders to request events
CREATE TABLE public.event_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'online',
  location TEXT,
  meeting_link TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_requests
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user can manage roles (moderator or co_lead)
CREATE OR REPLACE FUNCTION public.can_manage_roles(_user_id UUID, _club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE user_id = _user_id 
      AND club_id = _club_id 
      AND role IN ('moderator', 'co_lead')
  )
$$;

-- Function to check if user can create events directly (moderator or co_lead)
CREATE OR REPLACE FUNCTION public.can_create_events(_user_id UUID, _club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE user_id = _user_id 
      AND club_id = _club_id 
      AND role IN ('moderator', 'co_lead')
  )
$$;

-- Function to check if user can approve event requests (moderator only)
CREATE OR REPLACE FUNCTION public.can_approve_requests(_user_id UUID, _club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE user_id = _user_id 
      AND club_id = _club_id 
      AND role = 'moderator'
  )
$$;

-- Function to get user's role in a club
CREATE OR REPLACE FUNCTION public.get_club_role(_user_id UUID, _club_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.club_memberships 
  WHERE user_id = _user_id AND club_id = _club_id
  LIMIT 1
$$;