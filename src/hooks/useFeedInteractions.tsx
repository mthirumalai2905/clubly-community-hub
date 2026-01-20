import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FeedComment {
  id: string;
  user_id: string;
  item_id: string;
  item_type: "event" | "club";
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface LikeData {
  count: number;
  isLiked: boolean;
}

interface CommentData {
  count: number;
  comments: FeedComment[];
}

export const useFeedInteractions = (itemId: string, itemType: "event" | "club") => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<LikeData>({ count: 0, isLiked: false });
  const [comments, setComments] = useState<CommentData>({ count: 0, comments: [] });
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchLikes = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("feed_likes")
        .select("*", { count: "exact", head: true })
        .eq("item_id", itemId)
        .eq("item_type", itemType);

      let isLiked = false;
      if (user) {
        const { data } = await supabase
          .from("feed_likes")
          .select("id")
          .eq("item_id", itemId)
          .eq("item_type", itemType)
          .eq("user_id", user.id)
          .maybeSingle();
        isLiked = !!data;
      }

      setLikes({ count: count || 0, isLiked });
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [itemId, itemType, user]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("feed_comments")
        .select("*")
        .eq("item_id", itemId)
        .eq("item_type", itemType)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get user profiles for comments
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      let profiles: Record<string, { username: string; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds);

        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = { username: p.username, avatar_url: p.avatar_url };
          return acc;
        }, {} as Record<string, { username: string; avatar_url: string | null }>);
      }

      const commentsWithProfiles = (data || []).map(c => ({
        ...c,
        item_type: c.item_type as "event" | "club",
        profile: profiles[c.user_id],
      }));

      setComments({ count: commentsWithProfiles.length, comments: commentsWithProfiles });
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [itemId, itemType]);

  const toggleLike = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      if (likes.isLiked) {
        await supabase
          .from("feed_likes")
          .delete()
          .eq("item_id", itemId)
          .eq("item_type", itemType)
          .eq("user_id", user.id);
        
        setLikes(prev => ({ count: Math.max(0, prev.count - 1), isLiked: false }));
      } else {
        await supabase
          .from("feed_likes")
          .insert({
            item_id: itemId,
            item_type: itemType,
            user_id: user.id,
          });
        
        setLikes(prev => ({ count: prev.count + 1, isLiked: true }));
        
        // Record activity for liking
        await supabase.rpc("record_user_activity");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Refetch to get correct state
      fetchLikes();
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("feed_comments")
        .insert({
          item_id: itemId,
          item_type: itemType,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .single();

      const newComment: FeedComment = {
        ...data,
        item_type: data.item_type as "event" | "club",
        profile: profile || undefined,
      };

      setComments(prev => ({
        count: prev.count + 1,
        comments: [...prev.comments, newComment],
      }));

      // Record activity for commenting
      await supabase.rpc("record_user_activity");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("feed_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setComments(prev => ({
        count: prev.count - 1,
        comments: prev.comments.filter(c => c.id !== commentId),
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [fetchLikes, fetchComments]);

  // Subscribe to realtime comment updates
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_comments",
          filter: `item_id=eq.${itemId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, fetchComments]);

  return {
    likes,
    comments,
    loading,
    commentsLoading,
    toggleLike,
    addComment,
    deleteComment,
    refetchLikes: fetchLikes,
    refetchComments: fetchComments,
  };
};

// Hook to batch fetch likes/comments counts for multiple items
export const useFeedItemsCounts = (items: Array<{ id: string; type: "event" | "club" }>) => {
  const { user } = useAuth();
  const [likeCounts, setLikeCounts] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      if (items.length === 0) return;

      const itemIds = items.map(i => i.id);

      // Fetch all likes for these items
      const { data: likesData } = await supabase
        .from("feed_likes")
        .select("item_id, user_id")
        .in("item_id", itemIds);

      // Count likes per item and check if user liked
      const likesMap: Record<string, { count: number; isLiked: boolean }> = {};
      items.forEach(item => {
        const itemLikes = (likesData || []).filter(l => l.item_id === item.id);
        likesMap[item.id] = {
          count: itemLikes.length,
          isLiked: user ? itemLikes.some(l => l.user_id === user.id) : false,
        };
      });
      setLikeCounts(likesMap);

      // Fetch comment counts
      const { data: commentsData } = await supabase
        .from("feed_comments")
        .select("item_id")
        .in("item_id", itemIds);

      const commentsMap: Record<string, number> = {};
      items.forEach(item => {
        commentsMap[item.id] = (commentsData || []).filter(c => c.item_id === item.id).length;
      });
      setCommentCounts(commentsMap);
    };

    fetchCounts();
  }, [items, user]);

  return { likeCounts, commentCounts };
};
