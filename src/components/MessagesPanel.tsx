import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDirectMessages, DirectMessage } from "@/hooks/useDirectMessages";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MessagesPanelProps {
  initialFriendId?: string;
  onClose?: () => void;
}

export const MessagesPanel = ({ initialFriendId, onClose }: MessagesPanelProps) => {
  const { user } = useAuth();
  const { conversations, totalUnread, getMessages, sendMessage, refetch } = useDirectMessages();
  
  const [selectedFriend, setSelectedFriend] = useState<{
    id: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initial friend selection
  useEffect(() => {
    const loadInitialFriend = async () => {
      if (initialFriendId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .eq("user_id", initialFriendId)
          .single();

        if (profile) {
          setSelectedFriend({
            id: profile.user_id,
            username: profile.username,
            avatar_url: profile.avatar_url,
          });
        }
      }
    };

    loadInitialFriend();
  }, [initialFriendId]);

  // Load messages when friend is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedFriend) return;
      
      setLoading(true);
      const msgs = await getMessages(selectedFriend.id);
      setMessages(msgs);
      setLoading(false);
    };

    loadMessages();
  }, [selectedFriend, getMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up realtime for messages
  useEffect(() => {
    if (!user || !selectedFriend) return;

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedFriend.id) ||
            (newMsg.sender_id === selectedFriend.id && newMsg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedFriend]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedFriend || sending) return;

    setSending(true);
    const { error } = await sendMessage(selectedFriend.id, newMessage.trim());
    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleSelectConversation = (conv: typeof conversations[0]) => {
    setSelectedFriend({
      id: conv.friend_id,
      username: conv.username,
      avatar_url: conv.avatar_url,
    });
  };

  // Conversation list view
  if (!selectedFriend) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground">Messages</h3>
          {totalUnread > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start chatting with friends!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.friend_id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/50 ${
                  conv.unread_count > 0 ? "bg-primary/5" : ""
                }`}
              >
                <AvatarDisplay
                  avatarUrl={conv.avatar_url}
                  username={conv.username}
                  size="md"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${conv.unread_count > 0 ? "font-semibold" : "font-medium"}`}>
                      {conv.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.last_message}
                  </p>
                </div>

                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex flex-col h-[450px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedFriend(null);
            refetch();
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <AvatarDisplay
          avatarUrl={selectedFriend.avatar_url}
          username={selectedFriend.username}
          size="sm"
        />
        <p className="font-medium text-sm">{selectedFriend.username}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                  msg.sender_id === user?.id
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border/50">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
