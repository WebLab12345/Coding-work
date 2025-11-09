import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Leaf, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800"
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

export default function SuggestionCard({ suggestion, onImplement }) {
  const getCostIcon = () => {
    switch (suggestion.cost_impact) {
      case 'saves_money': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'costs_money': return <DollarSign className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`shadow-sm border-0 hover:shadow-md transition-all duration-300 ${
        suggestion.is_implemented ? 'bg-green-50 border-l-4 border-green-600' : 'bg-white'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-slate-900">{suggestion.title}</h3>
            {suggestion.is_implemented && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            <Badge className={difficultyColors[suggestion.difficulty]}>
              {suggestion.difficulty}
            </Badge>
            <Badge className={priorityColors[suggestion.priority]}>
              {suggestion.priority} priority
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              -{suggestion.potential_reduction}kg CO₂/year
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {suggestion.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              {getCostIcon()}
              <span className="capitalize">{suggestion.cost_impact.replace('_', ' ')}</span>
            </div>
            {!suggestion.is_implemented && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onImplement(suggestion)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Mark as Implemented
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}