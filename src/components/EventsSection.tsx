import { Calendar, Clock, MapPin, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const events = [
  {
    title: "Startup Pitch Night",
    club: "Tech Founders Hub",
    date: "Jan 15",
    time: "6:00 PM",
    type: "online",
    attendees: 48,
    spots: 50,
  },
  {
    title: "Morning Trail Run",
    club: "Morning Run Crew",
    date: "Jan 12",
    time: "5:30 AM",
    type: "offline",
    location: "Central Park",
    attendees: 23,
    spots: 30,
  },
  {
    title: "Design Systems Workshop",
    club: "Design Systems",
    date: "Jan 18",
    time: "2:00 PM",
    type: "online",
    attendees: 67,
    spots: 100,
  },
];

const EventsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="events" className="py-20 bg-background">
      <div className="w-full px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            Events
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Upcoming events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real-time events that bring communities together. RSVP and join live discussions.
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-3 mb-12">
          {events.map((event) => (
            <div
              key={event.title}
              className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-200"
            >
              {/* Date Badge */}
              <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground">
                <span className="text-[10px] font-medium uppercase leading-none">
                  {event.date.split(" ")[0]}
                </span>
                <span className="font-display text-xl font-bold leading-none mt-0.5">
                  {event.date.split(" ")[1]}
                </span>
              </div>

              {/* Event Details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">{event.club}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      event.type === "online"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {event.type === "online" ? (
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
                <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.attendees}/{event.spots}
                  </span>
                </div>
              </div>

              {/* Progress & CTA */}
              <div className="flex items-center gap-4">
                <div className="hidden md:block w-24">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(event.attendees / event.spots) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {Math.round((event.attendees / event.spots) * 100)}% full
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  RSVP
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
            <Calendar className="w-4 h-4 mr-2" />
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
