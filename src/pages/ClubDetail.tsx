import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Users,
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  MessageCircle,
} from "lucide-react";
import CreateEventModal from "@/components/CreateEventModal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_by: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  meeting_link: string;
  event_date: string;
  max_attendees: number;
  created_by: string;
  attendee_count?: number;
  hasRsvp?: boolean;
}

const ClubDetail = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && clubId) {
      fetchClubData();
    }
  }, [user, clubId]);

  const fetchClubData = async () => {
    if (!user || !clubId) return;

    setLoading(true);
    try {
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .maybeSingle();

      if (clubError) throw clubError;
      if (!clubData) {
        navigate("/dashboard");
        return;
      }

      setClub(clubData);

      const { data: membershipData } = await supabase
        .from("club_memberships")
        .select("id")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsMember(!!membershipData);

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("club_id", clubId)
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;

      const eventsWithRsvps = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from("event_rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "attending");

          const { data: userRsvp } = await supabase
            .from("event_rsvps")
            .select("id")
            .eq("event_id", event.id)
            .eq("user_id", user.id)
            .maybeSingle();

          return {
            ...event,
            attendee_count: count || 0,
            hasRsvp: !!userRsvp,
          };
        })
      );

      setEvents(eventsWithRsvps);
    } catch (error) {
      console.error("Error fetching club data:", error);
      toast({
        title: "Error",
        description: "Failed to load club data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        title: "✅ RSVP confirmed!",
        description: "You're attending this event.",
      });

      fetchClubData();
    } catch (error) {
      console.error("Error RSVPing:", error);
      toast({
        title: "Error",
        description: "Failed to RSVP.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRsvp = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "RSVP cancelled",
        description: "You are no longer attending.",
      });

      fetchClubData();
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return null;
  }

  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {isMember && (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setShowCreateEventModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-card rounded-2xl border border-border/50 p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
              {club.category}
            </span>
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-primary-foreground">{club.name[0]}</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {club.name}
          </h1>
          <p className="text-muted-foreground mb-4">
            {club.description || "No description"}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{club.member_count} members</span>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No upcoming events
              </h3>
              <p className="text-muted-foreground mb-4">
                {isMember ? "Create an event!" : "No events scheduled."}
              </p>
              {isMember && (
                <Button variant="gradient" onClick={() => setShowCreateEventModal(true)}>
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRsvp={() => handleRsvp(event.id)}
                  onCancelRsvp={() => handleCancelRsvp(event.id)}
                  onEnterChat={() => navigate(`/event/${event.id}/chat`)}
                />
              ))}
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Past Events
            </h2>
            <div className="space-y-4 opacity-60">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast={true} />
              ))}
            </div>
          </section>
        )}
      </main>

      {clubId && (
        <CreateEventModal
          open={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onSuccess={() => {
            setShowCreateEventModal(false);
            fetchClubData();
          }}
          clubId={clubId}
        />
      )}
    </div>
  );
};

interface EventCardProps {
  event: Event;
  onRsvp?: () => void;
  onCancelRsvp?: () => void;
  onEnterChat?: () => void;
  isPast?: boolean;
}

const EventCard = ({
  event,
  onRsvp,
  onCancelRsvp,
  onEnterChat,
  isPast = false,
}: EventCardProps) => {
  const eventDate = new Date(event.event_date);

  return (
    <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground shadow-sm">
          <span className="text-xs font-semibold uppercase">
            {format(eventDate, "MMM")}
          </span>
          <span className="font-display text-xl font-bold">
            {format(eventDate, "d")}
          </span>
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                event.event_type === "online"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {event.event_type === "online" ? (
                <>
                  <Video className="w-3 h-3" />
                  Online
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  In Person
                </>
              )}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(eventDate, "h:mm a")}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.attendee_count || 0}
              {event.max_attendees && `/${event.max_attendees}`} attending
            </span>
          </div>
        </div>

        {!isPast && (
          <div className="flex items-center gap-2">
            {event.hasRsvp ? (
              <>
                <Button variant="outline" size="sm" onClick={onCancelRsvp}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onEnterChat}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={onRsvp}>
                RSVP
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
