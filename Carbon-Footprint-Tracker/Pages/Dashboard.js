import React, { useState, useEffect } from "react";
import { CarbonActivity } from "@/entities/CarbonActivity";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Leaf, TrendingDown, Target, Activity } from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../components/dashboard/StatsCard";
import FootprintChart from "../components/dashboard/FootprintChart";
import RecentActivities from "../Components/dashboard/RecentActivities.js";

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalFootprint: 0,
    monthlyAverage: 0,
    weeklyTrend: 0,
    yearlyProjection: 0
  });
  const [aiInsight, setAiInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const fetchedActivities = await CarbonActivity.list("-date", 50);
      setActivities(fetchedActivities);
      
      // Calculate stats
      const totalFootprint = fetchedActivities.reduce((sum, activity) => sum + activity.carbon_impact, 0);
      const monthlyAverage = totalFootprint / Math.max(1, fetchedActivities.length / 30);
      
      // Calculate weekly trend
      const thisWeek = fetchedActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate > weekAgo;
      });
      const thisWeekTotal = thisWeek.reduce((sum, activity) => sum + activity.carbon_impact, 0);
      
      const lastWeek = fetchedActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate > twoWeeksAgo && activityDate <= weekAgo;
      });
      const lastWeekTotal = lastWeek.reduce((sum, activity) => sum + activity.carbon_impact, 0);
      
      const weeklyTrend = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100) : 0;
      
      setStats({
        totalFootprint,
        monthlyAverage,
        weeklyTrend,
        yearlyProjection: monthlyAverage * 12
      });

      // Prepare chart data
      const chartData = processChartData(fetchedActivities);
      setChartData(chartData);

      // Generate AI insight
      if (fetchedActivities.length > 0) {
        await generateAIInsight(fetchedActivities, stats);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const processChartData = (activities) => {
    const dailyTotals = {};
    activities.forEach(activity => {
      const date = activity.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + activity.carbon_impact;
    });

    return Object.entries(dailyTotals)
      .slice(-30)
      .map(([date, footprint]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        footprint: parseFloat(footprint.toFixed(2))
      }));
  };

  const generateAIInsight = async (activities, stats) => {
    try {
      const activitiesSummary = activities.slice(0, 10).map(a => 
        `${a.activity_type}: ${a.description} (${a.carbon_impact}kg CO2)`
      ).join(', ');
      
      const response = await InvokeLLM({
        prompt: `Analyze this carbon footprint data and provide a brief, actionable insight for reducing emissions. Weekly trend: ${stats.weeklyTrend.toFixed(1)}%, Recent activities: ${activitiesSummary}. Keep it under 100 words and focus on the most impactful recommendation.`,
      });
      
      setAiInsight(response);
    } catch (error) {
      console.error("Error generating AI insight:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Carbon Dashboard</h1>
            <p className="text-slate-600 mt-2">Monitor your environmental impact and discover ways to improve</p>
          </div>
          <Link to={createPageUrl("TrackActivity")}>
            <Button className="bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" />
              Track Activity
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Footprint"
            value={stats.totalFootprint.toFixed(1)}
            unit="kg CO₂"
            icon={Leaf}
            bgGradient="bg-gradient-to-br from-green-800 to-green-600"
            iconColor="bg-green-600"
          />
          <StatsCard
            title="Monthly Average"
            value={stats.monthlyAverage.toFixed(1)}
            unit="kg CO₂/day"
            icon={Activity}
            trend={stats.weeklyTrend >= 0 ? `+${stats.weeklyTrend.toFixed(1)}%` : `${stats.weeklyTrend.toFixed(1)}%`}
            bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            iconColor="bg-blue-500"
          />
          <StatsCard
            title="Weekly Trend"
            value={Math.abs(stats.weeklyTrend).toFixed(1)}
            unit="% change"
            icon={TrendingDown}
            trend={stats.weeklyTrend < 0 ? "Improving" : "Increasing"}
            bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
            iconColor="bg-purple-500"
          />
          <StatsCard
            title="Yearly Projection"
            value={(stats.yearlyProjection / 1000).toFixed(1)}
            unit="tonnes CO₂"
            icon={Target}
            bgGradient="bg-gradient-to-br from-orange-500 to-orange-600"
            iconColor="bg-orange-500"
          />
        </div>

        {/* AI Insight */}
        {aiInsight && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-green-800 to-green-600 p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                AI-Powered Insight
              </h3>
              <p className="text-green-50">{aiInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Charts and Activities */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FootprintChart data={chartData} isLoading={isLoading} />
          </div>
          <div>
            <RecentActivities activities={activities} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}