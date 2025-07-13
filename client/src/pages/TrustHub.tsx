import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import ContextualHelp from "@/components/ContextualHelp";
import { TutorialOverlay, trustHubTutorialSteps } from "@/components/TutorialOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Star, Heart, Shield, Award, TrendingUp, Users, CheckCircle, Eye, User, HelpCircle } from "lucide-react";
import { formatUserDisplayName } from "@/lib/nameUtils";

export default function TrustHub() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Check if user has completed Trust Hub tutorial
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('heartlink-completed-tutorials') || '[]');
    const hasCompletedTrustHub = completed.includes('explore-trust-hub');
    
    // Show tutorial on first visit if not completed
    if (isAuthenticated && !authLoading && !hasCompletedTrustHub) {
      const hasSeenTutorial = localStorage.getItem('heartlink-trust-hub-tutorial-shown');
      if (!hasSeenTutorial) {
        setTimeout(() => setShowTutorial(true), 1000);
        localStorage.setItem('heartlink-trust-hub-tutorial-shown', 'true');
      }
    }
  }, [isAuthenticated, authLoading]);

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ["/api/profiles/discover"],
    retry: false,
    enabled: isAuthenticated, // Only run when authenticated
  });

  // Debug logging
  console.log('TrustHub render:', { 
    authLoading, 
    isAuthenticated, 
    isLoading, 
    profilesCount: profiles.length, 
    error 
  });



  const likeProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await apiRequest("POST", "/api/swipes", {
        swipedId: profileId,
        action: "like",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        toast({
          title: "Connection made! 🎉",
          description: "You're now connected! Start a conversation.",
        });
        // Invalidate notifications to show new match notification
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      } else {
        toast({
          title: "Interest sent!",
          description: "They'll be notified of your interest.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/discover"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/recommended"] });
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
        description: "Failed to send interest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Categorize profiles by trust score
  const categorizedProfiles = profiles.reduce((acc: any, profile: any) => {
    const trustScore = calculateTrustScore(profile);
    if (trustScore >= 85) acc.verified.push(profile);
    else if (trustScore >= 70) acc.trusted.push(profile);
    else if (trustScore >= 50) acc.emerging.push(profile);
    else acc.new.push(profile);
    return acc;
  }, { verified: [], trusted: [], emerging: [], new: [] });

  function calculateTrustScore(profile: any): number {
    let score = 0;
    
    // Base score from props
    const propCount = profile.vouchCount || 0;
    score += Math.min(propCount * 15, 60); // Max 60 points for props
    
    // Rating contribution
    if (profile.rating) {
      score += (profile.rating / 5) * 30; // Max 30 points for rating
    }
    
    // Profile completeness
    let completeness = 0;
    if (profile.photos && profile.photos.length > 0) completeness += 2;
    if (profile.bio) completeness += 2;
    if (profile.occupation) completeness += 1;
    if (profile.education) completeness += 1;
    if (profile.interests && profile.interests.length > 0) completeness += 2;
    if (profile.height) completeness += 1;
    if (profile.location) completeness += 1;
    score += completeness; // Max 10 points for completeness
    
    return Math.min(score, 100);
  }

  function getTrustBadge(trustScore: number) {
    if (trustScore >= 85) {
      return { label: "Verified", color: "bg-green-500", icon: CheckCircle };
    } else if (trustScore >= 70) {
      return { label: "Trusted", color: "bg-blue-500", icon: Shield };
    } else if (trustScore >= 50) {
      return { label: "Emerging", color: "bg-yellow-500", icon: TrendingUp };
    } else {
      return { label: "New", color: "bg-gray-500", icon: Users };
    }
  }

  function ProfileCard({ profile, showTrustScore = true }: { profile: any, showTrustScore?: boolean }) {
    const [imageError, setImageError] = useState(false);
    const trustScore = calculateTrustScore(profile);
    const trustBadge = getTrustBadge(trustScore);
    const BadgeIcon = trustBadge.icon;

    return (
      <Card className="profile-card hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                {!imageError && profile.photos && profile.photos.length > 0 ? (
                  <img 
                    src={profile.photos[0]} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              
              {showTrustScore && (
                <div className={`absolute -top-2 -right-2 ${trustBadge.color} text-white rounded-full p-1`}>
                  <BadgeIcon className="w-3 h-3" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800 truncate">{formatUserDisplayName(profile)}, {profile.age}</h3>
                  <p className="text-sm text-slate-600 truncate">{profile.location}</p>
                  {profile.occupation && (
                    <p className="text-sm text-slate-500 truncate">{profile.occupation}</p>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {profile.rating && (
                    <div className="flex items-center bg-red-50 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 text-red-500 fill-current mr-1" />
                      <span className="text-xs font-medium">{profile.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3 text-blue-500 mr-1" />
                    <span className="text-xs font-medium">{profile.vouchCount || 0}</span>
                  </div>
                </div>
              </div>
              
              {showTrustScore && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">RealBar</span>
                  </div>
                  <Progress value={trustScore} className="h-2" />
                </div>
              )}
              
              {profile.bio && (
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{profile.bio}</p>
              )}
              
              <div className="flex items-center space-x-1">
                <Link to={`/profiles/${profile.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs px-1.5 py-1 h-8 min-w-0">
                    <Eye className="w-3 h-3 mr-0.5" />
                    <span className="truncate">View</span>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    likeProfileMutation.mutate(profile.id);
                  }}
                  disabled={likeProfileMutation.isPending}
                  className="connect-button flex items-center flex-shrink-0 text-xs px-1.5 py-1 h-8 min-w-0"
                >
                  <Heart className="w-3 h-3 mr-0.5" />
                  <span className="truncate">Connect</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle authentication loading state
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized state
  if (!isAuthenticated) {
    setTimeout(() => {
      window.location.href = "/auth";
    }, 100);
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Handle data loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading trusted profiles...</p>
        </div>
      </div>
    );
  }

  // Handle API error state
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Session Expired",
      description: "Please log in again to continue.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/auth";
    }, 1000);
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Session expired. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      
      <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Trust Hub" />
        </div>
      
      <main className="p-4 mobile-nav-padding lg:grid lg:grid-cols-4 lg:gap-6">
        {/* Trust Score Overview - Desktop Sidebar */}
        <div className="lg:col-span-1 lg:order-1">
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Trust-Based Connections
                </div>
                <ContextualHelp variant="button" className="lg:block hidden" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Connect with confidence through our RealOne verification system. Higher RealBar indicates more verified testimonials from trusted sources.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:py-2">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{categorizedProfiles.verified.length}</div>
                    <div className="text-xs text-slate-600">Verified</div>
                  </div>
                  <CheckCircle className="hidden lg:block w-5 h-5 text-green-600" />
                </div>
                <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:py-2">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{categorizedProfiles.trusted.length}</div>
                    <div className="text-xs text-slate-600">Trusted</div>
                  </div>
                  <Shield className="hidden lg:block w-5 h-5 text-blue-600" />
                </div>
                <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:py-2">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{categorizedProfiles.emerging.length}</div>
                    <div className="text-xs text-slate-600">Emerging</div>
                  </div>
                  <TrendingUp className="hidden lg:block w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:py-2">
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{categorizedProfiles.new.length}</div>
                    <div className="text-xs text-slate-600">New</div>
                  </div>
                  <Users className="hidden lg:block w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 lg:order-2">
          <Tabs defaultValue="verified" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="trust-categories grid grid-cols-4 flex-1">
              <TabsTrigger value="verified" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </TabsTrigger>
              <TabsTrigger value="trusted" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Trusted
              </TabsTrigger>
              <TabsTrigger value="emerging" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Emerging
              </TabsTrigger>
              <TabsTrigger value="new" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                New
              </TabsTrigger>
            </TabsList>
            
            {/* Tutorial Trigger Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="ml-2 p-2"
              title="Start Trust Hub Tutorial"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
          
          <TabsContent value="verified">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-slate-800">Verified Profiles</h3>
                <p className="text-sm text-slate-600">Highly vouched members with excellent RealBar</p>
              </div>
              {categorizedProfiles.verified.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No verified profiles available yet</p>
                </div>
              ) : (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {categorizedProfiles.verified.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trusted">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-slate-800">Trusted Profiles</h3>
                <p className="text-sm text-slate-600">Well-vouched members with strong RealBar</p>
              </div>
              {categorizedProfiles.trusted.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No trusted profiles available yet</p>
                </div>
              ) : (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {categorizedProfiles.trusted.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="emerging">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-slate-800">Emerging Profiles</h3>
                <p className="text-sm text-slate-600">Growing trust with developing RealBar</p>
              </div>
              {categorizedProfiles.emerging.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No emerging profiles available yet</p>
                </div>
              ) : (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {categorizedProfiles.emerging.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-slate-800">New Profiles</h3>
                <p className="text-sm text-slate-600">Fresh faces building their RealBar</p>
              </div>
              {categorizedProfiles.new.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No new profiles available yet</p>
                </div>
              ) : (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {categorizedProfiles.new.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>

        <BottomNav />
      </div>
      
      {/* Interactive Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          steps={trustHubTutorialSteps}
          onComplete={() => {
            setShowTutorial(false);
            // Mark tutorial as completed
            const completed = JSON.parse(localStorage.getItem('heartlink-completed-tutorials') || '[]');
            if (!completed.includes('explore-trust-hub')) {
              completed.push('explore-trust-hub');
              localStorage.setItem('heartlink-completed-tutorials', JSON.stringify(completed));
            }
          }}
          onSkip={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}