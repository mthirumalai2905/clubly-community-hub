import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Clubly
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              to="/#clubs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Clubs
            </Link>
            <Link
              to="/#events"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Events
            </Link>
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
