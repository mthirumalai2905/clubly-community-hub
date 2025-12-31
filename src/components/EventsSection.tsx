import { Calendar, Clock, MapPin, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    title: "Startup Pitch Night",
    club: "Tech Founders Hub",
    date: "Jan 15, 2025",
    time: "6:00 PM",
    type: "online",
    attendees: 48,
    spots: 50,
  },
  {
    title: "Morning Trail Run",
    club: "Morning Run Crew",
    date: "Jan 12, 2025",
    time: "5:30 AM",
    type: "offline",
    location: "Central Park",
    attendees: 23,
    spots: 30,
  },
  {
    title: "Design Systems Workshop",
    club: "Design Systems",
    date: "Jan 18, 2025",
    time: "2:00 PM",
    type: "online",
    attendees: 67,
    spots: 100,
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Upcoming events
          </h2>
          <p className="text-lg text-muted-foreground">
            Real-time events that bring communities together. Online or offline, every event creates meaningful connections.
          </p>
        </div>

        {/* Events List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {events.map((event, index) => (
            <div
              key={event.title}
              className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Date Badge */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-hero rounded-xl flex flex-col items-center justify-center text-primary-foreground shadow-soft">
                  <span className="text-xs font-medium uppercase">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="font-display text-xl font-bold">
                    {event.date.split(" ")[1].replace(",", "")}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">{event.club}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      event.type === "online" 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-primary/10 text-primary"
                    }`}>
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
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendees}/{event.spots} attending
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Button variant="default" size="sm" className="flex-shrink-0">
                  RSVP
                </Button>
              </div>

              {/* Progress bar for spots */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Spots filling up</span>
                  <span>{Math.round((event.attendees / event.spots) * 100)}% full</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-hero rounded-full transition-all duration-500"
                    style={{ width: `${(event.attendees / event.spots) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="heroOutline" size="lg">
            <Calendar className="w-5 h-5 mr-2" />
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
