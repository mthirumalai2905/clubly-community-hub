import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useActivityHeatmap } from "@/hooks/useActivityHeatmap";
import { format } from "date-fns";
import { Flame } from "lucide-react";

interface ActivityHeatmapProps {
  userId: string;
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const ActivityHeatmap = ({ userId, className }: ActivityHeatmapProps) => {
  const { generateHeatmapData, getActivityLevel, loading, activityData } = useActivityHeatmap(userId);
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; count: number } | null>(null);

  const weeks = useMemo(() => generateHeatmapData(), [generateHeatmapData]);
  
  // Calculate total active days
  const totalActiveDays = useMemo(() => {
    return activityData.filter(d => d.count > 0).length;
  }, [activityData]);

  // Get visible weeks based on responsive design (show fewer weeks on mobile)
  const visibleWeeks = useMemo(() => {
    // Show last 26 weeks on mobile, all 52+ weeks on desktop
    return weeks;
  }, [weeks]);

  // Calculate month labels with proper positioning
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    visibleWeeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay && firstDay.date.getMonth() !== currentMonth) {
        currentMonth = firstDay.date.getMonth();
        labels.push({ month: MONTHS[currentMonth], weekIndex });
      }
    });

    return labels;
  }, [visibleWeeks]);

  if (loading) {
    return (
      <div className={cn("p-4 bg-card rounded-xl border border-border/50", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card rounded-xl border border-border/50", className)}>
      {/* Header with title and active days count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">
            Activity
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-foreground">{totalActiveDays}</span>
          <span className="text-muted-foreground">active days</span>
        </div>
      </div>
      
      {/* Heatmap Container */}
      <div className="relative">
        {/* Month labels row */}
        <div className="flex mb-2 text-[10px] text-muted-foreground overflow-hidden">
          <div className="w-0 flex-shrink-0" /> {/* Spacer for alignment */}
          <div className="flex-1 flex relative h-4">
            {monthLabels.map(({ month, weekIndex }, i) => {
              // Calculate position as percentage
              const position = (weekIndex / visibleWeeks.length) * 100;
              // Only show month if there's enough space (at least 8% apart from previous)
              const prevPosition = i > 0 ? (monthLabels[i - 1].weekIndex / visibleWeeks.length) * 100 : -20;
              if (position - prevPosition < 6) return null;
              
              return (
                <span
                  key={i}
                  className="absolute whitespace-nowrap"
                  style={{ left: `${position}%` }}
                >
                  {month}
                </span>
              );
            })}
          </div>
        </div>
        
        {/* Heatmap grid - responsive */}
        <div className="flex gap-[2px] overflow-hidden">
          {visibleWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px] flex-shrink-0">
              {week.map((day, dayIndex) => {
                const level = getActivityLevel(day.count);
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] transition-all duration-150 cursor-pointer",
                      level === 0 && "bg-muted/60 hover:bg-muted",
                      level === 1 && "bg-primary/25 hover:bg-primary/35",
                      level === 2 && "bg-primary/50 hover:bg-primary/60",
                      level === 3 && "bg-primary/75 hover:bg-primary/85",
                      level === 4 && "bg-primary hover:brightness-110"
                    )}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    title={`${format(day.date, "MMM d, yyyy")}: ${day.count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded-md shadow-md text-xs whitespace-nowrap pointer-events-none z-10">
            <span className="font-medium text-foreground">{hoveredDay.count} activities</span>
            <span className="text-muted-foreground"> on {format(hoveredDay.date, "MMM d, yyyy")}</span>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] bg-muted/60" />
          <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] bg-primary/25" />
          <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] bg-primary/50" />
          <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] bg-primary/75" />
          <div className="w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
