import { useState, useEffect } from "react";
import { Search, UserPlus, UserMinus, Clock, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface UserSearchProps {
  onClose?: () => void;
}

export const UserSearch = ({ onClose }: UserSearchProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, removeFriend, pendingRequests, sentRequests, friends } = useFriends();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, bio")
          .ilike("username", `%${query}%`)
          .neq("user_id", user?.id || "")
          .limit(10);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, user?.id]);

  const getStatus = (userId: string) => {
    // Check if already friends
    if (friends.some(f => 
      (f.user_id === user?.id && f.friend_id === userId) ||
      (f.friend_id === user?.id && f.user_id === userId)
    )) {
      return "friends";
    }

    // Check if request sent by me
    const sentRequest = sentRequests.find(r => r.receiver_id === userId);
    if (sentRequest) {
      return { type: "sent", request: sentRequest };
    }

    // Check if request received from them
    const receivedRequest = pendingRequests.find(r => r.sender_id === userId);
    if (receivedRequest) {
      return { type: "received", request: receivedRequest };
    }

    return null;
  };

  const handleAction = async (userId: string, action: string, requestId?: string) => {
    setLoadingAction(userId);
    try {
      switch (action) {
        case "add":
          await sendFriendRequest(userId);
          break;
        case "cancel":
          if (requestId) await cancelFriendRequest(requestId);
          break;
        case "accept":
          if (requestId) await acceptFriendRequest(requestId, userId);
          break;
        case "remove":
          await removeFriend(userId);
          break;
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose?.();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        )}

        {!loading && results.map((result) => {
          const status = getStatus(result.user_id);
          const isLoading = loadingAction === result.user_id;

          return (
            <div
              key={result.user_id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <button onClick={() => handleProfileClick(result.user_id)}>
                <AvatarDisplay
                  avatarUrl={result.avatar_url}
                  username={result.username}
                  size="md"
                />
              </button>
              
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleProfileClick(result.user_id)}
                  className="text-left"
                >
                  <p className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
                    {result.username}
                  </p>
                  {result.bio && (
                    <p className="text-xs text-muted-foreground truncate">
                      {result.bio}
                    </p>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {status === "friends" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(result.user_id, "remove")}
                    disabled={isLoading}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                  </Button>
                ) : status && typeof status === "object" && status.type === "sent" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(result.user_id, "cancel", status.request.id)}
                    disabled={isLoading}
                    className="text-muted-foreground"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    <span className="ml-1 text-xs">Pending</span>
                  </Button>
                ) : status && typeof status === "object" && status.type === "received" ? (
                  <div className="flex gap-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAction(result.user_id, "accept", status.request.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(status.request.id, "reject")}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(result.user_id, "add")}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {!loading && query.length < 2 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
};
