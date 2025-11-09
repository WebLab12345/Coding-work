import React, { useState } from "react";
import { CarbonActivity } from "@/entities/CarbonActivity";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import ActivityForm from "../components/tracking/ActivityForm";

export default function TrackActivity() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (activityData) => {
    setIsProcessing(true);
    try {
      await CarbonActivity.create(activityData);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving activity:", error);
    }
    setIsProcessing(false);
  };

  const handleCancel = () => {
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="border-slate-200 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Track Carbon Activity</h1>
            <p className="text-slate-600 mt-1">Log your daily activities to monitor their environmental impact</p>
          </div>
        </motion.div>

        <ActivityForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}