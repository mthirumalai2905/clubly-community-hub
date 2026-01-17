-- Create feed_likes table for likes on events and clubs
CREATE TABLE public.feed_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'club')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- Create feed_comments table for comments on events and clubs
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'club')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Policies for feed_likes
CREATE POLICY "Anyone can view likes" ON public.feed_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like items" ON public.feed_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.feed_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for feed_comments
CREATE POLICY "Anyone can view comments" ON public.feed_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.feed_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.feed_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.feed_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at on comments
CREATE TRIGGER update_feed_comments_updated_at
  BEFORE UPDATE ON public.feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_feed_likes_item ON public.feed_likes(item_id, item_type);
CREATE INDEX idx_feed_likes_user ON public.feed_likes(user_id);
CREATE INDEX idx_feed_comments_item ON public.feed_comments(item_id, item_type);
CREATE INDEX idx_feed_comments_user ON public.feed_comments(user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;