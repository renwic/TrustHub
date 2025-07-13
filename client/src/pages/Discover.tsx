import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import SwipeCard from "@/components/SwipeCard";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import Header from "@/components/Header";
import FilterOverlay from "@/components/FilterOverlay";
import MatchModal from "@/components/MatchModal";
import { Heart } from "lucide-react";

export default function Discover() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading: isLoadingProfiles, refetch } = useQuery({
    queryKey: ["/api/profiles/discover"],
    enabled: isAuthenticated,
    retry: false,
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ profileId, action }: { profileId: number; action: string }) => {
      const response = await apiRequest(`/api/profiles/${profileId}/swipe`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        const profile = profiles[currentIndex];
        setMatchedProfile(profile);
      }
      
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      
      // Refetch profiles if we're running low
      if (currentIndex >= profiles.length - 3) {
        refetch();
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
      toast({
        title: "Error",
        description: "Failed to process swipe",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (action: 'like' | 'pass' | 'super_like') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    swipeMutation.mutate({
      profileId: currentProfile.id,
      action,
    });
  };

  const currentProfile = profiles[currentIndex];
  const nextProfiles = profiles.slice(currentIndex + 1, currentIndex + 3);

  if (isLoading || isLoadingProfiles) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Connections</h3>
            <p className="text-gray-600">Discovering amazing people near you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Discover" onOpenFilters={() => setShowFilters(true)} />
        </div>
        
        <main className="p-4 mobile-nav-padding relative z-10">
          <div className="lg:flex lg:items-center lg:justify-center lg:min-h-[600px]">
            <div className="relative h-[calc(100vh-120px)] lg:h-[500px] lg:w-full lg:max-w-md p-6 pb-12">
              {profiles.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No More Profiles</h3>
                    <p className="text-gray-600 mb-6">You've seen everyone in your area for now!</p>
                    <button 
                      onClick={() => refetch()}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg"
                    >
                      Refresh Profiles
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative h-full">
                  {/* Background cards */}
                  {nextProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className="absolute inset-0"
                      style={{
                        zIndex: 2 - index,
                        transform: `scale(${0.96 - index * 0.02}) translateY(${index * 8}px)`,
                        opacity: 0.6 - index * 0.2,
                      }}
                    >
                      <SwipeCard
                        profile={profile}
                        isInteractive={false}
                      />
                    </div>
                  ))}
                  
                  {/* Top interactive card */}
                  {currentProfile && (
                    <div className="absolute inset-0" style={{ zIndex: 10 }}>
                      <SwipeCard
                        key={currentProfile.id}
                        profile={currentProfile}
                        isInteractive={true}
                        onSwipe={handleSwipe}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <BottomNav />

        {showFilters && (
          <FilterOverlay onClose={() => setShowFilters(false)} />
        )}

        {matchedProfile && (
          <MatchModal
            profile={matchedProfile}
            onClose={() => setMatchedProfile(null)}
          />
        )}
      </div>
    </div>
  );
}