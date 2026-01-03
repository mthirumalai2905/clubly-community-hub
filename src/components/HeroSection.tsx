import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageCircle, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const stats = [
    { icon: Users, value: "2,500+", label: "Active Members" },
    { icon: null, value: "150+", label: "Active Clubs" },
    { icon: Calendar, value: "500+", label: "Events Hosted" },
  ];

  const features = [
    {
      icon: Users,
      title: "Club-First Design",
      description: "Create interest-based clubs. Build communities around shared passions, not followers.",
    },
    {
      icon: Calendar,
      title: "Event-Driven",
      description: "Host online or offline events with ease. Real-time RSVPs and meeting links built in.",
    },
    {
      icon: MessageCircle,
      title: "Live Chat Rooms",
      description: "Event-based chat rooms for real-time discussions during and after your events.",
    },
  ];

  return (
    <section className="relative min-h-screen bg-foreground overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--foreground))_70%)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--background)/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Main Content */}
      <div className="relative pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              Where Real Communities Meet
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-[1.05] mb-8"
          >
            Build communities
            <br />
            <span className="text-gradient">that actually matter.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-background/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A club-first, event-driven platform for creating meaningful connections.
            No algorithms. No endless scrolling. Just real interactions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="gradient"
                className="h-14 px-8 text-base font-semibold shadow-glow group"
                onClick={() => navigate("/auth")}
              >
                Start Your Club
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-background/20 text-background hover:bg-background/10 hover:text-background group"
                onClick={() => navigate("/auth")}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {stat.icon && <stat.icon className="w-5 h-5 text-primary" />}
                  {!stat.icon && (
                    <div className="w-5 h-5 bg-gradient-primary rounded" />
                  )}
                  <span className="font-display text-3xl md:text-4xl font-bold text-background">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-background/50">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Cards Row */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative px-4 md:px-8 lg:px-12 pb-20"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-background/5 border border-background/10 rounded-2xl p-6 backdrop-blur-sm overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <motion.div
                  className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-5 shadow-glow"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <h3 className="font-display text-lg font-semibold text-background mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-background/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-background/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
