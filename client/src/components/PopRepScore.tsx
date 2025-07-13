import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopRepScoreProps {
  profileId: number;
  className?: string;
  showDetails?: boolean;
}

interface PopRepData {
  totalLikes: number;
  totalComments: number;
  popRepScore: number;
}

export default function PopRepScore({ profileId, className, showDetails = false }: PopRepScoreProps) {
  const { data: popRep, isLoading } = useQuery<PopRepData>({
    queryKey: [`/api/profiles/${profileId}/poprep`],
  });

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!popRep || popRep.popRepScore === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-pink-500 to-rose-500 text-white";
    if (score >= 60) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    if (score >= 40) return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
    if (score >= 20) return "bg-gradient-to-r from-green-500 to-blue-500 text-white";
    return "bg-gradient-to-r from-gray-500 to-green-500 text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Viral";
    if (score >= 60) return "Popular";
    if (score >= 40) return "Trending";
    if (score >= 20) return "Rising";
    return "New";
  };

  if (showDetails) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-gray-900">PopRep Score</span>
          <Badge className={getScoreColor(popRep.popRepScore)}>
            {Math.round(popRep.popRepScore)} {getScoreLabel(popRep.popRepScore)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-600">{popRep.totalLikes}</div>
              <div className="text-sm text-red-500">Total Likes</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{popRep.totalComments}</div>
              <div className="text-sm text-blue-500">Comments</div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          PopRep measures social engagement on shared photos from your RealOnes
        </div>
      </div>
    );
  }

  return (
    <Badge className={cn(getScoreColor(popRep.popRepScore), "text-xs", className)}>
      <TrendingUp className="w-3 h-3 mr-1" />
      PopRep {Math.round(popRep.popRepScore)}
    </Badge>
  );
}