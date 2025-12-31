import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  ChevronRight,
} from "lucide-react";
import CreateClubModal from "@/components/CreateClubModal";
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
  type: "event" | "club" | "announcement";
  data: Event | Club;
  timestamp: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");

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
      // Fetch user's club memberships
      const { data: memberships } = await supabase
        .from("club_memberships")
        .select("club_id")
        .eq("user_id", user.id);

      const memberClubIds = memberships?.map((m) => m.club_id) || [];

      // Fetch my clubs
      if (memberClubIds.length > 0) {
        const { data: clubsData } = await supabase
          .from("clubs")
          .select("*")
          .in("id", memberClubIds)
          .order("created_at", { ascending: false });

        setMyClubs(clubsData || []);
      }

      // Fetch all events with club info
      const { data: eventsData } = await supabase
        .from("events")
        .select("*, clubs(name, category)")
        .order("event_date", { ascending: true })
        .gte("event_date", new Date().toISOString());

      setUpcomingEvents(eventsData || []);

      // Fetch all clubs for discover
      const { data: allClubs } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      // Create feed items
      const feed: FeedItem[] = [];

      // Add recent events to feed
      eventsData?.forEach((event) => {
        feed.push({
          id: `event-${event.id}`,
          type: "event",
          data: event,
          timestamp: event.created_at,
        });
      });

      // Add recent clubs to feed
      allClubs?.forEach((club) => {
        feed.push({
          id: `club-${club.id}`,
          type: "club",
          data: club,
          timestamp: club.created_at,
        });
      });

      // Sort by timestamp
      feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setFeedItems(feed);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load feed.",
        variant: "destructive",
      });
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

      toast({
        title: "Joined!",
        description: "You're now a member of this club.",
      });

      fetchData();
    } catch (error) {
      console.error("Error joining club:", error);
      toast({
        title: "Error",
        description: "Failed to join club.",
        variant: "destructive",
      });
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

      toast({
        title: "RSVP confirmed!",
        description: "You're attending this event.",
      });

      fetchData();
    } catch (error) {
      console.error("Error RSVPing:", error);
      toast({
        title: "Error",
        description: "Failed to RSVP.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Clubly</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border p-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Clubly</span>
          </div>

          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab("feed")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "feed"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Home className="w-5 h-5" />
              Feed
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "discover"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Search className="w-5 h-5" />
              Discover
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </nav>

          <div className="pt-4 border-t border-border space-y-2">
            <Button
              className="w-full justify-start"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-2xl mx-auto">
            {/* My Clubs Horizontal Scroll */}
            {myClubs.length > 0 && (
              <div className="border-b border-border py-4">
                <div className="px-4 mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-foreground">My Clubs</h2>
                  <button className="text-xs text-primary font-medium">See all</button>
                </div>
                <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
                  {/* Create Club Card */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">Create</span>
                  </button>

                  {myClubs.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => navigate(`/club/${club.id}`)}
                      className="flex-shrink-0 flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center ring-2 ring-primary ring-offset-2 ring-offset-background">
                        <span className="text-lg font-bold text-primary-foreground">
                          {club.name[0]}
                        </span>
                      </div>
                      <span className="text-xs text-foreground max-w-[64px] truncate">
                        {club.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events Horizontal Scroll */}
            {upcomingEvents.length > 0 && (
              <div className="border-b border-border py-4">
                <div className="px-4 mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-foreground">Upcoming Events</h2>
                  <button className="text-xs text-primary font-medium">See all</button>
                </div>
                <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex-shrink-0 w-64 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/club/${event.club_id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground">
                          <span className="text-[8px] font-medium uppercase leading-none">
                            {format(new Date(event.event_date), "MMM")}
                          </span>
                          <span className="text-sm font-bold leading-none">
                            {format(new Date(event.event_date), "d")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {event.clubs?.name}
                          </p>
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(event.event_date), "h:mm a")}
                        <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          event.event_type === "online"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {event.event_type === "online" ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                          {event.event_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feed */}
            <div className="py-4">
              <div className="px-4 mb-4">
                <h2 className="font-display text-sm font-semibold text-foreground">Activity Feed</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : feedItems.length === 0 ? (
                <div className="px-4 py-20 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground mb-4">Create or join a club to see activity</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Club
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 px-4">
                  {feedItems.map((item) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      onJoinClub={handleJoinClub}
                      onRsvp={handleRsvp}
                      onNavigate={navigate}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Suggestions */}
        <aside className="hidden lg:block w-80 h-screen sticky top-0 p-4 border-l border-border">
          <div className="mb-6">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Suggested Clubs</h3>
            <div className="space-y-3">
              {feedItems
                .filter((item) => item.type === "club")
                .slice(0, 4)
                .map((item) => {
                  const club = item.data as Club;
                  return (
                    <div
                      key={club.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/club/${club.id}`)}
                    >
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {club.name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{club.name}</p>
                        <p className="text-xs text-muted-foreground">{club.member_count} members</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
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
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "feed" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Feed</span>
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "discover" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px]">Discover</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center -mt-4">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
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
    </div>
  );
};

interface FeedCardProps {
  item: FeedItem;
  onJoinClub: (clubId: string) => void;
  onRsvp: (eventId: string) => void;
  onNavigate: (path: string) => void;
  currentUserId?: string;
}

const FeedCard = ({ item, onJoinClub, onRsvp, onNavigate, currentUserId }: FeedCardProps) => {
  if (item.type === "event") {
    const event = item.data as Event;
    const eventDate = new Date(event.event_date);

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{event.clubs?.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
          )}
          
          {/* Event Details Card */}
          <div className="bg-muted rounded-xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground">
                <span className="text-[10px] font-medium uppercase leading-none">
                  {format(eventDate, "MMM")}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(eventDate, "d")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {format(eventDate, "EEEE")} at {format(eventDate, "h:mm a")}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {event.event_type === "online" ? (
                    <>
                      <Video className="w-3 h-3" />
                      <span>Online Event</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3" />
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

        {/* Actions */}
        <div className="flex items-center gap-1 px-4 pb-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="w-4 h-4 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageCircle className="w-4 h-4 mr-1" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    );
  }

  if (item.type === "club") {
    const club = item.data as Club;

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">{club.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">New Club</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
            {club.category}
          </span>
        </div>

        {/* Content */}
        <div
          className="px-4 pb-4 cursor-pointer"
          onClick={() => onNavigate(`/club/${club.id}`)}
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">{club.name}</h3>
          {club.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{club.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{club.member_count}</span> members
            </span>
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              onJoinClub(club.id);
            }}>
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
