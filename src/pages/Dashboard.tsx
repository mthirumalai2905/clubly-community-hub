import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Calendar,
  LogOut,
  Home,
  Search,
  Bell,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Video,
  MapPin,
  Clock,
  Loader2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Settings,
} from "lucide-react";
import CreateClubModal from "@/components/CreateClubModal";
import ProfileModal from "@/components/ProfileModal";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_by: string;
  created_at: string;
}

interface Event {
  id: string;
  club_id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  meeting_link: string;
  event_date: string;
  max_attendees: number;
  created_by: string;
  created_at: string;
  clubs?: {
    name: string;
    category: string;
  };
}

interface FeedItem {
  id: string;
  type: "event" | "club";
  data: Event | Club;
  timestamp: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: memberships } = await supabase
        .from("club_memberships")
        .select("club_id")
        .eq("user_id", user.id);

      const memberClubIds = memberships?.map((m) => m.club_id) || [];

      if (memberClubIds.length > 0) {
        const { data: clubsData } = await supabase
          .from("clubs")
          .select("*")
          .in("id", memberClubIds)
          .order("created_at", { ascending: false });

        setMyClubs(clubsData || []);
      }

      const { data: eventsData } = await supabase
        .from("events")
        .select("*, clubs(name, category)")
        .order("event_date", { ascending: true })
        .gte("event_date", new Date().toISOString());

      setUpcomingEvents(eventsData || []);

      const { data: allClubs } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const feed: FeedItem[] = [];

      eventsData?.forEach((event) => {
        feed.push({
          id: `event-${event.id}`,
          type: "event",
          data: event,
          timestamp: event.created_at,
        });
      });

      allClubs?.forEach((club) => {
        feed.push({
          id: `club-${club.id}`,
          type: "club",
          data: club,
          timestamp: club.created_at,
        });
      });

      feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setFeedItems(feed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("club_memberships").insert({
        club_id: clubId,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;

      // Record activity for heatmap
      await supabase.rpc("record_user_activity");

      toast({
        title: "🎉 Welcome to the club!",
        description: "You're now a member.",
      });

      fetchData();
    } catch (error) {
      console.error("Error joining club:", error);
    }
  };

  const handleRsvp = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: eventId,
        user_id: user.id,
        status: "attending",
      });

      if (error) throw error;

      // Record activity for heatmap
      await supabase.rpc("record_user_activity");

      toast({
        title: "✅ You're in!",
        description: "See you at the event.",
      });

      fetchData();
    } catch (error) {
      console.error("Error RSVPing:", error);
    }
  };

  const toggleLike = (itemId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse-ring">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Clubly
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <AvatarDisplay
              avatarUrl={profile?.avatar_url || null}
              username={profile?.username}
              size="sm"
              onClick={() => setShowProfileModal(true)}
            />
          </div>
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
              active={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
            />
            <NavButton
              icon={Search}
              label="Discover"
              active={activeTab === "discover"}
              onClick={() => setActiveTab("discover")}
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
              onClick={() => setShowCreateModal(true)}
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
          <div className="max-w-2xl mx-auto">
            {/* Stories / My Clubs */}
            <div className="py-5 border-b border-border/50">
              <div className="px-4 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4">
                  {/* Create Club Story */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div className="relative">
                      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Create
                    </span>
                  </button>

                  {myClubs.map((club, index) => (
                    <button
                      key={club.id}
                      onClick={() => navigate(`/club/${club.id}`)}
                      className="flex-shrink-0 flex flex-col items-center gap-2 group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative">
                        <div className="absolute -inset-0.5 ring-gradient rounded-full p-[2px]">
                          <div className="w-[72px] h-[72px] rounded-full bg-background" />
                        </div>
                        <div className="relative w-[72px] h-[72px] rounded-full bg-gradient-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                          <span className="text-xl font-bold text-primary-foreground">
                            {club.name[0]}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-foreground max-w-[72px] truncate">
                        {club.name}
                      </span>
                    </button>
                  ))}

                  {myClubs.length === 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-2xl ml-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Join or create clubs to see them here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events Carousel */}
            {upcomingEvents.length > 0 && (
              <div className="py-5 border-b border-border/50">
                <div className="px-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-display text-base font-semibold text-foreground">
                      Upcoming Events
                    </h2>
                  </div>
                  <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    See all
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-4 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2">
                    {upcomingEvents.slice(0, 5).map((event, index) => (
                      <div
                        key={event.id}
                        className="flex-shrink-0 w-72 p-4 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer interactive-card animate-slide-up opacity-0"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => navigate(`/club/${event.club_id}`)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-14 h-14 bg-gradient-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground shadow-sm">
                            <span className="text-[10px] font-semibold uppercase leading-none opacity-90">
                              {format(new Date(event.event_date), "MMM")}
                            </span>
                            <span className="text-xl font-bold leading-none mt-0.5">
                              {format(new Date(event.event_date), "d")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">
                              {event.clubs?.name}
                            </p>
                            <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(event.event_date), "h:mm a")}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                              event.event_type === "online"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {event.event_type === "online" ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <MapPin className="w-3 h-3" />
                            )}
                            {event.event_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feed */}
            <div className="py-5">
              <div className="px-4 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Activity Feed
                  </h2>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 px-4">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : feedItems.length === 0 ? (
                <EmptyState onCreateClub={() => setShowCreateModal(true)} />
              ) : (
                <div className="space-y-4 px-4">
                  {feedItems.map((item, index) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      index={index}
                      onJoinClub={handleJoinClub}
                      onRsvp={handleRsvp}
                      onNavigate={navigate}
                      isLiked={likedItems.has(item.id)}
                      onToggleLike={() => toggleLike(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-80 h-screen sticky top-0 p-5 border-l border-border/50 bg-background">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Trending Clubs
              </h3>
              <button className="text-xs text-primary font-medium">See all</button>
            </div>
            <div className="space-y-2">
              {feedItems
                .filter((item) => item.type === "club")
                .slice(0, 4)
                .map((item, index) => {
                  const club = item.data as Club;
                  return (
                    <div
                      key={club.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 cursor-pointer group animate-slide-up opacity-0"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/club/${club.id}`)}
                    >
                      <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-sm font-bold text-primary-foreground">
                          {club.name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {club.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {club.member_count} members
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClub(club.id);
                        }}
                      >
                        Join
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10">
            <h4 className="font-display text-sm font-semibold text-foreground mb-3">
              Your Activity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-background rounded-xl">
                <p className="text-2xl font-bold text-primary">{myClubs.length}</p>
                <p className="text-xs text-muted-foreground">Clubs</p>
              </div>
              <div className="text-center p-3 bg-background rounded-xl">
                <p className="text-2xl font-bold text-primary">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 md:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          <MobileNavButton
            icon={Home}
            label="Feed"
            active={activeTab === "feed"}
            onClick={() => setActiveTab("feed")}
          />
          <MobileNavButton
            icon={Search}
            label="Discover"
            active={activeTab === "discover"}
            onClick={() => setActiveTab("discover")}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="relative -mt-6"
          >
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
          </button>
          <MobileNavButton
            icon={Bell}
            label="Alerts"
            badge={3}
          />
          <MobileNavButton
            icon={Users}
            label="Profile"
            onClick={() => setShowProfileModal(true)}
          />
        </div>
      </nav>

      <CreateClubModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchData();
        }}
      />
      
      <ProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />
    </div>
  );
};

// Components

const NavButton = ({
  icon: Icon,
  label,
  active,
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const MobileNavButton = ({
  icon: Icon,
  label,
  active,
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
    className={`flex flex-col items-center gap-1 py-2 px-4 ${
      active ? "text-primary" : "text-muted-foreground"
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
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const SkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border/50 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 bg-muted rounded-xl" />
      <div className="flex-1">
        <div className="h-4 bg-muted rounded w-32 mb-2" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    </div>
    <div className="h-4 bg-muted rounded w-full mb-2" />
    <div className="h-4 bg-muted rounded w-3/4" />
  </div>
);

const EmptyState = ({ onCreateClub }: { onCreateClub: () => void }) => (
  <div className="px-4 py-16 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
      <Sparkles className="w-10 h-10 text-primary" />
    </div>
    <h3 className="font-display text-xl font-bold text-foreground mb-2">
      Your feed is empty
    </h3>
    <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
      Create or join clubs to see activity from your communities
    </p>
    <Button variant="gradient" onClick={onCreateClub}>
      <Plus className="w-4 h-4" />
      Create Your First Club
    </Button>
  </div>
);

interface FeedCardProps {
  item: FeedItem;
  index: number;
  onJoinClub: (clubId: string) => void;
  onRsvp: (eventId: string) => void;
  onNavigate: (path: string) => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

const FeedCard = ({
  item,
  index,
  onJoinClub,
  onRsvp,
  onNavigate,
  isLiked,
  onToggleLike,
}: FeedCardProps) => {
  if (item.type === "event") {
    const event = item.data as Event;
    const eventDate = new Date(event.event_date);

    return (
      <div
        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-slide-up opacity-0"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{event.clubs?.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-4 pb-4">
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground shadow-sm">
                <span className="text-[10px] font-semibold uppercase opacity-90">
                  {format(eventDate, "MMM")}
                </span>
                <span className="text-xl font-bold">{format(eventDate, "d")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {format(eventDate, "EEEE")} at {format(eventDate, "h:mm a")}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {event.event_type === "online" ? (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Online Event</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
              </div>
              <Button size="sm" onClick={() => onRsvp(event.id)}>
                RSVP
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-4 border-t border-border/50 pt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            onClick={onToggleLike}
          >
            <Heart className={`w-4 h-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto">
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        </div>
      </div>
    );
  }

  if (item.type === "club") {
    const club = item.data as Club;

    return (
      <div
        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-slide-up opacity-0 cursor-pointer group"
        style={{ animationDelay: `${index * 0.08}s` }}
        onClick={() => onNavigate(`/club/${club.id}`)}
      >
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-sm font-bold text-primary-foreground">{club.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">New Club Created</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
            {club.category}
          </span>
        </div>

        <div className="px-4 pb-4">
          <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          {club.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {club.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-semibold text-foreground">{club.member_count}</span> members
              </span>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onJoinClub(club.id);
              }}
            >
              Join Club
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
