import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    bio: string | null;
  };
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile?: {
    username: string;
    avatar_url: string | null;
  };
  receiver_profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch friendships where user is either user_id or friend_id
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      // Get all friend IDs
      const friendIds = friendships?.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length > 0) {
        // Fetch profiles for all friends
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, bio")
          .in("user_id", friendIds);

        const friendsWithProfiles = friendships?.map(f => {
          const friendUserId = f.user_id === user.id ? f.friend_id : f.user_id;
          const profile = profiles?.find(p => p.user_id === friendUserId);
          return {
            ...f,
            profile: profile ? {
              username: profile.username,
              avatar_url: profile.avatar_url,
              bio: profile.bio,
            } : undefined,
          };
        }) || [];

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch pending requests received
      const { data: received, error: receivedError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (receivedError) throw receivedError;

      // Fetch pending requests sent
      const { data: sent, error: sentError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("sender_id", user.id)
        .eq("status", "pending");

      if (sentError) throw sentError;

      // Get sender profiles for received requests
      if (received && received.length > 0) {
        const senderIds = received.map(r => r.sender_id);
        const { data: senderProfiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", senderIds);

        const requestsWithProfiles = received.map(r => ({
          ...r,
          sender_profile: senderProfiles?.find(p => p.user_id === r.sender_id),
        }));
        setPendingRequests(requestsWithProfiles);
      } else {
        setPendingRequests([]);
      }

      // Get receiver profiles for sent requests
      if (sent && sent.length > 0) {
        const receiverIds = sent.map(r => r.receiver_id);
        const { data: receiverProfiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", receiverIds);

        const sentWithProfiles = sent.map(r => ({
          ...r,
          receiver_profile: receiverProfiles?.find(p => p.user_id === r.receiver_id),
        }));
        setSentRequests(sentWithProfiles);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [user]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // Check if already friends
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already friends",
          description: "You are already friends with this user.",
          variant: "destructive",
        });
        return { error: new Error("Already friends") };
      }

      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from("friend_requests")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .eq("status", "pending")
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: "Request pending",
          description: "A friend request already exists.",
          variant: "destructive",
        });
        return { error: new Error("Request already exists") };
      }

      // Create friend request
      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
        });

      if (error) throw error;

      // Create notification for receiver
      await supabase
        .from("notifications")
        .insert({
          user_id: receiverId,
          type: "friend_request",
          title: "New Friend Request",
          message: "Someone wants to be your friend!",
          data: { sender_id: user.id },
        });

      toast({
        title: "Request sent! 🤝",
        description: "Friend request sent successfully.",
      });

      fetchRequests();
      return { error: null };
    } catch (error) {
      console.error("Error sending friend request:", error);
      return { error };
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return;

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create friendship (both directions for easier querying)
      const { error: friendshipError1 } = await supabase
        .from("friendships")
        .insert({
          user_id: user.id,
          friend_id: senderId,
        });

      if (friendshipError1) throw friendshipError1;

      const { error: friendshipError2 } = await supabase
        .from("friendships")
        .insert({
          user_id: senderId,
          friend_id: user.id,
        });

      if (friendshipError2) throw friendshipError2;

      // Create notification for sender
      await supabase
        .from("notifications")
        .insert({
          user_id: senderId,
          type: "friend_accepted",
          title: "Friend Request Accepted! 🎉",
          message: "Your friend request was accepted!",
          data: { user_id: user.id },
        });

      toast({
        title: "Friend added! 🎉",
        description: "You are now friends.",
      });

      fetchFriends();
      fetchRequests();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request declined",
        description: "Friend request was declined.",
      });

      fetchRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    try {
      // Delete both friendship records
      await supabase
        .from("friendships")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      toast({
        title: "Friend removed",
        description: "Friend has been removed.",
      });

      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request cancelled",
        description: "Friend request was cancelled.",
      });

      fetchRequests();
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  const getFriendshipStatus = async (userId: string) => {
    if (!user) return null;

    // Check if friends
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
      .maybeSingle();

    if (friendship) return "friends";

    // Check for pending request
    const { data: request } = await supabase
      .from("friend_requests")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .eq("status", "pending")
      .maybeSingle();

    if (request) {
      return request.sender_id === user.id ? "request_sent" : "request_received";
    }

    return null;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchFriends(), fetchRequests()]).finally(() => setLoading(false));
    }
  }, [user, fetchFriends, fetchRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    refetch: () => {
      fetchFriends();
      fetchRequests();
    },
  };
};
