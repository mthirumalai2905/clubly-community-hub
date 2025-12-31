import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Users } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Clubly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              to="/#clubs"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Clubs
            </Link>
            <Link
              to="/#events"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Events
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Log in
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/#features"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/#clubs"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Clubs
              </Link>
              <Link
                to="/#events"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-center" onClick={() => navigate("/auth")}>
                  Log in
                </Button>
                <Button variant="hero" className="w-full justify-center" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
