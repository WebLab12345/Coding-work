import React, { useState, useEffect } from "react";
import { CarbonActivity, CarbonSuggestion } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Lightbulb, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import SuggestionCard from "../components/insights/SuggestionCard";

export default function Insights() {
  const [activities, setActivities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    setIsLoading(true);
    try {
      const [activitiesData, suggestionsData] = await Promise.all([
        CarbonActivity.list("-date", 100),
        CarbonSuggestion.list("-created_date")
      ]);
      
      setActivities(activitiesData);
      setSuggestions(suggestionsData);
      
      if (activitiesData.length > 0) {
        await generatePredictions(activitiesData);
      }
    } catch (error) {
      console.error("Error loading insights data:", error);
    }
    setIsLoading(false);
  };

  const generatePredictions = async (activities) => {
    try {
      const response = await InvokeLLM({
        prompt: `Analyze this carbon footprint data and create predictions: ${JSON.stringify(activities.slice(0, 20))}. 
        Provide monthly and yearly predictions, identify trends, and suggest target reductions.`,
        response_json_schema: {
          type: "object",
          properties: {
            monthly_prediction: { type: "number" },
            yearly_prediction: { type: "number" },
            trend_analysis: { type: "string" },
            recommended_reduction_target: { type: "number" }
          }
        }
      });
      
      setPredictions(response);
    } catch (error) {
      console.error("Error generating predictions:", error);
    }
  };

  const generatePersonalizedSuggestions = async () => {
    if (activities.length === 0) return;
    
    setIsGenerating(true);
    try {
      const activitySummary = activities.slice(0, 20).map(a => 
        `${a.activity_type}: ${a.description} (${a.carbon_impact}kg CO2)`
      );

      const response = await InvokeLLM({
        prompt: `Based on this carbon footprint data, generate 5 personalized improvement suggestions: ${activitySummary.join(', ')}. 
        Focus on the highest impact activities and provide specific, actionable recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: ["transportation", "energy", "food", "consumption", "waste"] },
                  potential_reduction: { type: "number" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  cost_impact: { type: "string", enum: ["saves_money", "neutral", "costs_money"] }
                }
              }
            }
          }
        }
      });

      // Save suggestions to database
      for (const suggestion of response.suggestions) {
        await CarbonSuggestion.create(suggestion);
      }

      // Reload suggestions
      const updatedSuggestions = await CarbonSuggestion.list("-created_date");
      setSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
    setIsGenerating(false);
  };

  const handleImplementSuggestion = async (suggestion) => {
    try {
      await CarbonSuggestion.update(suggestion.id, { is_implemented: true });
      setSuggestions(prev => 
        prev.map(s => s.id === suggestion.id ? { ...s, is_implemented: true } : s)
      );
    } catch (error) {
      console.error("Error updating suggestion:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Carbon Insights</h1>
          <p className="text-slate-600">AI-powered predictions and personalized suggestions for reducing your footprint</p>
        </motion.div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Carbon Footprint Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="animate-pulse h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : predictions ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-slate-900">Monthly Prediction</h3>
                          <p className="text-2xl font-bold text-blue-600 mt-2">
                            {predictions.monthly_prediction?.toFixed(1)} kg CO₂
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-slate-900">Yearly Prediction</h3>
                          <p className="text-2xl font-bold text-green-600 mt-2">
                            {(predictions.yearly_prediction / 1000)?.toFixed(1)} tonnes CO₂
                          </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <h3 className="font-semibold text-slate-900">Reduction Target</h3>
                          <p className="text-2xl font-bold text-orange-600 mt-2">
                            -{predictions.recommended_reduction_target?.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Trend Analysis</h3>
                        <p className="text-slate-700">{predictions.trend_analysis}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600">Start tracking activities to see predictions</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="suggestions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Personalized Suggestions</h2>
                <Button
                  onClick={generatePersonalizedSuggestions}
                  disabled={isGenerating || activities.length === 0}
                  className="bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Generate New Suggestions
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onImplement={handleImplementSuggestion}
                  />
                ))}
              </div>

              {suggestions.length === 0 && !isLoading && (
                <Card className="shadow-sm border-0">
                  <CardContent className="text-center py-12">
                    <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No suggestions yet. Generate personalized recommendations based on your activity data.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}