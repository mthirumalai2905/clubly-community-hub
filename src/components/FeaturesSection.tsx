import { Users, Calendar, MessageCircle, Rss, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Club-First Design",
    description: "Create and join interest-based clubs. Build your community around shared passions, not followers.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Event-Driven",
    description: "Host online or offline events with ease. Real-time RSVPs, reminders, and meeting links built in.",
    color: "accent",
  },
  {
    icon: MessageCircle,
    title: "Live Chat Rooms",
    description: "Event-based chat rooms for real discussions. Connect with members during and after events.",
    color: "secondary",
  },
  {
    icon: Rss,
    title: "Purposeful Feed",
    description: "A structured feed of club announcements and events. Quality content, not algorithmic noise.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "No Ads, Ever",
    description: "We're here to build communities, not sell attention. No sponsored content, no data harvesting.",
    color: "accent",
  },
  {
    icon: Zap,
    title: "Instant & Fast",
    description: "Low latency real-time features. Built to scale for growing communities without compromising speed.",
    color: "secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for real communities
          </h2>
          <p className="text-lg text-muted-foreground">
            Every feature is designed with intention. No addictive patterns, no infinite scroll—just tools that help people connect.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  feature.color === "primary"
                    ? "bg-primary/10 text-primary"
                    : feature.color === "accent"
                    ? "bg-accent/10 text-accent"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
