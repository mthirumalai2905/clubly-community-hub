import { useMemo } from "react";
import { Calendar, Users, Trophy, TrendingUp } from "lucide-react";
import { UserStats } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  stats: UserStats;
  className?: string;
}

export const ProfileStats = ({ stats, className }: ProfileStatsProps) => {
  const contributionRatio = useMemo(() => {
    const total = stats.eventsCreatedCount + stats.eventsJoinedCount;
    if (total === 0) return 0;
    return Math.round((stats.eventsCreatedCount / total) * 100);
  }, [stats]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overview Card */}
      <div className="p-4 bg-card rounded-xl border border-border/50">
        <h3 className="font-display text-sm font-semibold text-foreground mb-4">
          Statistics
        </h3>
        
        <div className="space-y-4">
          <StatRow
            icon={Calendar}
            label="Events Created"
            value={stats.eventsCreatedCount}
            color="text-primary"
          />
          <StatRow
            icon={Users}
            label="Events Joined"
            value={stats.eventsJoinedCount}
            color="text-secondary-foreground"
          />
          <StatRow
            icon={Trophy}
            label="Clubs Joined"
            value={stats.clubsJoinedCount}
            color="text-primary"
          />
        </div>
      </div>

      {/* Contribution Ratio */}
      <div className="p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">
            Contribution Ratio
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Events Created</span>
            <span className="font-medium text-foreground">{contributionRatio}%</span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${contributionRatio}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Created: {stats.eventsCreatedCount}</span>
            <span>Joined: {stats.eventsJoinedCount}</span>
          </div>
        </div>
      </div>

      {/* Mini Chart - Events Over Time (simplified visual) */}
      <div className="p-4 bg-card rounded-xl border border-border/50">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">
          Engagement
        </h3>
        
        <div className="flex items-end gap-1 h-16">
          {Array.from({ length: 12 }).map((_, i) => {
            // Generate a simple visual pattern based on stats
            const baseHeight = 20;
            const variance = (Math.sin(i * 0.8 + stats.eventsCreatedCount) + 1) * 30;
            const height = baseHeight + variance;
            
            return (
              <div
                key={i}
                className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={cn("w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <span className="font-display font-bold text-foreground">{value}</span>
  </div>
);

export default ProfileStats;
