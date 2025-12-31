-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club memberships table
CREATE TABLE public.club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'online' CHECK (event_type IN ('online', 'offline')),
  location TEXT,
  meeting_link TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Clubs policies
CREATE POLICY "Clubs are viewable by everyone" 
ON public.clubs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create clubs" 
ON public.clubs FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Club creators can update their clubs" 
ON public.clubs FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Club creators can delete their clubs" 
ON public.clubs FOR DELETE USING (auth.uid() = created_by);

-- Club memberships policies
CREATE POLICY "Club memberships are viewable by everyone" 
ON public.club_memberships FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join clubs" 
ON public.club_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs" 
ON public.club_memberships FOR DELETE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT USING (true);

CREATE POLICY "Club members can create events" 
ON public.events FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.club_memberships 
    WHERE club_id = events.club_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Event creators can update their events" 
ON public.events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events" 
ON public.events FOR DELETE USING (auth.uid() = created_by);

-- Event RSVPs policies
CREATE POLICY "RSVPs are viewable by everyone" 
ON public.event_rsvps FOR SELECT USING (true);

CREATE POLICY "Authenticated users can RSVP" 
ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVP" 
ON public.event_rsvps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their RSVP" 
ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Messages are viewable by event attendees" 
ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.event_rsvps 
    WHERE event_id = messages.event_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Attendees can send messages" 
ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.event_rsvps 
    WHERE event_id = messages.event_id AND user_id = auth.uid()
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_club_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clubs SET member_count = member_count - 1 WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for member count
CREATE TRIGGER on_membership_change
  AFTER INSERT OR DELETE ON public.club_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_club_member_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();