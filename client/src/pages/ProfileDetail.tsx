import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";

import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, X, Star, MapPin, User, Flag, MoreVertical, Users, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { formatUserDisplayName, formatNameWithInitials } from "@/lib/nameUtils";

export default function ProfileDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [dynamicPaddingBottom, setDynamicPaddingBottom] = useState(120);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Circle invitation state
  const [isCircleInviteDialogOpen, setIsCircleInviteDialogOpen] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  
  // Props display state
  const [showAllProps, setShowAllProps] = useState(false);
  const [isPropsCollapsed, setIsPropsCollapsed] = useState(false);
  
  // Props circle state
  const [isPropsCircleVisible, setIsPropsCircleVisible] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  // Query to get available profiles for navigation
  const { data: availableProfiles = [] } = useQuery({
    queryKey: ["/api/profiles/discover"],
    retry: false,
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: [`/api/profiles/${id}`],
    retry: false,
  });

  // Check if the current user is viewing their own profile
  const isOwnProfile = user && profile && profile.userId === user.id;

  // Fetch user's circles for invitation
  const { data: userCircles = [] } = useQuery({
    queryKey: ["/api/circles"],
    retry: false,
    enabled: !!user && !isOwnProfile, // Only fetch if logged in and viewing someone else's profile
  });

  // Fetch props givers for dynamic circle
  const { data: propsGivers = [] } = useQuery({
    queryKey: [`/api/profiles/${id}/props-givers`],
    retry: false,
    enabled: !!id && !!profile, // Only fetch if profile ID is available
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ action }: { action: string }) => {
      const response = await apiRequest("POST", "/api/swipes", {
        swipedId: parseInt(id!),
        action,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.match) {
        toast({
          title: "It's a Match! 🎉",
          description: "You both liked each other!",
        });
        setLocation("/");
      } else {
        if (variables.action === 'like') {
          toast({
            title: "Liked!",
            description: "Your like has been sent",
          });
          setLocation("/");
        } else {
          const currentProfileIndex = availableProfiles.findIndex((p: any) => p.id === parseInt(id!));
          const nextProfile = availableProfiles[currentProfileIndex + 1];
          
          if (nextProfile) {
            toast({
              title: "Passed",
              description: "Moving to next profile",
            });
            setLocation(`/profiles/${nextProfile.id}`);
          } else {
            toast({
              title: "No More Profiles",
              description: "Returning to discover page",
            });
            setLocation("/");
          }
        }
      }
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
      
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes("Already swiped")) {
        toast({
          title: "Already Reviewed",
          description: "You've already made a decision on this profile",
          variant: "destructive",
        });
        const currentProfileIndex = availableProfiles.findIndex((p: any) => p.id === parseInt(id!));
        const nextProfile = availableProfiles[currentProfileIndex + 1];
        
        setTimeout(() => {
          if (nextProfile) {
            setLocation(`/profiles/${nextProfile.id}`);
          } else {
            setLocation("/");
          }
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: "Failed to process action",
          variant: "destructive",
        });
      }
    },
  });

  // Report user mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reports", {
        contentType: "profile",
        contentId: id,
        reason: reportReason,
        description: reportDescription,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe. We'll review this report.",
      });
      setIsReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
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
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Encourage props mutation
  const encouragePropsMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await apiRequest("POST", "/api/encourage-props", {
        profileId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Encouragement Sent!",
        description: `${formatUserDisplayName(profile)} will be notified that you think they should get props.`,
      });
      // Refresh notifications count in case the user has their own notifications
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
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
      if (error.message.includes("You cannot encourage props for your own profile")) {
        toast({
          title: "Not Allowed",
          description: "You can't encourage props for your own profile. Try inviting friends to give you props instead!",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send encouragement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReport = () => {
    if (!reportReason) {
      toast({
        title: "Missing Information",
        description: "Please select a reason for reporting this profile.",
        variant: "destructive",
      });
      return;
    }
    reportMutation.mutate();
  };

  // Circle invitation mutation
  const circleInviteMutation = useMutation({
    mutationFn: async ({ circleId, invitedUserId, message }: { 
      circleId: number; 
      invitedUserId: string; 
      message: string; 
    }) => {
      const response = await apiRequest("POST", `/api/circles/${circleId}/invitations`, {
        inviteeId: invitedUserId,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: "Your circle invitation has been sent successfully.",
      });
      setIsCircleInviteDialogOpen(false);
      setSelectedCircleId("");
      setInviteMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/circle-invitations"] });
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
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendCircleInvitation = () => {
    if (!selectedCircleId || !profile?.userId) return;
    
    circleInviteMutation.mutate({
      circleId: parseInt(selectedCircleId),
      invitedUserId: profile.userId,
      message: inviteMessage,
    });
  };

  // Calculate dynamic spacing based on content height
  useEffect(() => {
    const calculateSpacing = () => {
      if (contentRef.current) {
        const windowHeight = window.innerHeight;
        const actionButtonsHeight = 80; // Actual height of action buttons container
        const bottomNavHeight = 128; // Actual height of bottom navigation
        
        // Calculate minimal padding needed to clear fixed elements
        const requiredClearance = actionButtonsHeight + bottomNavHeight;
        
        // Very minimal spacing buffer between content and buttons
        const spacingBuffer = 8; // 0.5rem for tight but usable spacing
        
        // Calculate optimal padding with aggressive compactness
        let paddingValue = requiredClearance + spacingBuffer;
        
        // Check if content needs additional clearance
        const contentRect = contentRef.current.getBoundingClientRect();
        const contentBottom = contentRect.bottom;
        const actionButtonsTop = windowHeight - requiredClearance;
        
        if (contentBottom > actionButtonsTop) {
          // Add only essential padding for accessibility
          const additionalPadding = Math.max(0, (contentBottom - actionButtonsTop) * 0.6 + spacingBuffer);
          paddingValue += additionalPadding;
        }
        
        // Very tight bounds for compact layout
        paddingValue = Math.max(120, Math.min(paddingValue, 200));
        
        console.log('Optimized spacing calculation:', {
          windowHeight,
          requiredClearance,
          spacingBuffer,
          finalPadding: paddingValue,
          contentBottom,
          actionButtonsTop
        });
        
        setDynamicPaddingBottom(paddingValue);
      }
    };

    // Calculate on initial load and content changes
    if (profile) {
      setTimeout(calculateSpacing, 100); // Small delay to ensure content is rendered
    }

    // Recalculate on window resize
    window.addEventListener('resize', calculateSpacing);
    return () => window.removeEventListener('resize', calculateSpacing);
  }, [profile, profile?.testimonials?.length, profile?.interests?.length]);



  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-slate-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-slate-600">Profile not found</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="mt-4"
            >
              Back to Trust Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="relative bg-white min-h-screen">
          <div className="overflow-y-auto lg:pb-4">
            {/* Profile Header */}
            <div className="relative h-96">
              {!imageError && profile.photos && profile.photos.length > 0 ? (
                <img
                  src={profile.photos[currentImageIndex]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <User className="w-20 h-20 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Back Button */}
              <button 
                className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Report Button */}
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <button className="absolute top-16 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Flag className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report User</DialogTitle>
                    <DialogDescription>
                      Help us keep the community safe by reporting inappropriate behavior or content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for reporting</Label>
                      <Select value={reportReason} onValueChange={setReportReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inappropriate_content">Inappropriate content</SelectItem>
                          <SelectItem value="fake_profile">Fake profile</SelectItem>
                          <SelectItem value="harassment">Harassment or bullying</SelectItem>
                          <SelectItem value="spam">Spam or promotional content</SelectItem>
                          <SelectItem value="scam">Scam or fraudulent activity</SelectItem>
                          <SelectItem value="underage">Underage user</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Additional details (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide any additional context that would help us review this report..."
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsReportDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReport}
                        disabled={reportMutation.isPending || !reportReason}
                        className="flex-1"
                      >
                        {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {profile.relationshipStatus}
              </div>

              {/* Profile Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{formatUserDisplayName(profile)}</h1>
                  <span className="text-2xl">{profile.age}</span>
                </div>
                <div className="flex items-center space-x-4 mb-3">
                  {profile.rating && (
                    <div className="flex items-center space-x-1">
                      <Heart className="text-red-400 w-4 h-4 fill-current" />
                      <span>{profile.rating.toFixed(1)}</span>
                      <span className="opacity-70">({profile.testimonials?.length || 0} props)</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                {profile.bio && (
                  <p className="opacity-90">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div ref={contentRef} className="px-6 pt-6 pb-2 space-y-3" style={{ paddingBottom: `${dynamicPaddingBottom}px` }}>
              {/* About Section */}
              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About {formatUserDisplayName(profile)}</h3>
                  <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {profile.interests?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Props Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setIsPropsCollapsed(!isPropsCollapsed)}
                    className="flex items-center space-x-2 text-lg font-semibold hover:text-primary transition-colors"
                  >
                    <h3>Props</h3>
                    {isPropsCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  {profile.testimonials?.length > 0 ? (
                    <Link to={`/profiles/${profile.id}/vouches`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary hover:bg-primary hover:text-white"
                      >
                        View All ({profile.testimonials.length})
                      </Button>
                    </Link>
                  ) : !isOwnProfile ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary hover:bg-primary hover:text-white"
                        >
                          Encourage Props
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Help {formatUserDisplayName(profile)} Get Props</DialogTitle>
                          <DialogDescription>
                            {formatUserDisplayName(profile)} doesn't have any props yet. Help them build their reputation by encouraging friends, family, or colleagues who know them to give props.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Why Props Matter</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Props show authentic character references from real people</li>
                              <li>• They help build trust and credibility in the dating community</li>
                              <li>• People with props get better matches and connections</li>
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm text-slate-600">
                              You could suggest that {formatUserDisplayName(profile)}:
                            </p>
                            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                              <p className="font-medium mb-1">Ask trusted people to give props:</p>
                              <ul className="space-y-1 ml-4">
                                <li>• Close friends who know their character</li>
                                <li>• Family members who can vouch for them</li>
                                <li>• Colleagues or classmates</li>
                                <li>• People they've helped or volunteered with</li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {}}
                              className="flex-1"
                            >
                              Close
                            </Button>
                            <Button
                              onClick={() => {
                                encouragePropsMutation.mutate(profile.id);
                              }}
                              disabled={encouragePropsMutation.isPending}
                              className="flex-1"
                            >
                              {encouragePropsMutation.isPending ? "Sending..." : "I'll Suggest This"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-sm text-slate-500 italic">
                      Your profile
                    </span>
                  )}
                </div>
                
                {/* Collapsible Props Content */}
                {!isPropsCollapsed && (
                  <div className="mt-2">
                    {profile.testimonials?.length > 0 ? (
                      <div className="space-y-4">
                        {/* Props count and toggle */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600">
                            {profile.testimonials.length} {profile.testimonials.length === 1 ? 'person' : 'people'} gave {formatUserDisplayName(profile)} props
                          </p>
                          {profile.testimonials.length > 4 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllProps(!showAllProps)}
                              className="text-primary hover:text-primary-dark"
                            >
                              {showAllProps ? 'Show Less' : `Show All (${profile.testimonials.length})`}
                            </Button>
                          )}
                        </div>

                        {/* Props display */}
                        <div className="space-y-3">
                          {(showAllProps ? profile.testimonials : profile.testimonials.slice(0, 4)).map((testimonial: any, index: number) => (
                            <div key={testimonial.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {testimonial.authorName?.charAt(0) || 'A'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{formatNameWithInitials(testimonial.authorName || 'Anonymous', false)}</p>
                                    <p className="text-xs text-slate-500">{testimonial.relationship || 'Friend'}</p>
                                  </div>
                                </div>
                                {testimonial.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                                    <span className="text-sm font-medium text-slate-700">{testimonial.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              {testimonial.content && (
                                <p className="text-sm text-slate-600 italic mb-2 line-clamp-4">"{testimonial.content}"</p>
                              )}

                            </div>
                          ))}
                        </div>


                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="w-4 h-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-800">No Props Yet</p>
                        </div>
                        <p className="text-sm text-amber-700">
                          {formatUserDisplayName(profile)} hasn't received any props yet. Props are personal recommendations from friends, family, and colleagues that help build trust and show authentic character.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Props Circle - Dynamic Circle showing props givers */}
              {propsGivers && propsGivers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100/80 overflow-hidden backdrop-blur-sm">
                  <div className="relative">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-pink-50/80 via-red-50/80 to-rose-50/80 px-6 py-5 border-b border-slate-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-sm">
                            <Heart className="w-5 h-5 text-white fill-current" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Props Circle</h3>
                            <p className="text-sm text-slate-600 mt-0.5">People who gave {formatUserDisplayName(profile)} props</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPropsCircleVisible(!isPropsCircleVisible)}
                            className="text-slate-600 hover:text-slate-800 hover:bg-white/50"
                          >
                            {isPropsCircleVisible ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Show
                              </>
                            )}
                          </Button>
                          <div className="px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <span className="text-sm font-medium text-slate-700">
                              {propsGivers.length} {propsGivers.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Props Circle Content */}
                    {isPropsCircleVisible && (
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {propsGivers.map((giver: any, index: number) => (
                            <div key={giver.id} className="group relative bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-xl p-4 hover:shadow-md hover:border-slate-300/50 transition-all duration-300">
                              <div className="flex flex-col items-center space-y-3">
                                {/* Profile Picture */}
                                <div className="relative">
                                  {giver.profileImageUrl ? (
                                    <img
                                      src={giver.profileImageUrl}
                                      alt={giver.authorName || 'Anonymous'}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                      {giver.initials}
                                    </div>
                                  )}
                                  
                                  {/* Rating badge */}
                                  {giver.rating && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 border border-slate-200 shadow-sm">
                                      <div className="flex items-center space-x-0.5">
                                        <Heart className="w-3 h-3 text-red-400 fill-current" />
                                        <span className="text-xs font-medium text-slate-700">
                                          {giver.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* User Info */}
                                <div className="text-center min-w-0 w-full">
                                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                    {formatNameWithInitials(giver.authorName || 'Anonymous', false)}
                                  </h4>
                                  <p className="text-xs text-slate-500 capitalize">
                                    {giver.relationship || 'Friend'}
                                  </p>
                                  <div className="mt-1">
                                    <span className="text-xs text-slate-400">
                                      {new Date(giver.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Hover tooltip with content preview */}
                              {giver.content && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 max-w-48">
                                  <div className="line-clamp-3">"{giver.content}"</div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Show message if no one gave props yet */}
                        {propsGivers.length === 0 && (
                          <div className="text-center py-8">
                            <div className="p-3 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <Heart className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-sm font-medium text-slate-700 mb-2">No Props Yet</h4>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                              {formatUserDisplayName(profile)} hasn't received any props yet. Be the first to give them props!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Circles Section - Enhanced Design */}
              {profile.circles && profile.circles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100/80 overflow-hidden backdrop-blur-sm">
                  <div className="relative">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 px-6 py-5 border-b border-slate-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-sm">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Circles</h3>
                            <p className="text-sm text-slate-600 mt-0.5">Social connections & communities</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                            <span className="text-sm font-medium text-slate-700">
                              {profile.circles.length} {profile.circles.length === 1 ? 'circle' : 'circles'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Circles Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {profile.circles.map((circle: any, index: number) => {
                          // Circle is clickable if it's public and shows members
                          const isClickable = !circle.isPrivate && circle.canViewMembers !== false;
                          
                          const CircleCard = ({ children }: { children: React.ReactNode }) => {
                            if (isClickable) {
                              return (
                                <Link href={`/circles/${circle.id}`}>
                                  <div className="group relative bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-xl p-5 hover:shadow-md hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                                    {children}
                                  </div>
                                </Link>
                              );
                            }
                            return (
                              <div className="group relative bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-xl p-5 hover:shadow-md hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-0.5">
                                {children}
                              </div>
                            );
                          };

                          return (
                            <CircleCard key={circle.id}>
                            {/* Circle card content */}
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-semibold text-slate-900 line-clamp-1 group-hover:text-slate-800 transition-colors">
                                    {circle.name}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs px-2.5 py-1 font-medium capitalize ${
                                        circle.category === 'general' ? 'bg-slate-100 text-slate-700' :
                                        circle.category === 'adventure' ? 'bg-emerald-100 text-emerald-700' :
                                        circle.category === 'fitness' ? 'bg-orange-100 text-orange-700' :
                                        circle.category === 'food' ? 'bg-yellow-100 text-yellow-700' :
                                        circle.category === 'culture' ? 'bg-purple-100 text-purple-700' :
                                        circle.category === 'professional' ? 'bg-blue-100 text-blue-700' :
                                        circle.category === 'hobbies' ? 'bg-pink-100 text-pink-700' :
                                        'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {circle.category || 'General'}
                                    </Badge>
                                    {circle.isPrivate && (
                                      <Badge variant="outline" className="text-xs px-2 py-0.5 border-slate-300 text-slate-600">
                                        Private
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {circle.description && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                                  {circle.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-slate-500">
                                  <div className="p-1.5 bg-slate-100 rounded-lg">
                                    <Users className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {circle.canViewMembers !== false ? (
                                      `${circle.memberCount} ${circle.memberCount === 1 ? 'member' : 'members'}`
                                    ) : (
                                      'Private members'
                                    )}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-slate-500 font-medium">Active</span>
                                </div>
                              </div>
                            </div>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Clickable indicator for public circles */}
                            {isClickable && (
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="p-1 bg-blue-500/20 rounded-full">
                                  <ArrowLeft className="w-3 h-3 text-blue-600 rotate-180" />
                                </div>
                              </div>
                            )}
                            </CircleCard>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


            
            {/* Action Buttons - Only show for other people's profiles */}
            {!isOwnProfile && (
              <div className="fixed bottom-32 lg:bottom-20 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-100/50 p-4 lg:pb-6 z-20">
                <div className="max-w-md lg:max-w-4xl mx-auto">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 py-3 border-2 border-slate-300/50 text-slate-600 hover:bg-slate-50/60 bg-white/50 backdrop-blur-md"
                      onClick={() => swipeMutation.mutate({ action: 'pass' })}
                      disabled={swipeMutation.isPending}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Pass
                    </Button>
                    
                    {/* Circle Invitation Button */}
                    {userCircles.length > 0 && (
                      <Dialog open={isCircleInviteDialogOpen} onOpenChange={setIsCircleInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            className="flex-1 py-3 border-2 border-purple-300/50 text-purple-600 hover:bg-purple-50/60 bg-white/50 backdrop-blur-md"
                          >
                            <Users className="w-5 h-5 mr-2" />
                            Invite to Circle
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite {profile.name} to Circle</DialogTitle>
                            <DialogDescription>
                              Choose one of your circles to invite {profile.name} to join
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="circle">Select Circle</Label>
                              <Select value={selectedCircleId} onValueChange={setSelectedCircleId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a circle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {userCircles.map((circle: any) => (
                                    <SelectItem key={circle.id} value={circle.id.toString()}>
                                      {circle.name} ({circle.memberCount} members)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                              <Textarea
                                id="inviteMessage"
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                placeholder={`Hi ${profile.name}, I'd love to have you join my circle!`}
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsCircleInviteDialogOpen(false);
                                  setSelectedCircleId("");
                                  setInviteMessage("");
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSendCircleInvitation}
                                disabled={circleInviteMutation.isPending || !selectedCircleId}
                                className="flex-1"
                              >
                                {circleInviteMutation.isPending ? "Sending..." : "Send Invitation"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <Button 
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500/60 to-rose-500/60 text-white hover:shadow-lg backdrop-blur-md hover:from-pink-500/70 hover:to-rose-500/70"
                      onClick={() => swipeMutation.mutate({ action: 'like' })}
                      disabled={swipeMutation.isPending}
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
        <BottomNav />
      </div>
    </div>
  );
}