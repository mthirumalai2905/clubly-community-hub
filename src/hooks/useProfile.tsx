import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user || !profile) return { error: new Error("No user or profile") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: avatarUrl });
      return { error: null };
    } catch (error) {
      console.error("Error updating avatar:", error);
      return { error: error as Error };
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  return {
    profile,
    loading,
    fetchProfile,
    updateAvatar,
    uploadAvatar,
  };
};

export default useProfile;
