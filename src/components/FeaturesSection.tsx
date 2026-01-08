import { Users, Calendar, MessageCircle, Rss, Shield, Zap, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Users,
    title: "Interest-based clubs",
    description: "Create spaces around topics you care about. Photography, coding, book clubs—you name it.",
    benefits: ["Unlimited clubs", "Custom branding", "Role management"],
  },
  {
    icon: Calendar,
    title: "Events that work",
    description: "Schedule online or in-person meetups. Built-in RSVPs, reminders, and calendar sync.",
    benefits: ["Google Calendar sync", "Auto reminders", "Waitlists"],
  },
  {
    icon: MessageCircle,
    title: "Real-time chat",
    description: "Event-based discussions that stay organized. No more scattered conversations.",
    benefits: ["Thread replies", "File sharing", "Reactions"],
  },
  {
    icon: Rss,
    title: "Activity feed",
    description: "See what's happening in your communities. Chronological, no algorithm.",
    benefits: ["Chronological order", "Smart filters", "Notifications"],
  },
  {
    icon: Shield,
    title: "Privacy first",
    description: "Your data stays yours. No ads, no tracking, no selling to third parties.",
    benefits: ["End-to-end encrypted", "GDPR compliant", "No ads ever"],
  },
  {
    icon: Zap,
    title: "Fast & reliable",
    description: "Built for speed. Real-time updates, instant notifications, zero lag.",
    benefits: ["99.9% uptime", "Global CDN", "<100ms latency"],
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div ref={ref} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Everything you need.
            <br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We obsess over what matters. Simple tools that help real communities thrive.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group p-6 bg-muted/30 hover:bg-muted/50 rounded-2xl border border-transparent hover:border-border transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-1.5">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
