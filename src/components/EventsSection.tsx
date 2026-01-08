import { Calendar, Clock, MapPin, Video, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const events = [
  {
    title: "Startup Pitch Night",
    club: "Tech Founders Hub",
    date: "Jan 15",
    day: "15",
    month: "Jan",
    time: "6:00 PM",
    type: "online",
    attendees: 48,
    spots: 50,
  },
  {
    title: "Morning Trail Run",
    club: "Morning Run Crew",
    date: "Jan 12",
    day: "12",
    month: "Jan",
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
    day: "18",
    month: "Jan",
    time: "2:00 PM",
    type: "online",
    attendees: 67,
    spots: 100,
  },
];

const EventsSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="events" className="py-20 md:py-28 bg-background">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-12"
        >
          <p className="text-sm font-medium text-primary mb-3">Events</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            What's happening
            <br />
            <span className="text-muted-foreground">this week.</span>
          </h2>
        </motion.div>

        {/* Events List */}
        <div className="space-y-3 mb-10">
          {events.map((event, index) => {
            const fillPercentage = (event.attendees / event.spots) * 100;
            
            return (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-transparent hover:border-border transition-all duration-200"
              >
                {/* Date Badge */}
                <div className="flex-shrink-0 w-14 h-14 bg-foreground rounded-xl flex flex-col items-center justify-center text-background">
                  <span className="text-[10px] font-medium uppercase leading-none opacity-70">
                    {event.month}
                  </span>
                  <span className="font-display text-xl font-bold leading-none">
                    {event.day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-muted-foreground">{event.club}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      event.type === "online"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {event.type === "online" ? (
                        <>
                          <Video className="w-2.5 h-2.5" />
                          Online
                        </>
                      ) : (
                        <>
                          <MapPin className="w-2.5 h-2.5" />
                          In Person
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
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
                  {/* Progress Bar */}
                  <div className="hidden md:block w-20">
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${fillPercentage}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className={`h-full rounded-full ${
                          fillPercentage > 90
                            ? "bg-red-500"
                            : "bg-primary"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      {fillPercentage > 90 ? "Almost full" : `${Math.round(fillPercentage)}% full`}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    className="bg-foreground text-background hover:bg-foreground/90 text-xs h-8 px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/auth");
                    }}
                  >
                    RSVP
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            View all events
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
