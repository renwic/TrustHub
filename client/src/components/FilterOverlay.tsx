import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterOverlayProps {
  onClose: () => void;
}

export default function FilterOverlay({ onClose }: FilterOverlayProps) {
  const [filters, setFilters] = useState({
    ageRange: [22, 35],
    maxDistance: 25,
    relationshipStatus: ["Solo"],
    selectedInterests: ["Photography", "Travel"],
  });

  const relationshipStatuses = ["Solo", "Explorers", "Potentials", "Warm Sparks", "On Deck", "Committed", "Archived"];
  const interests = ["Photography", "Travel", "Hiking", "Coffee", "Music", "Fitness"];

  const handleApplyFilters = () => {
    // TODO: Apply filters to discovery
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300"
        style={{ transform: 'translateY(0)' }}
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-bold mb-6">Discovery Filters</h3>
        
        <div className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Age Range</label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">18</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full relative">
                <div className="absolute left-1/4 right-1/3 h-full bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <div className="absolute left-1/4 w-4 h-4 bg-white border-2 border-primary rounded-full transform -translate-y-1"></div>
                <div className="absolute right-1/3 w-4 h-4 bg-white border-2 border-secondary rounded-full transform -translate-y-1"></div>
              </div>
              <span className="text-sm text-slate-600">50</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mt-1">
              <span>{filters.ageRange[0]}</span>
              <span>{filters.ageRange[1]}</span>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Distance</label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">1 mi</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full relative">
                <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <div className="absolute left-1/2 w-4 h-4 bg-white border-2 border-secondary rounded-full transform -translate-y-1"></div>
              </div>
              <span className="text-sm text-slate-600">50+ mi</span>
            </div>
            <div className="text-center text-sm text-slate-600 mt-1">{filters.maxDistance} miles</div>
          </div>

          {/* Relationship Status */}
          <div>
            <label className="block text-sm font-medium mb-3">Looking for</label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipStatuses.map((status) => (
                <Button
                  key={status}
                  variant={filters.relationshipStatus.includes(status) ? "default" : "outline"}
                  className={`p-3 text-sm font-medium ${
                    filters.relationshipStatus.includes(status)
                      ? "bg-primary border-primary text-white"
                      : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      relationshipStatus: prev.relationshipStatus.includes(status)
                        ? prev.relationshipStatus.filter(s => s !== status)
                        : [...prev.relationshipStatus, status]
                    }));
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-3">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={filters.selectedInterests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    filters.selectedInterests.includes(interest)
                      ? "bg-primary text-white"
                      : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      selectedInterests: prev.selectedInterests.includes(interest)
                        ? prev.selectedInterests.filter(i => i !== interest)
                        : [...prev.selectedInterests, interest]
                    }));
                  }}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Button 
            variant="outline" 
            className="flex-1 py-3 border-slate-300 text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
