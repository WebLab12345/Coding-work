import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvokeLLM } from "@/integrations/Core";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const activityTypes = [
  { value: "transportation", label: "Transportation", units: ["miles", "km", "gallons", "liters"] },
  { value: "energy", label: "Energy", units: ["kWh", "therms", "gallons", "liters"] },
  { value: "food", label: "Food", units: ["lbs", "kg", "servings", "meals"] },
  { value: "consumption", label: "Consumption", units: ["items", "lbs", "kg", "$"] },
  { value: "waste", label: "Waste", units: ["lbs", "kg", "bags", "items"] }
];

export default function ActivityForm({ onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState({
    activity_type: "",
    description: "",
    quantity: "",
    unit: "",
    location: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCarbonImpact = async () => {
    if (!formData.activity_type || !formData.description || !formData.quantity) {
      return 0;
    }

    setIsCalculating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Calculate the carbon footprint for this activity: "${formData.description}" - ${formData.quantity} ${formData.unit} in category ${formData.activity_type}. 
        Consider real-world emission factors and return only the CO2 equivalent in kilograms as a number. Be accurate based on standard carbon emission databases.
        If you can't calculate precisely, provide a reasonable estimate based on the category and description.`,
        response_json_schema: {
          type: "object",
          properties: {
            carbon_impact: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });

      setIsCalculating(false);
      return response.carbon_impact || 0;
    } catch (error) {
      console.error("Error calculating carbon impact:", error);
      setIsCalculating(false);
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const carbonImpact = await calculateCarbonImpact();
    onSubmit({ ...formData, carbon_impact: carbonImpact, quantity: parseFloat(formData.quantity) });
  };

  const selectedActivityType = activityTypes.find(type => type.value === formData.activity_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Track New Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="activity_type" className="text-slate-700 font-medium">Activity Type</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => handleInputChange('activity_type', value)}
                >
                  <SelectTrigger className="border-slate-200 focus:border-green-500">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-700 font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="border-slate-200 focus:border-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Drive to work, Electric bill, Beef dinner, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="border-slate-200 focus:border-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 font-medium">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="border-slate-200 focus:border-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-slate-700 font-medium">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger className="border-slate-200 focus:border-green-500">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedActivityType?.units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-700 font-medium">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Where did this activity take place?"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="border-slate-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details or context..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="border-slate-200 focus:border-green-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || isCalculating}
                className="bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white"
              >
                {isProcessing || isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isCalculating ? "Calculating Impact..." : "Saving..."}
                  </>
                ) : (
                  "Save Activity"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}