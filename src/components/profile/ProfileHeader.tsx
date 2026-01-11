import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Edit2, Loader2, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { UserProfile, UserStats } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStats;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onEditProfile: () => void;
  onToggleFollow: () => Promise<void>;
  onBannerUpload: (file: File) => Promise<string | null>;
  onBannerUpdate: (url: string) => Promise<void>;
}

export const ProfileHeader = ({
  profile,
  stats,
  isOwnProfile,
  isFollowing,
  onEditProfile,
  onToggleFollow,
  onBannerUpload,
  onBannerUpdate,
}: ProfileHeaderProps) => {
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const url = await onBannerUpload(file);
      if (url) {
        await onBannerUpdate(url);
      }
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleFollowClick = async () => {
    setIsFollowLoading(true);
    try {
      await onToggleFollow();
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-primary overflow-hidden">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary" />
        )}
        
        {/* Banner overlay for better avatar visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        
        {/* Edit banner button */}
        {isOwnProfile && (
          <>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 gap-2 opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
            >
              {isUploadingBanner ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Edit Banner
            </Button>
          </>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-4 md:px-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20 relative">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background shadow-lg overflow-hidden bg-background">
              <AvatarDisplay
                avatarUrl={profile.avatar_url}
                username={profile.username}
                size="lg"
                className="w-full h-full text-4xl"
              />
            </div>
          </motion.div>

          {/* Name and Actions */}
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="text-muted-foreground mt-1 max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button variant="outline" onClick={onEditProfile} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "outline" : "gradient"}
                  onClick={handleFollowClick}
                  disabled={isFollowLoading}
                  className="gap-2"
                >
                  {isFollowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-border/50">
          <StatItem value={stats.followersCount} label="Followers" />
          <StatItem value={stats.followingCount} label="Following" />
          <StatItem value={stats.eventsCreatedCount} label="Events Created" />
          <StatItem value={stats.clubsJoinedCount} label="Clubs" />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-baseline gap-1.5">
    <span className="font-display text-lg font-bold text-foreground">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export default ProfileHeader;
