import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const clubs = [
  {
    name: "Tech Founders Hub",
    category: "Startup",
    members: 342,
    description: "Weekly meetups for founders building the future",
    events: 3,
  },
  {
    name: "Campus Book Club",
    category: "Education",
    members: 128,
    description: "Monthly reads and thoughtful discussions",
    events: 2,
  },
  {
    name: "Morning Run Crew",
    category: "Fitness",
    members: 89,
    description: "5AM runs to start the day right",
    events: 5,
  },
  {
    name: "Design Systems",
    category: "Tech",
    members: 267,
    description: "Crafting consistent, scalable design systems",
    events: 1,
  },
];

const ClubsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="clubs" className="py-20 bg-muted/50">
      <div className="w-full px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              Discover
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Active clubs
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join communities that match your interests. Every club is built around real interactions.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="self-start md:self-auto"
            onClick={() => navigate("/auth")}
          >
            View All Clubs
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <div
              key={club.name}
              className="group p-5 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/auth")}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                  {club.category}
                </span>
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {club.description}
              </p>

              <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{club.members}</span> members
                </span>
                <span>
                  <span className="font-semibold text-primary">{club.events}</span> upcoming
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;
