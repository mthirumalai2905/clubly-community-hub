import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Calendar } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      </div>

      {/* Decorative geometric shapes */}
      <div className="absolute top-32 right-20 w-4 h-4 bg-primary rounded-full animate-pulse-soft hidden lg:block" />
      <div className="absolute top-48 left-32 w-3 h-3 bg-accent rounded-full animate-pulse-soft hidden lg:block" />
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-secondary-foreground/20 rounded-full animate-pulse-soft hidden lg:block" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in border border-border">
            <Sparkles className="w-4 h-4" />
            <span>Where real communities meet</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Build communities
            <br />
            <span className="text-gradient">that actually matter</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Clubly is a club-first, event-driven platform for creating meaningful connections. 
            No algorithms. No endless scrolling. Just real interactions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" className="group">
              Start Your Club
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Explore Clubs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">2.5k+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-5 h-5 bg-gradient-hero rounded mr-2" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">150+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Clubs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-accent mr-2" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">500+</span>
              </div>
              <p className="text-sm text-muted-foreground">Events Hosted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
