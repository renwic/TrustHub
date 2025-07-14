import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, logout } from "@/lib/authUtils";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Ruler, 
  Globe, 
  Bell, 
  Lock, 
  Heart,
  User,
  LogOut,
  Save,
  Shield
} from "lucide-react";
import { 
  getDefaultMeasurementSystem,
  type MeasurementSystem 
} from "@/lib/measurements";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState({
    measurementSystem: getDefaultMeasurementSystem(),
    language: 'en',
    timezone: 'UTC',
    temperatureUnit: 'celsius',
    distanceUnit: 'km',
    weightUnit: 'kg',
    heightUnit: 'cm',
  });

  const [matchPreferences, setMatchPreferences] = useState({
    minAge: 22,
    maxAge: 35,
    maxDistance: 25,
    interestedInGender: 'any',
    minimumRealBar: 50,
    requireProps: false,
    relationshipGoals: [] as string[],
    dealBreakers: [] as string[],
  });

  const { data: userPreferences } = useQuery({
    queryKey: ["/api/preferences/user"],
    retry: false,
  });

  const { data: userMatchPreferences } = useQuery({
    queryKey: ["/api/preferences/match"],
    retry: false,
  });

  // Load user preferences when available
  useEffect(() => {
    if (userPreferences) {
      setPreferences(prev => ({
        ...prev,
        ...userPreferences
      }));
    }
  }, [userPreferences]);

  // Load match preferences when available
  useEffect(() => {
    if (userMatchPreferences) {
      setMatchPreferences(prev => ({
        ...prev,
        ...userMatchPreferences
      }));
    }
  }, [userMatchPreferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/preferences/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preferences/user"] });
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
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMatchPreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/preferences/match", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dating preferences updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preferences/match"] });
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
        description: "Failed to update dating preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleSaveMatchPreferences = () => {
    updateMatchPreferencesMutation.mutate(matchPreferences);
  };

  const handleMeasurementSystemChange = (system: MeasurementSystem) => {
    const units = system === 'imperial' 
      ? { distanceUnit: 'miles', weightUnit: 'lbs', heightUnit: 'ft' }
      : { distanceUnit: 'km', weightUnit: 'kg', heightUnit: 'cm' };
    
    setPreferences(prev => ({
      ...prev,
      measurementSystem: system,
      ...units
    }));
  };

  const updateNamePreferenceMutation = useMutation({
    mutationFn: async (showFullName: boolean) => {
      return apiRequest('/api/user/name-preference', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showFullName }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Name display preference updated successfully!",
      });
      // Refresh user data to get updated preference
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
        description: "Failed to update name preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNamePreferenceChange = (showFullName: boolean) => {
    updateNamePreferenceMutation.mutate(showFullName);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Settings" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
          {/* User Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-600">{user?.email}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Dating Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Dating Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Age Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-600">Minimum Age</Label>
                    <Select 
                      value={matchPreferences.minAge.toString()} 
                      onValueChange={(value) => setMatchPreferences(prev => ({ ...prev, minAge: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 47 }, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Maximum Age</Label>
                    <Select 
                      value={matchPreferences.maxAge.toString()} 
                      onValueChange={(value) => setMatchPreferences(prev => ({ ...prev, maxAge: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 47 }, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Gender Interest */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Interested In</Label>
                <Select 
                  value={matchPreferences.interestedInGender} 
                  onValueChange={(value) => setMatchPreferences(prev => ({ ...prev, interestedInGender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Everyone</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Maximum Distance</Label>
                <div className="space-y-2">
                  <Select 
                    value={matchPreferences.maxDistance.toString()} 
                    onValueChange={(value) => setMatchPreferences(prev => ({ ...prev, maxDistance: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="500">Anywhere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Minimum RealBar */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Minimum RealBar Score</Label>
                <Select 
                  value={matchPreferences.minimumRealBar.toString()} 
                  onValueChange={(value) => setMatchPreferences(prev => ({ ...prev, minimumRealBar: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Score</SelectItem>
                    <SelectItem value="25">25+ (New)</SelectItem>
                    <SelectItem value="50">50+ (Emerging)</SelectItem>
                    <SelectItem value="70">70+ (Trusted)</SelectItem>
                    <SelectItem value="85">85+ (Verified)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Props Requirement */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Require Props</Label>
                  <p className="text-xs text-slate-600">Only show profiles with at least one prop</p>
                </div>
                <Switch
                  checked={matchPreferences.requireProps}
                  onCheckedChange={(checked) => setMatchPreferences(prev => ({ ...prev, requireProps: checked }))}
                />
              </div>

              <Separator />

              <Button 
                onClick={handleSaveMatchPreferences}
                disabled={updateMatchPreferencesMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMatchPreferencesMutation.isPending ? "Saving..." : "Save Dating Preferences"}
              </Button>
            </CardContent>
          </Card>

          {/* Measurement Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="w-5 h-5" />
                <span>Measurement System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Unit System</Label>
                  <p className="text-sm text-slate-600">Choose between metric and imperial units</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs text-slate-600">Metric</Label>
                  <Switch
                    checked={preferences.measurementSystem === 'imperial'}
                    onCheckedChange={(checked) => handleMeasurementSystemChange(checked ? 'imperial' : 'metric')}
                  />
                  <Label className="text-xs text-slate-600">Imperial</Label>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Height</Label>
                  <p className="text-xs text-slate-600">{preferences.heightUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Weight</Label>
                  <p className="text-xs text-slate-600">{preferences.weightUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Distance</Label>
                  <p className="text-xs text-slate-600">{preferences.distanceUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Temperature</Label>
                  <p className="text-xs text-slate-600">
                    {preferences.measurementSystem === 'imperial' ? 'Fahrenheit' : 'Celsius'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localization Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Localization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Language</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Match Notifications</Label>
                  <p className="text-sm text-slate-600">Get notified when you have new matches</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Message Notifications</Label>
                  <p className="text-sm text-slate-600">Get notified about new messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Props Notifications</Label>
                  <p className="text-sm text-slate-600">Get notified when you receive new props</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show Distance</Label>
                  <p className="text-sm text-slate-600">Display your distance to other users</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show Online Status</Label>
                  <p className="text-sm text-slate-600">Let others see when you're active</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show Full Name</Label>
                  <p className="text-sm text-slate-600">Show your full last name instead of just the first initial</p>
                </div>
                <Switch 
                  checked={user?.showFullName || false}
                  onCheckedChange={handleNamePreferenceChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Show RealBar Score</Label>
                  <p className="text-sm text-slate-600">Display your RealBar score on your profile</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex space-x-4 mb-6">
            <Button 
              onClick={handleSavePreferences}
              disabled={updatePreferencesMutation.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {/* Admin Section - Only show for administrators */}
          {user?.role === 'administrator' && (
            <Card className="mb-6 border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Shield className="w-5 h-5" />
                  <span>Administrator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-orange-700">
                  You have administrator privileges on this platform.
                </p>
                <Button 
                  onClick={() => window.location.href = "/admin"}
                  className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}