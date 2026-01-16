import { useState } from "react";
import { UserMinus, MessageCircle, Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriends } from "@/hooks/useFriends";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useNavigate } from "react-router-dom";

interface FriendsListProps {
  onClose?: () => void;
  onStartChat?: (friendId: string) => void;
}

export const FriendsList = ({ onClose, onStartChat }: FriendsListProps) => {
  const navigate = useNavigate();
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    loading, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend,
    cancelFriendRequest 
  } = useFriends();
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, ...args: string[]) => {
    const actionId = args[0];
    setLoadingAction(actionId);
    try {
      switch (action) {
        case "accept":
          await acceptFriendRequest(args[0], args[1]);
          break;
        case "reject":
          await rejectFriendRequest(args[0]);
          break;
        case "remove":
          await removeFriend(args[0]);
          break;
        case "cancel":
          await cancelFriendRequest(args[0]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="friends" className="flex-1">
          Friends ({friends.length})
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex-1">
          Requests ({pendingRequests.length})
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex-1">
          Sent ({sentRequests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="mt-4">
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No friends yet</p>
              <p className="text-xs mt-1">Search for users to add friends</p>
            </div>
          ) : (
            friends.map((friend) => {
              const friendUserId = friend.profile ? 
                (friend.user_id === friend.friend_id ? friend.friend_id : 
                  (friend.profile.username ? friend.friend_id : friend.user_id)) 
                : friend.friend_id;

              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <button onClick={() => handleProfileClick(friendUserId)}>
                    <AvatarDisplay
                      avatarUrl={friend.profile?.avatar_url || null}
                      username={friend.profile?.username}
                      size="md"
                    />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleProfileClick(friendUserId)}
                      className="text-left"
                    >
                      <p className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
                        {friend.profile?.username || "Unknown"}
                      </p>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStartChat?.(friendUserId)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("remove", friendUserId)}
                      disabled={loadingAction === friendUserId}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {loadingAction === friendUserId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </TabsContent>

      <TabsContent value="requests" className="mt-4">
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <button onClick={() => handleProfileClick(request.sender_id)}>
                  <AvatarDisplay
                    avatarUrl={request.sender_profile?.avatar_url || null}
                    username={request.sender_profile?.username}
                    size="md"
                  />
                </button>
                
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleProfileClick(request.sender_id)}
                    className="text-left"
                  >
                    <p className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
                      {request.sender_profile?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wants to be your friend
                    </p>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction("accept", request.id, request.sender_id)}
                    disabled={loadingAction === request.id}
                  >
                    {loadingAction === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("reject", request.id)}
                    disabled={loadingAction === request.id}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="sent" className="mt-4">
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {sentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sent requests</p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <button onClick={() => handleProfileClick(request.receiver_id)}>
                  <AvatarDisplay
                    avatarUrl={request.receiver_profile?.avatar_url || null}
                    username={request.receiver_profile?.username}
                    size="md"
                  />
                </button>
                
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleProfileClick(request.receiver_id)}
                    className="text-left"
                  >
                    <p className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
                      {request.receiver_profile?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pending...
                    </p>
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction("cancel", request.id)}
                  disabled={loadingAction === request.id}
                >
                  {loadingAction === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span className="ml-1 text-xs">Cancel</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
