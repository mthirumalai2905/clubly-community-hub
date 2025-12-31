import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-foreground">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4">
              Ready to build your
              <span className="text-primary"> community?</span>
            </h2>
            <p className="text-lg text-background/60 mb-8">
              Join thousands who've chosen meaningful connections over endless scrolling. Start your club today—it's free.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                size="lg" 
                className="h-12 px-6 text-base font-semibold group"
                onClick={() => navigate("/auth")}
              >
                Create Your Club
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-6 text-base font-semibold border-background/20 text-background hover:bg-background/10 hover:text-background"
              >
                Schedule a Demo
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="lg:text-right">
            <p className="text-sm text-background/50 mb-3">Trusted by communities at</p>
            <div className="flex flex-wrap lg:justify-end items-center gap-6">
              <span className="font-display text-lg font-semibold text-background/80">Stanford</span>
              <span className="font-display text-lg font-semibold text-background/80">Y Combinator</span>
              <span className="font-display text-lg font-semibold text-background/80">NYU</span>
              <span className="font-display text-lg font-semibold text-background/80">TechStars</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
