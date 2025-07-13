import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export interface RelationshipStage {
  stage: string;
  description: string;
  color: string;
  icon: string;
  nextStage?: string;
}

export const relationshipStages: RelationshipStage[] = [
  {
    stage: "Solo",
    description: "Single, not actively dating anyone",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "👤",
  },
  {
    stage: "Explorers",
    description: "Casually exploring connections, open to meeting new people",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🔍",
    nextStage: "Potentials"
  },
  {
    stage: "Potentials",
    description: "Interested in specific people, getting to know them better",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "💭",
    nextStage: "Warm Sparks"
  },
  {
    stage: "Warm Sparks",
    description: "Strong mutual interest, regular communication and connection",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "⚡",
    nextStage: "On Deck"
  },
  {
    stage: "On Deck",
    description: "Serious consideration, exploring deeper commitment",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "🎯",
    nextStage: "Committed"
  },
  {
    stage: "Committed",
    description: "Exclusive relationship, committed partnership",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "💍",
    nextStage: "Archived"
  },
  {
    stage: "Archived",
    description: "Past connections, no longer active",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: "📁",
  }
];

export function getStageInfo(stage: string): RelationshipStage | undefined {
  return relationshipStages.find(s => s.stage === stage);
}

export function getStageColor(stage: string): string {
  const stageInfo = getStageInfo(stage);
  return stageInfo?.color || "bg-gray-100 text-gray-800 border-gray-200";
}

interface RelationshipStageHelperProps {
  currentStage: string;
  showProgression?: boolean;
}

export default function RelationshipStageHelper({ 
  currentStage, 
  showProgression = false 
}: RelationshipStageHelperProps) {
  const currentStageInfo = getStageInfo(currentStage);
  
  if (!currentStageInfo) return null;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{currentStageInfo.icon}</span>
          <div>
            <Badge className={currentStageInfo.color}>
              {currentStageInfo.stage}
            </Badge>
            <p className="text-sm text-slate-600 mt-1">
              {currentStageInfo.description}
            </p>
          </div>
        </div>
        
        {showProgression && currentStageInfo.nextStage && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Info className="w-4 h-4" />
              <span className="font-medium">Next Stage:</span>
              {getStageInfo(currentStageInfo.nextStage)?.stage}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {getStageInfo(currentStageInfo.nextStage)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RelationshipStageGuide() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Relationship Stages Guide</h3>
      {relationshipStages.map((stage, index) => (
        <Card key={stage.stage}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                {index + 1}
              </div>
              <span className="text-2xl">{stage.icon}</span>
              <div className="flex-1">
                <Badge className={stage.color}>
                  {stage.stage}
                </Badge>
                <p className="text-sm text-slate-600 mt-1">
                  {stage.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}