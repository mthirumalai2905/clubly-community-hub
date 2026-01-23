import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  friend_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, {
        messages: typeof messages;
        unread: number;
      }>();

      messages?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const existing = conversationMap.get(partnerId);
        
        if (!existing) {
          conversationMap.set(partnerId, {
            messages: [msg],
            unread: msg.receiver_id === user.id && !msg.read ? 1 : 0,
          });
        } else {
          existing.messages.push(msg);
          if (msg.receiver_id === user.id && !msg.read) {
            existing.unread++;
          }
        }
      });

      // Get profiles for all conversation partners
      const partnerIds = Array.from(conversationMap.keys());
      
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", partnerIds);

        const convos: Conversation[] = partnerIds.map(partnerId => {
          const data = conversationMap.get(partnerId)!;
          const profile = profiles?.find(p => p.user_id === partnerId);
          const lastMsg = data.messages[0];

          return {
            friend_id: partnerId,
            username: profile?.username || "Unknown",
            avatar_url: profile?.avatar_url || null,
            last_message: lastMsg.content,
            last_message_time: lastMsg.created_at,
            unread_count: data.unread,
          };
        });

        // Sort by last message time
        convos.sort((a, b) => 
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        );

        setConversations(convos);
        setTotalUnread(convos.reduce((sum, c) => sum + c.unread_count, 0));
      } else {
        setConversations([]);
        setTotalUnread(0);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getMessages = async (friendId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from("direct_messages")
        .update({ read: true })
        .eq("sender_id", friendId)
        .eq("receiver_id", user.id)
        .eq("read", false);

      return data || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) {
      console.error("sendMessage: User not authenticated");
      return { error: new Error("Not authenticated") };
    }

    console.log("Sending message to:", receiverId, "content:", content.substring(0, 20));

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      console.log("Message sent successfully:", data?.id);

      // Create notification (don't await - fire and forget)
      supabase
        .from("notifications")
        .insert({
          user_id: receiverId,
          type: "direct_message",
          title: "New Message",
          message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          data: { sender_id: user.id },
        })
        .then(({ error: notifError }) => {
          if (notifError) console.error("Notification error:", notifError);
        });

      // Record activity for sending a message (don't await)
      supabase.rpc("record_user_activity").then(({ error: actError }) => {
        if (actError) console.error("Activity recording error:", actError);
      });

      fetchConversations();
      return { error: null, data };
    } catch (error) {
      console.error("Error sending message:", error);
      return { error };
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    const channel = supabase
      .channel("direct-messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return {
    conversations,
    totalUnread,
    loading,
    getMessages,
    sendMessage,
    refetch: fetchConversations,
  };
};
