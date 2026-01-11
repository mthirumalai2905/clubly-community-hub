import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useActivityHeatmap } from "@/hooks/useActivityHeatmap";
import { format } from "date-fns";

interface ActivityHeatmapProps {
  userId: string;
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ActivityHeatmap = ({ userId, className }: ActivityHeatmapProps) => {
  const { generateHeatmapData, getActivityLevel, loading } = useActivityHeatmap(userId);

  const weeks = useMemo(() => generateHeatmapData(), [generateHeatmapData]);

  // Calculate month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay && firstDay.date.getMonth() !== currentMonth) {
        currentMonth = firstDay.date.getMonth();
        labels.push({ month: MONTHS[currentMonth], weekIndex });
      }
    });

    return labels;
  }, [weeks]);

  if (loading) {
    return (
      <div className={cn("p-4 bg-card rounded-xl border border-border/50", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card rounded-xl border border-border/50", className)}>
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        Activity
      </h3>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex mb-1 ml-8 text-[10px] text-muted-foreground">
            {monthLabels.map(({ month, weekIndex }, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${weekIndex * 14 + 32}px` }}
              >
                {month}
              </span>
            ))}
          </div>
          
          <div className="flex gap-0.5 relative mt-4">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground pr-1">
              {DAYS.map((day, i) => (
                <div key={day} className="h-3 flex items-center">
                  {i % 2 === 1 && <span>{day}</span>}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => {
                    const level = getActivityLevel(day.count);
                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "w-3 h-3 rounded-sm transition-colors",
                          level === 0 && "bg-muted/50",
                          level === 1 && "bg-primary/20",
                          level === 2 && "bg-primary/40",
                          level === 3 && "bg-primary/60",
                          level === 4 && "bg-primary"
                        )}
                        title={`${format(day.date, "MMM d, yyyy")}: ${day.count} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-muted/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
