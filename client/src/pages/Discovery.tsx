import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { Star, Heart, Shield, Award, TrendingUp, Users, CheckCircle, Eye, User, Sparkles, Filter, Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { formatUserDisplayName } from "@/lib/nameUtils";

export default function Discovery() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"compatibility" | "realbar" | "recent" | "nearby">("compatibility");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 22,
    maxAge: 35,
    minCompatibility: 0.5,
    hasProps: false,
    minRealBar: 0,
    maxDistance: 50,
    interests: [] as string[],
    education: "",
    occupation: "",
    relationshipGoal: "",
  });

  // Get recommended matches based on user preferences
  const { data: recommendedProfiles = [], isLoading: isLoadingRecommended, refetch: refetchRecommended } = useQuery({
    queryKey: ["/api/matches/recommended", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        minAge: filters.minAge.toString(),
        maxAge: filters.maxAge.toString(),
        minCompatibility: filters.minCompatibility.toString(),
        hasProps: filters.hasProps.toString(),
      });
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/matches/recommended?${params}`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch recommended matches");
      return response.json();
    },
    retry: false,
    enabled: !!user,
  });

  // Get all profiles for broader discovery
  const { data: allProfiles = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["/api/profiles/discover"],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/profiles/discover', {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
    retry: false,
    enabled: !!user,
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
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      } else {
        toast({
          title: "Interest sent!",
          description: "They'll be notified of your interest.",
        });
      }
      refetchRecommended();
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/discover"] });
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

  const passProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await apiRequest("POST", "/api/swipes", {
        swipedId: profileId,
        action: "pass",
      });
      return response.json();
    },
    onSuccess: () => {
      refetchRecommended();
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/discover"] });
    },
  });

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

  function getTrustCategory(score: number): { name: string; color: string; icon: any } {
    if (score >= 85) return { name: "Verified", color: "text-green-600", icon: CheckCircle };
    if (score >= 70) return { name: "Trusted", color: "text-blue-600", icon: Shield };
    if (score >= 50) return { name: "Emerging", color: "text-yellow-600", icon: TrendingUp };
    return { name: "New", color: "text-slate-600", icon: Users };
  }

  // Filter and sort profiles based on user preferences
  const filterAndSortProfiles = (profiles: any[]) => {
    let filtered = profiles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(query) ||
        profile.bio?.toLowerCase().includes(query) ||
        profile.location?.toLowerCase().includes(query) ||
        profile.interests?.some((interest: string) => interest.toLowerCase().includes(query))
      );
    }

    // Apply age filter
    filtered = filtered.filter(profile => {
      const age = profile.age || 0;
      return age >= filters.minAge && age <= filters.maxAge;
    });

    // Apply RealBar score filter
    filtered = filtered.filter(profile => {
      const trustScore = calculateTrustScore(profile);
      return trustScore >= filters.minRealBar;
    });

    // Apply props filter
    if (filters.hasProps) {
      filtered = filtered.filter(profile => (profile.vouchCount || 0) > 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "compatibility":
          return (b.compatibility || 0) - (a.compatibility || 0);
        case "realbar":
          return calculateTrustScore(b) - calculateTrustScore(a);
        case "recent":
          return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
        case "nearby":
          // For now, sort by random since we don't have actual distance data
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const renderProfileCard = (profile: any) => {
    const trustScore = calculateTrustScore(profile);
    const trustCategory = getTrustCategory(trustScore);
    const TrustIcon = trustCategory.icon;
    const compatibility = profile.compatibility ? Math.round(profile.compatibility * 100) : null;

    if (viewMode === "list") {
      return (
        <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                {profile.photos && profile.photos.length > 0 ? (
                  <img 
                    src={profile.photos[0]} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center" style={{ display: profile.photos?.length > 0 ? 'none' : 'flex' }}>
                  <User className="w-8 h-8 text-white/80" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 truncate">{formatUserDisplayName(profile)}</h3>
                    <p className="text-sm text-slate-600">{profile.age} • {profile.location || "Location not set"}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <TrustIcon className={`w-3 h-3 mr-1 ${trustCategory.color}`} />
                      {trustCategory.name}
                    </Badge>
                    {compatibility && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1 text-pink-600" />
                        {compatibility}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">{profile.bio}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: `${trustScore}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-600">{Math.round(trustScore)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => passProfileMutation.mutate(profile.id)}
                      disabled={passProfileMutation.isPending}
                    >
                      Pass
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      onClick={() => likeProfileMutation.mutate(profile.id)}
                      disabled={likeProfileMutation.isPending}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                    <Link to={`/profiles/${profile.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-64 bg-gradient-to-r from-primary/10 to-secondary/10">
          {profile.photos && profile.photos.length > 0 ? (
            <img 
              src={profile.photos[0]} 
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center" style={{ display: profile.photos?.length > 0 ? 'none' : 'flex' }}>
            <User className="w-16 h-16 text-white/80" />
          </div>
          
          {/* Trust Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-slate-700">
              <TrustIcon className={`w-3 h-3 mr-1 ${trustCategory.color}`} />
              {trustCategory.name}
            </Badge>
          </div>
          
          {/* Compatibility Score */}
          {compatibility && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-slate-700">
                <Sparkles className="w-3 h-3 mr-1 text-pink-600" />
                {compatibility}% Match
              </Badge>
            </div>
          )}
          
          {/* RealBar Score */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 min-w-[80px]">
              <div className="text-xs text-slate-600 mb-1">RealBar</div>
              <Progress value={trustScore} className="h-2" />
              <div className="text-xs font-medium text-slate-800 mt-1">{Math.round(trustScore)}</div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">{formatUserDisplayName(profile)}</h3>
              <p className="text-sm text-slate-600">{profile.age} • {profile.location || "Location not set"}</p>
            </div>
            
            {profile.rating && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span className="text-sm font-medium text-slate-700">{profile.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{profile.bio}</p>
          )}
          
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profile.interests.slice(0, 3).map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge variant="outline" className="text-xs text-slate-500">
                  +{profile.interests.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => passProfileMutation.mutate(profile.id)}
              disabled={passProfileMutation.isPending}
            >
              Pass
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              onClick={() => likeProfileMutation.mutate(profile.id)}
              disabled={likeProfileMutation.isPending}
            >
              <Heart className="w-4 h-4 mr-1" />
              Connect
            </Button>
            <Link to={`/profiles/${profile.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingRecommended && isLoadingAll) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
          <div className="lg:hidden">
            <Header title="Discovery" />
          </div>
          
          <main className="p-4 mobile-nav-padding">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Finding your perfect matches...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Smart Discovery" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2 lg:block hidden">Smart Discovery</h1>
            <p className="text-slate-600 mb-4">Find meaningful connections with personalized recommendations</p>
            
            {/* Search and Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, interests, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Dialog open={showFilters} onOpenChange={setShowFilters}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Advanced Filters</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minAge">Min Age</Label>
                          <Input
                            id="minAge"
                            type="number"
                            value={filters.minAge}
                            onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) || 18 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxAge">Max Age</Label>
                          <Input
                            id="maxAge"
                            type="number"
                            value={filters.maxAge}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 65 }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="minRealBar">Minimum RealBar Score</Label>
                        <Slider
                          id="minRealBar"
                          min={0}
                          max={100}
                          step={5}
                          value={[filters.minRealBar]}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, minRealBar: value[0] }))}
                          className="mt-2"
                        />
                        <div className="text-sm text-slate-500 mt-1">{filters.minRealBar}% and above</div>
                      </div>
                      
                      <div>
                        <Label htmlFor="maxDistance">Maximum Distance</Label>
                        <Slider
                          id="maxDistance"
                          min={1}
                          max={100}
                          step={1}
                          value={[filters.maxDistance]}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                          className="mt-2"
                        />
                        <div className="text-sm text-slate-500 mt-1">{filters.maxDistance} miles</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="hasProps"
                          checked={filters.hasProps}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasProps: checked }))}
                        />
                        <Label htmlFor="hasProps">Must have props</Label>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sortBy" className="text-sm font-medium">Sort by:</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compatibility">Compatibility</SelectItem>
                      <SelectItem value="realbar">RealBar Score</SelectItem>
                      <SelectItem value="recent">Recently Active</SelectItem>
                      <SelectItem value="nearby">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recommended" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  For You ({recommendedProfiles.length})
                </TabsTrigger>
                <TabsTrigger value="explore" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Explore ({allProfiles.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommended" className="mt-6">
                {isLoadingRecommended ? (
                  <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="overflow-hidden animate-pulse">
                        <div className={`${viewMode === "grid" ? "h-64" : "h-20"} bg-gray-200`}></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (() => {
                  const filteredProfiles = filterAndSortProfiles(recommendedProfiles);
                  return filteredProfiles.length > 0 ? (
                    <>
                      <div className="text-sm text-slate-600 mb-4">
                        Showing {filteredProfiles.length} of {recommendedProfiles.length} profiles
                      </div>
                      <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {filteredProfiles.map(renderProfileCard)}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No matches found</h3>
                        <p className="text-slate-600 mb-4">
                          Try adjusting your search or filters to find more profiles.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button onClick={() => setSearchQuery("")} variant="outline">
                            Clear Search
                          </Button>
                          <Button onClick={() => setFilters({
                            minAge: 18,
                            maxAge: 65,
                            minCompatibility: 0,
                            hasProps: false,
                            minRealBar: 0,
                            maxDistance: 100,
                            interests: [],
                            education: "",
                            occupation: "",
                            relationshipGoal: "",
                          })}>
                            Reset Filters
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="explore" className="mt-6">
                {isLoadingAll ? (
                  <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="overflow-hidden animate-pulse">
                        <div className={`${viewMode === "grid" ? "h-64" : "h-20"} bg-gray-200`}></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (() => {
                  const filteredProfiles = filterAndSortProfiles(allProfiles);
                  return filteredProfiles.length > 0 ? (
                    <>
                      <div className="text-sm text-slate-600 mb-4">
                        Showing {filteredProfiles.length} of {allProfiles.length} profiles
                      </div>
                      <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {filteredProfiles.map(renderProfileCard)}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No profiles found</h3>
                        <p className="text-slate-600 mb-4">
                          Try adjusting your search or filters to find more profiles.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button onClick={() => setSearchQuery("")} variant="outline">
                            Clear Search
                          </Button>
                          <Button onClick={() => setFilters({
                            minAge: 18,
                            maxAge: 65,
                            minCompatibility: 0,
                            hasProps: false,
                            minRealBar: 0,
                            maxDistance: 100,
                            interests: [],
                            education: "",
                            occupation: "",
                            relationshipGoal: "",
                          })}>
                            Reset Filters
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}