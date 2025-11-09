import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Zap, Utensils, ShoppingBag, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const activityIcons = {
  transportation: Car,
  energy: Zap,
  food: Utensils,
  consumption: ShoppingBag,
  waste: Trash2
};

const activityColors = {
  transportation: "bg-blue-100 text-blue-800",
  energy: "bg-yellow-100 text-yellow-800",
  food: "bg-green-100 text-green-800",
  consumption: "bg-purple-100 text-purple-800",
  waste: "bg-red-100 text-red-800"
};

export default function RecentActivities({ activities, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => {
              const Icon = activityIcons[activity.activity_type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{activity.description}</p>
                        <p className="text-sm text-slate-500">
                          {activity.quantity} {activity.unit} • {format(new Date(activity.date), 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={activityColors[activity.activity_type]}>
                          {activity.carbon_impact.toFixed(1)} kg CO₂
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}