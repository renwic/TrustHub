import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatNameWithInitials, getNameInitials, formatUserDisplayName } from "@/lib/nameUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Users, MapPin, Calendar, Shield, Globe, Lock, Eye, EyeOff } from "lucide-react";

export default function CircleDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [dynamicPaddingBottom, setDynamicPaddingBottom] = useState(120);
  const [showFullNames, setShowFullNames] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { user } = useAuth();

  // Fetch circle details
  const { data: circle, isLoading: circleLoading, error: circleError } = useQuery({
    queryKey: [`/api/circles/${id}/public`],
    retry: false,
    enabled: !!id,
  });

  // Fetch circle members (only if circle allows viewing members)
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: [`/api/circles/${id}/members`],
    retry: false,
    enabled: !!id && !!circle && circle.canViewMembers !== false,
  });

  // Check if current user is a member of this circle (to show name preference toggle)
  const isUserMember = user && members.some((member: any) => member.userId === user.id);

  // Get current user's name preference for this circle
  const currentUserMembership = members.find((member: any) => member.userId === user?.id);
  const userNamePreference = currentUserMembership?.showFullName || false;

  // Update user's name preference for this circle
  const updateNamePreferenceMutation = useMutation({
    mutationFn: async (showFullName: boolean) => {
      return apiRequest(`/api/circles/${id}/name-preference`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showFullName }),
      });
    },
    onSuccess: () => {
      // Refetch members to get updated preferences
      queryClient.invalidateQueries({ queryKey: [`/api/circles/${id}/members`] });
    },
  });

  // Get all profiles to map user IDs to profile IDs
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['/api/profiles/discover'],
  });

  // Create a manual mapping for known user IDs to profile IDs
  const userIdToProfileIdMap: Record<string, number> = {
    'sample_1': 50,
    'sample_2': 51,
    'sample_4': 5,
    'sample_14': 15,
    'sample_23': 24,
    'email_1751936110401_2q7lz31f2': 58,
  };

  // Helper function to get profile ID from user ID
  const getProfileIdByUserId = (userId: string) => {
    // First check discovery profiles
    const profile = allProfiles.find((p: any) => p.userId === userId);
    if (profile) return profile.id;
    
    // Fallback to manual mapping
    return userIdToProfileIdMap[userId];
  };

  // Dynamic spacing calculation for mobile navigation
  useEffect(() => {
    const calculateSpacing = () => {
      if (!contentRef.current) return;
      
      const windowHeight = window.innerHeight;
      const contentRect = contentRef.current.getBoundingClientRect();
      const contentBottom = contentRect.bottom;
      const requiredClearance = 208; // Bottom nav height + buffer
      const spacingBuffer = 8;
      
      if (contentBottom > windowHeight - requiredClearance) {
        const overflow = contentBottom - (windowHeight - requiredClearance);
        const newPadding = Math.min(240, Math.max(120, 120 + overflow * 0.6 + spacingBuffer));
        setDynamicPaddingBottom(newPadding);
      } else {
        setDynamicPaddingBottom(120);
      }
    };

    calculateSpacing();
    window.addEventListener('resize', calculateSpacing);
    return () => window.removeEventListener('resize', calculateSpacing);
  }, [circle, members]);

  if (circleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" style={{ paddingBottom: `${dynamicPaddingBottom}px` }}>
        <Header />
        <DesktopNav />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading circle details</h3>
            <p className="text-gray-600">Getting circle information...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (circleError || !circle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" style={{ paddingBottom: `${dynamicPaddingBottom}px` }}>
        <Header />
        <DesktopNav />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">Circle not found or not accessible.</p>
              <Button onClick={() => setLocation(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Check if user can view this circle (must be public and show members)
  if (circle.isPrivate || circle.canViewMembers === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" style={{ paddingBottom: `${dynamicPaddingBottom}px` }}>
        <Header />
        <DesktopNav />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Circle</h3>
              <p className="text-gray-600 mb-4">This circle's details are not publicly visible.</p>
              <Button onClick={() => setLocation(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-slate-100 text-slate-700',
      adventure: 'bg-emerald-100 text-emerald-700',
      fitness: 'bg-orange-100 text-orange-700',
      food: 'bg-yellow-100 text-yellow-700',
      culture: 'bg-purple-100 text-purple-700',
      professional: 'bg-blue-100 text-blue-700',
      hobbies: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" style={{ paddingBottom: `${dynamicPaddingBottom}px` }}>
      <Header />
      <DesktopNav />
      
      <div className="container mx-auto px-4 py-6" ref={contentRef}>
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Circle Header */}
        <Card className="mb-6 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 border-b border-slate-100/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{circle.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`text-xs px-3 py-1 font-medium capitalize ${getCategoryColor(circle.category)}`}>
                      {circle.category || 'General'}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1 border-emerald-300 text-emerald-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{circle.memberCount}</div>
                <div className="text-sm text-slate-600">{circle.memberCount === 1 ? 'member' : 'members'}</div>
              </div>
            </div>
          </CardHeader>
          
          {circle.description && (
            <CardContent className="pt-6">
              <p className="text-slate-700 leading-relaxed">{circle.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Circle Members */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-slate-100/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Circle Members</span>
              </CardTitle>
              
              {/* Name Preference Toggle for Members */}
              {isUserMember && (
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4 h-4 text-gray-500" />
                  <Switch
                    checked={userNamePreference}
                    onCheckedChange={(checked) => {
                      updateNamePreferenceMutation.mutate(checked);
                    }}
                    disabled={updateNamePreferenceMutation.isPending}
                    aria-label="Show full name in this circle"
                  />
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Show my full name</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {membersLoading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                </div>
                <p className="text-gray-600">Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No members visible</h3>
                <p className="text-gray-600">This circle doesn't have any publicly visible members.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member: any) => {
                  const memberUser = member.user || {};
                  // Use global privacy preference with circle-specific override
                  const showFullName = member.showFullName !== undefined ? member.showFullName : (memberUser.showFullName || false);
                  const displayName = formatUserDisplayName(memberUser, showFullName);
                  const fullName = `${memberUser.firstName || ''} ${memberUser.lastName || ''}`.trim();
                  const initials = getNameInitials(fullName);
                  
                  return (
                    <div key={member.id} className="group relative">
                      <Card className="hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={memberUser.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {displayName || 'Unknown User'}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant={member.role === 'admin' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {member.role === 'admin' ? 'Owner' : 'Member'}
                                </Badge>
                                {member.role === 'admin' && (
                                  <Shield className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {memberUser.firstName && memberUser.lastName && (() => {
                            const profileId = getProfileIdByUserId(member.userId);
                            return profileId ? (
                              <div className="mt-3">
                                <Link href={`/profiles/${profileId}`}>
                                  <Button variant="outline" size="sm" className="w-full text-xs">
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            ) : null;
                          })()}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}