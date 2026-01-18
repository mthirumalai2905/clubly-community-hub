import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Edit2, Loader2, UserPlus, UserMinus, CalendarDays, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { UserProfile, UserStats } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStats;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onEditProfile: () => void;
  onToggleFollow: () => Promise<void>;
  onBannerUpload: (file: File) => Promise<string | null>;
  onBannerUpdate: (url: string) => Promise<void>;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
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
  onFollowersClick,
  onFollowingClick,
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
    <div className="bg-card border-b border-border/50">
      {/* Banner */}
      <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
        )}
        
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
              className="absolute bottom-3 right-3 gap-2 opacity-80 hover:opacity-100 transition-opacity text-xs"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
            >
              {isUploadingBanner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Edit Banner</span>
            </Button>
          </>
        )}
      </div>

      {/* Profile Content - Centered Layout like Peerlist */}
      <div className="px-4 md:px-6 pb-6">
        {/* Avatar - Overlapping Banner */}
        <div className="flex justify-center -mt-14 sm:-mt-16 md:-mt-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-background">
              <AvatarDisplay
                avatarUrl={profile.avatar_url}
                username={profile.username}
                size="lg"
                className="w-full h-full text-3xl md:text-4xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Username and Bio - Centered */}
        <div className="text-center mt-4">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-xl sm:text-2xl font-bold text-foreground"
          >
            {profile.username}
          </motion.h1>
          
          {profile.bio && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-muted-foreground mt-2 text-sm sm:text-base max-w-md mx-auto"
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Joined Date */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
          </motion.div>
        </div>

        {/* Stats Row - Centered */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-6 sm:gap-8 mt-5"
        >
          <StatItem value={stats.followersCount} label="Followers" onClick={onFollowersClick} />
          <div className="w-px h-8 bg-border/50" />
          <StatItem value={stats.followingCount} label="Following" onClick={onFollowingClick} />
          <div className="w-px h-8 bg-border/50" />
          <StatItem value={stats.eventsCreatedCount} label="Events" />
        </motion.div>

        {/* Action Button - Centered */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-5"
        >
          {isOwnProfile ? (
            <Button variant="outline" onClick={onEditProfile} className="gap-2 px-6">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "gradient"}
              onClick={handleFollowClick}
              disabled={isFollowLoading}
              className="gap-2 px-6"
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
        </motion.div>
      </div>
    </div>
  );
};

const StatItem = ({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`text-center ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
  >
    <div className="font-display text-lg sm:text-xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </button>
);

export default ProfileHeader;
