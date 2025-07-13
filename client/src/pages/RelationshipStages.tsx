import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DesktopNav from "@/components/DesktopNav";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Users, Sparkles, Target, Crown, Archive } from "lucide-react";

interface RelationshipStage {
  stage: string;
  description: string;
  level: number;
  icon: string;
}

const stageIcons: { [key: string]: React.ReactNode } = {
  "Solo": <Users className="w-6 h-6" />,
  "Explorers": <Heart className="w-6 h-6" />,
  "Potentials": <Sparkles className="w-6 h-6" />,
  "Warm Sparks": <Sparkles className="w-6 h-6 text-orange-500" />,
  "On Deck": <Target className="w-6 h-6" />,
  "Committed": <Crown className="w-6 h-6" />,
  "Archived": <Archive className="w-6 h-6" />
};

const stageColors: { [key: string]: string } = {
  "Solo": "bg-gray-100 text-gray-800 border-gray-200",
  "Explorers": "bg-blue-100 text-blue-800 border-blue-200",
  "Potentials": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Warm Sparks": "bg-orange-100 text-orange-800 border-orange-200",
  "On Deck": "bg-pink-100 text-pink-800 border-pink-200",
  "Committed": "bg-green-100 text-green-800 border-green-200",
  "Archived": "bg-slate-100 text-slate-800 border-slate-200"
};

export default function RelationshipStages() {
  const { user } = useAuth();
  
  const { data: stages, isLoading } = useQuery({
    queryKey: ["/api/relationship-stages"],
  });

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading relationship stages...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = userData?.profile?.relationshipStatus || "Solo";
  const currentStageInfo = stages?.find((s: RelationshipStage) => s.stage === currentStage);
  const progressPercentage = currentStageInfo ? (currentStageInfo.level / 7) * 100 : 0;

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Relationship Stages" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
          {/* Current Stage Overview */}
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {currentStageInfo && stageIcons[currentStage]}
                Your Current Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge className={stageColors[currentStage] || stageColors["Solo"]}>
                  {currentStage}
                </Badge>
                <span className="text-sm text-slate-600">
                  Stage {currentStageInfo?.level || 1} of 7
                </span>
              </div>
              <p className="text-slate-700 mb-4">
                {currentStageInfo?.description || "Single, not actively dating anyone"}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* All Stages Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Relationship Journey</CardTitle>
              <p className="text-sm text-slate-600">
                Heartlink uses a seven-stage system to help you navigate meaningful connections
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages?.map((stage: RelationshipStage, index: number) => {
                  const isCurrentStage = stage.stage === currentStage;
                  const isPastStage = stage.level < (currentStageInfo?.level || 1);
                  
                  return (
                    <div 
                      key={stage.stage}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCurrentStage 
                          ? 'border-primary bg-primary/5' 
                          : isPastStage 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          isCurrentStage 
                            ? 'bg-primary text-white' 
                            : isPastStage 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isPastStage ? '✓' : stage.level}
                        </div>
                        <div className="flex items-center gap-2">
                          {stageIcons[stage.stage]}
                          <span className="text-xl">{stage.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={stageColors[stage.stage]}>
                              {stage.stage}
                            </Badge>
                            {isCurrentStage && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                            {isPastStage && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tips for Current Stage */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tips for {currentStage}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentStage === "Solo" && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Complete your profile to attract quality connections</p>
                    <p className="text-sm text-slate-700">• Invite friends and family to give you props</p>
                    <p className="text-sm text-slate-700">• Browse and connect with people in the Trust Hub</p>
                  </div>
                )}
                {currentStage === "Explorers" && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Be open to meeting different types of people</p>
                    <p className="text-sm text-slate-700">• Focus on building genuine connections</p>
                    <p className="text-sm text-slate-700">• Use the discovery features to find compatible matches</p>
                  </div>
                )}
                {currentStage === "Potentials" && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Engage in meaningful conversations</p>
                    <p className="text-sm text-slate-700">• Ask thoughtful questions to get to know them better</p>
                    <p className="text-sm text-slate-700">• Consider video calls or in-person meetings</p>
                  </div>
                )}
                {(currentStage === "Warm Sparks" || currentStage === "On Deck") && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Maintain regular, quality communication</p>
                    <p className="text-sm text-slate-700">• Share your RealOnes for deeper trust building</p>
                    <p className="text-sm text-slate-700">• Plan special activities together</p>
                  </div>
                )}
                {currentStage === "Committed" && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Focus on building a strong foundation together</p>
                    <p className="text-sm text-slate-700">• Consider relationship goals and future plans</p>
                    <p className="text-sm text-slate-700">• Continue investing in trust and communication</p>
                  </div>
                )}
                {currentStage === "Archived" && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">• Reflect on lessons learned from past connections</p>
                    <p className="text-sm text-slate-700">• Update your profile for future connections</p>
                    <p className="text-sm text-slate-700">• Consider moving back to Solo or Explorers when ready</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}