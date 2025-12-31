import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Clubly
            </span>
          </button>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("clubs")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Clubs
            </button>
            <button
              onClick={() => scrollToSection("events")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Events
            </button>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium"
              onClick={() => navigate("/auth")}
            >
              Log in
            </Button>
            <Button 
              size="sm" 
              className="text-sm font-medium"
              onClick={() => navigate("/auth")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
