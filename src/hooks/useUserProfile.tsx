import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  username_last_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  eventsCreatedCount: number;
  eventsJoinedCount: number;
  clubsJoinedCount: number;
}

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    followersCount: 0,
    followingCount: 0,
    eventsCreatedCount: 0,
    eventsJoinedCount: 0,
    clubsJoinedCount: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchStats();
      if (user && !isOwnProfile) {
        checkFollowStatus();
      }
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [targetUserId, user]);

  const fetchProfile = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!targetUserId) return;

    try {
      // Fetch followers count
      const { count: followersCount } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);

      // Fetch following count
      const { count: followingCount } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);

      // Fetch events created count
      const { count: eventsCreatedCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("created_by", targetUserId);

      // Fetch events joined count (RSVPs)
      const { count: eventsJoinedCount } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      // Fetch clubs joined count
      const { count: clubsJoinedCount } = await supabase
        .from("club_memberships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      setStats({
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        eventsCreatedCount: eventsCreatedCount || 0,
        eventsJoinedCount: eventsJoinedCount || 0,
        clubsJoinedCount: clubsJoinedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !targetUserId || isOwnProfile) return;

    try {
      const { data } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();

      setIsFollowing(!!data);
    } catch {
      setIsFollowing(false);
    }
  };

  const toggleFollow = async () => {
    if (!user || !targetUserId || isOwnProfile) return { error: new Error("Cannot follow") };

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({ follower_id: user.id, following_id: targetUserId });

        if (error) throw error;
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
      return { error: null };
    } catch (error) {
      console.error("Error toggling follow:", error);
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, "bio" | "avatar_url" | "banner_url" | "username">>) => {
    if (!user || !isOwnProfile) return { error: new Error("Cannot update") };

    try {
      // Check username change rules
      if (updates.username && profile?.username !== updates.username) {
        const lastChanged = profile?.username_last_changed_at;
        const now = new Date();
        
        if (lastChanged) {
          const lastChangedDate = new Date(lastChanged);
          const daysSinceChange = Math.floor((now.getTime() - lastChangedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // First change after 30 days, subsequent changes after 1 year
          if (daysSinceChange < 30) {
            return { error: new Error(`Username can be changed after ${30 - daysSinceChange} days`) };
          }
          
          // After first change, must wait 1 year
          if (daysSinceChange < 365 && daysSinceChange >= 30) {
            return { error: new Error(`Username can be changed after ${365 - daysSinceChange} days`) };
          }
        }
        
        // Add the timestamp for username change
        (updates as any).username_last_changed_at = now.toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error as Error };
    }
  };

  const uploadBanner = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading banner:", error);
      return null;
    }
  };

  return {
    profile,
    stats,
    loading,
    isOwnProfile,
    isFollowing,
    fetchProfile,
    fetchStats,
    toggleFollow,
    updateProfile,
    uploadBanner,
  };
};

export default useUserProfile;
