import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  Loader2,
  Users,
  Calendar,
  Video,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  meeting_link: string;
  event_date: string;
  club_id: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface Profile {
  username: string;
  avatar_url: string | null;
}

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && eventId) {
      fetchEventData();
      setupRealtimeSubscription();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [user, eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchEventData = async () => {
    if (!user || !eventId) return;

    setLoading(true);
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) {
        navigate("/dashboard");
        return;
      }

      setEvent(eventData);

      const { data: rsvpData } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!rsvpData) {
        toast({
          title: "Access denied",
          description: "You need to RSVP to access this chat.",
          variant: "destructive",
        });
        navigate(`/club/${eventData.club_id}`);
        return;
      }

      setHasAccess(true);

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      const userIds = [...new Set(messagesData?.map((m) => m.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds);

        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach((p) => {
          profilesMap[p.user_id] = { username: p.username, avatar_url: p.avatar_url };
        });
        setProfiles(profilesMap);
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          if (!profiles[newMsg.user_id]) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("user_id, username, avatar_url")
              .eq("user_id", newMsg.user_id)
              .maybeSingle();

            if (profileData) {
              setProfiles((prev) => ({
                ...prev,
                [profileData.user_id]: {
                  username: profileData.username,
                  avatar_url: profileData.avatar_url,
                },
              }));
            }
          }

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eventId || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        event_id: eventId,
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !hasAccess) {
    return null;
  }

  const eventDate = new Date(event.event_date);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/club/${event.club_id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-base font-semibold text-foreground truncate">
                {event.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(eventDate, "MMM d, h:mm a")}
                </span>
                <span className="flex items-center gap-1">
                  {event.event_type === "online" ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  {event.event_type === "online" ? "Online" : event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-muted-foreground">Be the first to say hello!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.user_id === user?.id;
              const profile = profiles[message.user_id];

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                      isOwn
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {profile?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {profile?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "h:mm a")}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        isOwn
                          ? "bg-gradient-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border/50 text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4">
        <form
          onSubmit={sendMessage}
          className="container mx-auto max-w-2xl flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 h-12 bg-card border-border/50"
            maxLength={1000}
          />
          <Button
            type="submit"
            variant="gradient"
            size="icon"
            className="h-12 w-12"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EventChat;
