import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, unit, icon: Icon, trend, bgGradient, iconColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="relative overflow-hidden bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 transform translate-x-6 -translate-y-6 ${bgGradient} rounded-full`} />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${iconColor.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className={trend.includes('-') ? 'text-green-600' : 'text-orange-600'}>
                  {trend}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{value}</span>
              <span className="text-sm text-slate-500">{unit}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}