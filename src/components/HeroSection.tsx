import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-foreground pt-14">
      {/* Hero Content */}
      <div className="w-full px-4 md:px-8 lg:px-12 pt-16 md:pt-24 pb-16">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Where real communities meet
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-[1.1] mb-6">
            Build communities
            <br />
            <span className="text-primary">that actually matter.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-background/60 max-w-2xl mb-10 leading-relaxed">
            A club-first, event-driven platform for creating meaningful connections. 
            No algorithms. No endless scrolling. Just real interactions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-16">
            <Button 
              size="lg" 
              className="h-12 px-6 text-base font-semibold group"
              onClick={() => navigate("/auth")}
            >
              Start Your Club
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 px-6 text-base font-semibold border-background/20 text-background hover:bg-background/10 hover:text-background"
              onClick={() => navigate("/auth")}
            >
              Explore Clubs
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-display text-2xl md:text-3xl font-bold text-background">2,500+</span>
              </div>
              <p className="text-sm text-background/50">Active Members</p>
            </div>
            <div className="w-px h-10 bg-background/20 hidden md:block" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-primary rounded" />
                <span className="font-display text-2xl md:text-3xl font-bold text-background">150+</span>
              </div>
              <p className="text-sm text-background/50">Active Clubs</p>
            </div>
            <div className="w-px h-10 bg-background/20 hidden md:block" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-display text-2xl md:text-3xl font-bold text-background">500+</span>
              </div>
              <p className="text-sm text-background/50">Events Hosted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Row */}
      <div className="w-full px-4 md:px-8 lg:px-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/5 border border-background/10 rounded-2xl p-6 hover:bg-background/10 transition-colors">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-background mb-2">Club-First Design</h3>
            <p className="text-sm text-background/60 leading-relaxed">
              Create interest-based clubs. Build communities around shared passions, not followers.
            </p>
          </div>
          <div className="bg-background/5 border border-background/10 rounded-2xl p-6 hover:bg-background/10 transition-colors">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-background mb-2">Event-Driven</h3>
            <p className="text-sm text-background/60 leading-relaxed">
              Host online or offline events with ease. Real-time RSVPs and meeting links built in.
            </p>
          </div>
          <div className="bg-background/5 border border-background/10 rounded-2xl p-6 hover:bg-background/10 transition-colors">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-background mb-2">Live Chat Rooms</h3>
            <p className="text-sm text-background/60 leading-relaxed">
              Event-based chat rooms for real discussions. Connect with members in real-time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
