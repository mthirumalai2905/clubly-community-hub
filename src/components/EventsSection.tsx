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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section id="events" className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.03),transparent_50%)]" />
      
      <div ref={ref} className="relative w-full px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Calendar className="w-4 h-4" />
            Events
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Upcoming <span className="text-gradient">events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time events that bring communities together. RSVP and join live discussions.
          </p>
        </motion.div>

        {/* Events List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4 mb-12 max-w-4xl mx-auto"
        >
          {events.map((event, index) => {
            const fillPercentage = (event.attendees / event.spots) * 100;
            
            return (
              <motion.div
                key={event.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 8 }}
                className="group flex flex-col md:flex-row md:items-center gap-5 p-5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Date Badge */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0 w-16 h-16 bg-gradient-primary rounded-xl flex flex-col items-center justify-center text-primary-foreground shadow-lg"
                >
                  <span className="text-[10px] font-medium uppercase leading-none">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="font-display text-2xl font-bold leading-none mt-0.5">
                    {event.date.split(" ")[1]}
                  </span>
                </motion.div>

                {/* Event Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground font-medium">{event.club}</span>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                        event.type === "online"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-green-500/10 text-green-600"
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
                    </motion.span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {event.attendees}/{event.spots} joined
                    </span>
                  </div>
                </div>

                {/* Progress & CTA */}
                <div className="flex items-center gap-5">
                  {/* Progress Bar */}
                  <div className="hidden md:block w-24">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${fillPercentage}%` } : {}}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full ${
                          fillPercentage > 90
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-primary"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {fillPercentage > 90 ? "Almost full!" : `${Math.round(fillPercentage)}% full`}
                    </p>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="shadow-glow"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/auth");
                      }}
                    >
                      RSVP
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="group"
              onClick={() => navigate("/auth")}
            >
              View All Events
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
