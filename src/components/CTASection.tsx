import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Main content */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6 tracking-tight">
            Ready to build something
            <br />
            <span className="text-primary">people actually care about?</span>
          </h2>

          <p className="text-base md:text-lg text-background/60 mb-10 max-w-xl mx-auto">
            Start your community today. Free to use, no credit card required.
            Upgrade when you're ready.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Button
              size="lg"
              className="h-12 px-6 text-base font-medium bg-background text-foreground hover:bg-background/90 rounded-xl"
              onClick={() => navigate("/auth")}
            >
              Get started free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-medium border-background/20 text-background hover:bg-background/10 hover:text-background rounded-xl"
            >
              Talk to sales
            </Button>
          </div>

          {/* Simple trust line */}
          <p className="text-sm text-background/40">
            Join 2,500+ community builders • No spam, ever • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
