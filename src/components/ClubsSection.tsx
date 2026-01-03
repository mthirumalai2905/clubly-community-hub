import { Users, ArrowRight, Sparkles } from "lucide-react";
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
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Campus Book Club",
    category: "Education",
    members: 128,
    description: "Monthly reads and thoughtful discussions",
    events: 2,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Morning Run Crew",
    category: "Fitness",
    members: 89,
    description: "5AM runs to start the day right",
    events: 5,
    gradient: "from-green-500 to-teal-500",
  },
  {
    name: "Design Systems",
    category: "Tech",
    members: 267,
    description: "Crafting consistent, scalable design systems",
    events: 1,
    gradient: "from-purple-500 to-pink-500",
  },
];

const ClubsSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section id="clubs" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.05),transparent_50%)]" />
      
      <div ref={ref} className="relative w-full px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Discover
            </motion.span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Active <span className="text-gradient">clubs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join communities that match your interests. Every club is built around real interactions.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="self-start md:self-auto group"
              onClick={() => navigate("/auth")}
            >
              View All Clubs
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Clubs Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl"
        >
          {clubs.map((club) => (
            <motion.div
              key={club.name}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              onClick={() => navigate("/auth")}
              className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="inline-block px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                  >
                    {club.category}
                  </motion.span>
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={`w-12 h-12 bg-gradient-to-br ${club.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </motion.div>
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {club.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {club.description}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{club.members}</span> members
                  </span>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{club.events}</span> upcoming
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClubsSection;
