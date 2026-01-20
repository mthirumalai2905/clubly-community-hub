import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityDay {
  date: string;
  count: number;
}

export const useActivityHeatmap = (userId?: string) => {
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!userId) {
      setActivityData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch last 365 days of activity
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const { data, error } = await supabase
        .from("user_activity")
        .select("activity_date, activity_count")
        .eq("user_id", userId)
        .gte("activity_date", startDate.toISOString().split("T")[0])
        .order("activity_date", { ascending: true });

      if (error) throw error;

      setActivityData(
        (data || []).map((d) => ({
          date: d.activity_date,
          count: d.activity_count,
        }))
      );
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Subscribe to realtime updates for user activity
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-activity-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_activity",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch activity data when there's a change
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchActivity]);

  // Record activity for today
  const recordActivity = async () => {
    try {
      await supabase.rpc("record_user_activity");
      fetchActivity();
    } catch (error) {
      console.error("Error recording activity:", error);
    }
  };

  // Generate heatmap data for the last 365 days
  const generateHeatmapData = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];

    // Start from the beginning of the week containing oneYearAgo
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const activityMap = new Map(
      activityData.map((d) => [d.date, d.count])
    );

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const count = activityMap.get(dateStr) || 0;

      currentWeek.push({ date: new Date(d), count });

      if (d.getDay() === 6 || d.getTime() === today.getTime()) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getActivityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  return {
    activityData,
    loading,
    recordActivity,
    generateHeatmapData,
    getActivityLevel,
    refetchActivity: fetchActivity,
  };
};

export default useActivityHeatmap;
