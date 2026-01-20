-- Enable realtime for user_activity table so heatmap updates dynamically
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity;