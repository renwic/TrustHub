import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DesktopNav from "@/components/DesktopNav";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function BrowseTest() {
  console.log("BrowseTest component rendering");
  
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/profiles/discover"],
    retry: false,
  });

  console.log("Profiles data:", profiles);

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-6xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Browse Test" />
        </div>
      
        <main className="p-4 mobile-nav-padding">
          <h1 className="text-2xl font-bold mb-4">Browse Test Page</h1>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Information:</h2>
            <p>Loading: {profilesLoading ? "Yes" : "No"}</p>
            <p>Profiles count: {profiles.length}</p>
            <p>Component rendered successfully</p>
          </div>

          {profilesLoading ? (
            <div className="text-center py-8">
              <p>Loading profiles...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Profiles ({profiles.length})</h2>
              {profiles.slice(0, 3).map((profile: any) => (
                <div key={profile.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.age} • {profile.location}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}