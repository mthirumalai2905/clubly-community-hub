import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useActivityHeatmap } from "@/hooks/useActivityHeatmap";
import { Button } from "@/components/ui/button";
import {
  Users,
  Home,
  Search,
  Bell,
  MessageCircle,
  LogOut,
  Plus,
  Settings,
  ArrowLeft,
  Calendar,
  Loader2,
} from "lucide-react";
import { AvatarDisplay } from "@/components/AvatarPicker";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import EditProfileModal from "@/components/profile/EditProfileModal";
import CreateClubModal from "@/components/CreateClubModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UserEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
  clubs?: { name: string };
}

const Profile = () => {
  const { userId } = useParams();
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    profile,
    stats,
    loading: profileLoading,
    isOwnProfile,
    isFollowing,
    toggleFollow,
    updateProfile,
    uploadBanner,
  } = useUserProfile(userId);

  const { recordActivity } = useActivityHeatmap(profile?.user_id);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"events" | "clubs">("events");

  // Record activity on mount for own profile
  useEffect(() => {
    if (user && isOwnProfile) {
      recordActivity();
    }
  }, [user, isOwnProfile]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch user's events
  useEffect(() => {
    if (profile?.user_id) {
      fetchUserEvents();
    }
  }, [profile?.user_id]);

  const fetchUserEvents = async () => {
    if (!profile?.user_id) return;

    try {
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, event_type, clubs(name)")
        .eq("created_by", profile.user_id)
        .order("event_date", { ascending: false })
        .limit(10);

      setUserEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleToggleFollow = async () => {
    const { error } = await toggleFollow();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    }
  };

  const handleBannerUpdate = async (url: string) => {
    const { error } = await updateProfile({ banner_url: url });
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update banner.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✨ Banner updated!",
        description: "Looking great!",
      });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-ring">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-display text-lg font-bold">{profile.username}</span>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-background border-r border-border/50 p-5">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Clubly
            </span>
          </div>

          <nav className="flex-1 space-y-1.5">
            <NavButton
              icon={Home}
              label="Feed"
              onClick={() => navigate("/dashboard")}
            />
            <NavButton
              icon={Search}
              label="Discover"
              onClick={() => navigate("/dashboard")}
            />
            <NavButton
              icon={Bell}
              label="Notifications"
              badge={3}
            />
            <NavButton
              icon={MessageCircle}
              label="Messages"
            />
          </nav>

          {/* Profile Section */}
          <div className="pt-5 border-t border-border/50 space-y-4">
            <button
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="w-full flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <AvatarDisplay
                avatarUrl={profile?.avatar_url || null}
                username={profile?.username}
                size="md"
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {profile?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground">View profile</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <Button
              variant="gradient"
              className="w-full"
              onClick={() => setShowCreateClubModal(true)}
            >
              <Plus className="w-4 h-4" />
              Create Club
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto">
            {/* Profile Header */}
            <ProfileHeader
              profile={profile}
              stats={stats}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onEditProfile={() => setShowEditModal(true)}
              onToggleFollow={handleToggleFollow}
              onBannerUpload={uploadBanner}
              onBannerUpdate={handleBannerUpdate}
            />

            {/* Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-6">
              {/* Main Column - Activity & Events */}
              <div className="lg:col-span-2 space-y-4">
                {/* Activity Heatmap */}
                <ActivityHeatmap userId={profile.user_id} />

                {/* User's Events */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-2 p-4 border-b border-border/50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      Events Created
                    </h3>
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {userEvents.length}
                    </span>
                  </div>

                  {userEvents.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No events created yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {userEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/club/${event.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {event.clubs?.name} • {format(new Date(event.event_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-3 ${
                              event.event_type === "online"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {event.event_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Stats */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <ProfileStats stats={stats} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 md:hidden z-50">
        <div className="flex items-center justify-around h-16">
          <MobileNavButton icon={Home} onClick={() => navigate("/dashboard")} />
          <MobileNavButton icon={Search} onClick={() => navigate("/dashboard")} />
          <MobileNavButton icon={Plus} primary onClick={() => setShowCreateClubModal(true)} />
          <MobileNavButton icon={Bell} />
          <MobileNavButton
            icon={() => (
              <AvatarDisplay
                avatarUrl={profile?.avatar_url || null}
                username={profile?.username}
                size="sm"
              />
            )}
            active
            onClick={() => {}}
          />
        </div>
      </nav>

      {/* Modals */}
      <EditProfileModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        profile={profile}
        onUpdate={updateProfile}
      />

      <CreateClubModal
        open={showCreateClubModal}
        onClose={() => setShowCreateClubModal(false)}
        onSuccess={() => setShowCreateClubModal(false)}
      />
    </div>
  );
};

// Navigation Button Components
const NavButton = ({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? "bg-primary/10 text-primary font-semibold"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`}
  >
    <div className="relative">
      <Icon className="w-5 h-5" />
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
    <span className="text-sm">{label}</span>
  </button>
);

const MobileNavButton = ({
  icon: Icon,
  active = false,
  primary = false,
  onClick,
}: {
  icon: React.ElementType;
  active?: boolean;
  primary?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
      primary
        ? "bg-gradient-primary text-primary-foreground shadow-md"
        : active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    <Icon className="w-5 h-5" />
  </button>
);

export default Profile;
