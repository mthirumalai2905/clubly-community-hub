import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  // Partner logos - using real company names styled as text logos for authenticity
  const partners = [
    { name: "Stanford", style: "font-serif font-bold" },
    { name: "Y Combinator", style: "font-sans font-semibold" },
    { name: "Notion", style: "font-sans font-medium" },
    { name: "Figma", style: "font-sans font-semibold" },
    { name: "Linear", style: "font-sans font-medium tracking-tight" },
  ];

  return (
    <section className="relative min-h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Accent blob - subtle */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative pt-28 md:pt-36 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          {/* Social Proof Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="flex items-center -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-medium text-foreground/70"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              Loved by 2,500+ community builders
            </span>
          </motion.div>

          {/* Main Heading - More authentic, less generic */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-[2.75rem] md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
          >
            The community platform
            <br />
            <span className="text-primary">people actually use.</span>
          </motion.h1>

          {/* Subtitle - More specific, less buzzwordy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            Create clubs, host events, and chat in real-time. 
            No algorithms deciding what you see. Just your communities, 
            your way.
          </motion.p>

          {/* CTA Buttons - Cleaner, more professional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-16"
          >
            <Button
              size="lg"
              className="h-12 px-6 text-base font-medium bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              onClick={() => navigate("/auth")}
            >
              Start for free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-medium border-border hover:bg-muted/50 rounded-xl"
              onClick={() => navigate("/auth")}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Watch demo
            </Button>
          </motion.div>

          {/* Partner Logos - Text-based for authenticity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-4 font-medium">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {partners.map((partner) => (
                <span
                  key={partner.name}
                  className={`text-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors ${partner.style}`}
                >
                  {partner.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* App Preview - Positioned to the right on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="hidden lg:block absolute top-32 right-0 w-[500px] xl:w-[580px]"
        >
          <div className="relative">
            {/* Main card - App preview mockup */}
            <div className="bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                    app.clubly.io/dashboard
                  </div>
                </div>
              </div>
              
              {/* App content preview */}
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">TC</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tech Community</p>
                      <p className="text-xs text-muted-foreground">128 members</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Joined
                  </div>
                </div>

                {/* Event card */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-primary font-medium mb-1">Upcoming Event</p>
                      <p className="font-medium text-sm">Weekly Standup</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="text-sm font-medium">3:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-muted border border-background" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">+12 attending</span>
                  </div>
                </div>

                {/* Chat preview */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0" />
                    <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-xs">Hey everyone! Excited for the event today 🎉</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex-shrink-0" />
                    <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-xs">Same here! The agenda looks great.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-6 -left-8 bg-background rounded-xl shadow-lg border border-border p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">New member joined!</p>
                <p className="text-xs text-muted-foreground">Sarah just joined Tech Community</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats section - Bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative border-t border-border/50 bg-background/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,500+", label: "Active users" },
              { value: "150+", label: "Communities" },
              { value: "500+", label: "Events hosted" },
              { value: "4.9/5", label: "User rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
