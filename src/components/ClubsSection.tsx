import { Users, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const clubs = [
  {
    name: "Tech Founders Hub",
    category: "Startup",
    members: 342,
    description: "Weekly meetups for founders building the future",
    gradient: "from-primary to-accent",
    upcoming: 3,
  },
  {
    name: "Campus Book Club",
    category: "Education",
    members: 128,
    description: "Monthly reads and thoughtful discussions",
    gradient: "from-secondary-foreground to-primary",
    upcoming: 2,
  },
  {
    name: "Morning Run Crew",
    category: "Fitness",
    members: 89,
    description: "5AM runs to start the day right",
    gradient: "from-accent to-primary",
    upcoming: 5,
  },
  {
    name: "Design Systems",
    category: "Tech",
    members: 267,
    description: "Crafting consistent, scalable design systems",
    gradient: "from-primary to-secondary-foreground",
    upcoming: 1,
  },
];

const ClubsSection = () => {
  return (
    <section id="clubs" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Discover active clubs
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join communities that match your interests. Every club is built around shared passions and real interactions.
            </p>
          </div>
          <Button variant="heroOutline" className="self-start md:self-auto">
            View All Clubs
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((club, index) => (
            <div
              key={club.name}
              className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer opacity-0 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${club.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full mb-3">
                      {club.category}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {club.name}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${club.gradient} flex items-center justify-center shadow-soft`}>
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {club.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{club.members}</span> members
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">{club.upcoming}</span> upcoming events
                    </span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;
