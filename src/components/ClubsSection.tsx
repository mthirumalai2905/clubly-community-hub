import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const clubs = [
  {
    name: "Tech Founders Hub",
    category: "Startup",
    members: 342,
    description: "Weekly meetups for founders building the future",
    events: 3,
    initial: "TF",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Campus Book Club",
    category: "Education",
    members: 128,
    description: "Monthly reads and thoughtful discussions",
    events: 2,
    initial: "BC",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Morning Run Crew",
    category: "Fitness",
    members: 89,
    description: "5AM runs to start the day right",
    events: 5,
    initial: "MR",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Design Systems",
    category: "Tech",
    members: 267,
    description: "Crafting consistent, scalable design systems",
    events: 1,
    initial: "DS",
    color: "bg-purple-100 text-purple-600",
  },
];

const ClubsSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="clubs" className="py-20 md:py-28 bg-muted/30">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary mb-3">Discover</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Communities you'll
              <br />
              <span className="text-muted-foreground">actually want to join.</span>
            </h2>
          </div>
          <Button
            variant="outline"
            className="self-start md:self-auto"
            onClick={() => navigate("/auth")}
          >
            View all clubs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club, index) => (
            <motion.div
              key={club.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => navigate("/auth")}
              className="group p-5 bg-background rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${club.color} flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                  {club.initial}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {club.name}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                      {club.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {club.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {club.members} members
                    </span>
                    <span>
                      <span className="text-primary font-medium">{club.events}</span> upcoming events
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;
