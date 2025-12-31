import { Users, Calendar, MessageCircle, Rss, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Club-First Design",
    description: "Create and join interest-based clubs. Build your community around shared passions.",
  },
  {
    icon: Calendar,
    title: "Event-Driven",
    description: "Host online or offline events with date, time, RSVPs, and meeting links.",
  },
  {
    icon: MessageCircle,
    title: "Live Chat Rooms",
    description: "Event-based chat rooms for real-time discussions during and after events.",
  },
  {
    icon: Rss,
    title: "Purposeful Feed",
    description: "A structured feed of club announcements and events. Quality over quantity.",
  },
  {
    icon: Shield,
    title: "No Ads, Ever",
    description: "We build communities, not ad platforms. No sponsored content, no data harvesting.",
  },
  {
    icon: Zap,
    title: "Fast & Scalable",
    description: "Low latency real-time features. Built to scale for growing communities.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="w-full px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for real communities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Every feature is designed with intention. No addictive patterns—just tools that help people connect.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
