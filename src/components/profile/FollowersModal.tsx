import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { MessageCircle, Loader2, UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface FollowUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: "followers" | "following";
  onMessageUser: (userId: string, username: string, avatarUrl: string | null) => void;
}

export const FollowersModal = ({
  open,
  onOpenChange,
  userId,
  initialTab = "followers",
  onMessageUser,
}: FollowersModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      fetchFollowData();
    }
  }, [open, userId, initialTab]);

  const fetchFollowData = async () => {
    setLoading(true);
    try {
      // Fetch followers (people who follow this user)
      const { data: followerData } = await supabase
        .from("user_follows")
        .select("follower_id")
        .eq("following_id", userId);

      const followerIds = followerData?.map((f) => f.follower_id) || [];

      // Fetch following (people this user follows)
      const { data: followingData } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId);

      const followingIds = followingData?.map((f) => f.following_id) || [];

      // Get profiles for followers
      if (followerIds.length > 0) {
        const { data: followerProfiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, bio")
          .in("user_id", followerIds);
        setFollowers(followerProfiles || []);
      } else {
        setFollowers([]);
      }

      // Get profiles for following
      if (followingIds.length > 0) {
        const { data: followingProfiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, bio")
          .in("user_id", followingIds);
        setFollowing(followingProfiles || []);
      } else {
        setFollowing([]);
      }

      // Check which users the current user is following
      if (user) {
        const allUserIds = [...new Set([...followerIds, ...followingIds])];
        if (allUserIds.length > 0) {
          const { data: myFollowing } = await supabase
            .from("user_follows")
            .select("following_id")
            .eq("follower_id", user.id)
            .in("following_id", allUserIds);

          const followingMap: Record<string, boolean> = {};
          myFollowing?.forEach((f) => {
            followingMap[f.following_id] = true;
          });
          setFollowingStatus(followingMap);
        }
      }
    } catch (error) {
      console.error("Error fetching follow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;

    setLoadingFollow(targetUserId);
    try {
      const isCurrentlyFollowing = followingStatus[targetUserId];

      if (isCurrentlyFollowing) {
        await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
      } else {
        await supabase.from("user_follows").insert({
          follower_id: user.id,
          following_id: targetUserId,
        });
      }

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing,
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollow(null);
    }
  };

  const handleMessage = (targetUser: FollowUser) => {
    onOpenChange(false);
    onMessageUser(targetUser.user_id, targetUser.username, targetUser.avatar_url);
  };

  const handleProfileClick = (targetUserId: string) => {
    onOpenChange(false);
    navigate(`/profile/${targetUserId}`);
  };

  const renderUserList = (users: FollowUser[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No users found</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border/50">
        {users.map((targetUser) => (
          <div
            key={targetUser.user_id}
            className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
          >
            <button
              onClick={() => handleProfileClick(targetUser.user_id)}
              className="flex-shrink-0"
            >
              <AvatarDisplay
                avatarUrl={targetUser.avatar_url}
                username={targetUser.username}
                size="md"
              />
            </button>

            <div className="flex-1 min-w-0">
              <button
                onClick={() => handleProfileClick(targetUser.user_id)}
                className="text-left"
              >
                <p className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
                  {targetUser.username}
                </p>
                {targetUser.bio && (
                  <p className="text-xs text-muted-foreground truncate">
                    {targetUser.bio}
                  </p>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {user && targetUser.user_id !== user.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMessage(targetUser)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={followingStatus[targetUser.user_id] ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleToggleFollow(targetUser.user_id)}
                    disabled={loadingFollow === targetUser.user_id}
                  >
                    {loadingFollow === targetUser.user_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : followingStatus[targetUser.user_id] ? (
                      <>
                        <UserMinus className="w-3 h-3 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "followers" | "following")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="followers" className="mt-0">
              {renderUserList(followers)}
            </TabsContent>
            <TabsContent value="following" className="mt-0">
              {renderUserList(following)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
