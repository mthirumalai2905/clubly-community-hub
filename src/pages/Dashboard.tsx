import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Calendar,
  LogOut,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import CreateClubModal from "@/components/CreateClubModal";
import { useToast } from "@/hooks/use-toast";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_by: string;
}

interface ClubWithMembership extends Club {
  isMember: boolean;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clubs, setClubs] = useState<ClubWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchClubs();
    }
  }, [user]);

  const fetchClubs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false });

      if (clubsError) throw clubsError;

      // Fetch user's memberships
      const { data: membershipsData, error: membershipsError } = await supabase
        .from("club_memberships")
        .select("club_id")
        .eq("user_id", user.id);

      if (membershipsError) throw membershipsError;

      const memberClubIds = new Set(membershipsData?.map((m) => m.club_id) || []);

      const clubsWithMembership = (clubsData || []).map((club) => ({
        ...club,
        isMember: memberClubIds.has(club.id),
      }));

      setClubs(clubsWithMembership);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast({
        title: "Error",
        description: "Failed to load clubs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("club_memberships").insert({
        club_id: clubId,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;

      toast({
        title: "Joined club!",
        description: "You are now a member of this club.",
      });

      fetchClubs();
    } catch (error) {
      console.error("Error joining club:", error);
      toast({
        title: "Error",
        description: "Failed to join club. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("club_memberships")
        .delete()
        .eq("club_id", clubId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Left club",
        description: "You have left this club.",
      });

      fetchClubs();
    } catch (error) {
      console.error("Error leaving club:", error);
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myClubs = filteredClubs.filter((club) => club.isMember);
  const discoverClubs = filteredClubs.filter((club) => !club.isMember);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold text-foreground">
                Clubly
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="hero"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create Club
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* My Clubs */}
            <section className="mb-12">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                My Clubs
              </h2>
              {myClubs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No clubs yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Join a club or create your own to get started!
                  </p>
                  <Button variant="hero" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4" />
                    Create Your First Club
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myClubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      onEnter={() => navigate(`/club/${club.id}`)}
                      onLeave={() => handleLeaveClub(club.id)}
                      isMember={true}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Discover Clubs */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Discover Clubs
              </h2>
              {discoverClubs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <p className="text-muted-foreground">
                    No clubs to discover. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoverClubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      onJoin={() => handleJoinClub(club.id)}
                      isMember={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <CreateClubModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchClubs();
        }}
      />
    </div>
  );
};

interface ClubCardProps {
  club: ClubWithMembership;
  onEnter?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isMember: boolean;
}

const ClubCard = ({ club, onEnter, onJoin, onLeave, isMember }: ClubCardProps) => {
  return (
    <div className="group p-5 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card">
      <div className="flex items-start justify-between mb-3">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
          {club.category}
        </span>
        <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {club.name}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {club.description || "No description"}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{club.member_count} members</span>
        </div>

        {isMember ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLeave}>
              Leave
            </Button>
            <Button size="sm" onClick={onEnter}>
              Enter
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={onJoin}>
            Join
          </Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
