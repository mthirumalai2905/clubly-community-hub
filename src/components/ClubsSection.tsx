import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Import club images
import techFoundersImg from "@/assets/clubs/tech-founders.jpg";
import bookClubImg from "@/assets/clubs/book-club.jpg";
import morningRunImg from "@/assets/clubs/morning-run.jpg";
import designSystemsImg from "@/assets/clubs/design-systems.jpg";

const clubs = [
  {
    name: "Tech Founders Hub",
    category: "Startup",
    members: 342,
    description: "Weekly meetups for founders building the future",
    events: 3,
    image: techFoundersImg,
    color: "from-orange-500/80 to-orange-600/80",
  },
  {
    name: "Campus Book Club",
    category: "Education",
    members: 128,
    description: "Monthly reads and thoughtful discussions",
    events: 2,
    image: bookClubImg,
    color: "from-blue-500/80 to-blue-600/80",
  },
  {
    name: "Morning Run Crew",
    category: "Fitness",
    members: 89,
    description: "5AM runs to start the day right",
    events: 5,
    image: morningRunImg,
    color: "from-green-500/80 to-green-600/80",
  },
  {
    name: "Design Systems",
    category: "Tech",
    members: 267,
    description: "Crafting consistent, scalable design systems",
    events: 1,
    image: designSystemsImg,
    color: "from-purple-500/80 to-purple-600/80",
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
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer h-48"
            >
              {/* Background Image */}
              <img
                src={club.image}
                alt={club.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${club.color} opacity-70 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="relative h-full p-5 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {club.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl mb-1 group-hover:text-white transition-colors">
                  {club.name}
                </h3>
                <p className="text-sm text-white/80 mb-3 line-clamp-1">
                  {club.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {club.members} members
                  </span>
                  <span>
                    <span className="text-white font-medium">{club.events}</span> upcoming events
                  </span>
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