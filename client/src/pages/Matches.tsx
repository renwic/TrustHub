import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, User, Shield, Users } from "lucide-react";
import { formatUserDisplayName } from "@/lib/nameUtils";

export default function Matches() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showRealOnePermissions, setShowRealOnePermissions] = useState(false);

  const grantRealOnePermissionMutation = useMutation({
    mutationFn: async (matchId: number) => {
      return await apiRequest("POST", "/api/vouch-permissions", {
        matchId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Permission granted!",
        description: "Your match can now ask questions to your RealOnes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to grant permission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/matches/enhanced"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Matches" />
        </div>
      
      <main className="p-4 mobile-nav-padding">
        {matches.length === 0 ? (
          <div className="text-center mt-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No matches yet</h3>
            <p className="text-slate-600">Keep swiping to find your perfect match!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Your Matches ({matches.length})
            </h2>
            
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              {matches.map((match: any) => {
                // Determine which user is the match (not current user)
                const matchedUser = match.user1?.id === user?.id ? match.user2 : match.user1;
                const matchedProfile = match.profile1?.userId === user?.id ? match.profile2 : match.profile1;
                const compatibility = match.metadata?.compatibility ? Math.round(match.metadata.compatibility * 100) : null;
                const commonInterests = match.metadata?.commonInterests || [];
                
                return (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                          {matchedProfile?.photos?.[0] ? (
                            <img 
                              src={matchedProfile.photos[0]} 
                              alt={matchedProfile.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <User className="w-8 h-8 text-slate-400" style={{ display: matchedProfile?.photos?.[0] ? 'none' : 'block' }} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-800">
                          {matchedProfile ? formatUserDisplayName(matchedProfile) : matchedUser?.firstName || 'Match'}
                        </h3>
                        {compatibility && (
                          <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                            {compatibility}% Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {matchedProfile?.age && `${matchedProfile.age} • `}
                        Matched on {new Date(match.createdAt).toLocaleDateString()}
                      </p>
                      {commonInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {commonInterests.slice(0, 2).map((interest: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {commonInterests.length > 2 && (
                            <Badge variant="outline" className="text-xs text-slate-500">
                              +{commonInterests.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>

                  {/* RealOne Permission Actions */}
                  <div className="flex space-x-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* Navigate to chat */}}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Shield className="w-4 h-4 mr-2" />
                          Share RealOnes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share RealOne Access</DialogTitle>
                          <DialogDescription>
                            Allow this match to ask questions to your RealOnes. This helps them get to know you better through trusted references.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">RealOne Interview Access</p>
                              <p className="text-xs text-blue-700">They can ask your RealOnes questions about your character and personality</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => grantRealOnePermissionMutation.mutate(match.id)}
                              disabled={grantRealOnePermissionMutation.isPending}
                              className="flex-1"
                            >
                              {grantRealOnePermissionMutation.isPending ? "Granting..." : "Grant Access"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
      </div>
    </div>
  );
}
