import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, LogOut, Edit, Save, X, Camera, Shield, Star, Heart, Upload, Ruler, Weight, ArrowUp, ArrowDown, Crown, Trash2, Plus } from "lucide-react";
import { insertProfileSchema } from "@shared/schema";
import PopRepScore from "@/components/PopRepScore";
import { 
  formatHeight, 
  formatWeight, 
  getDefaultMeasurementSystem, 
  getUnitsForSystem, 
  getHeightOptions, 
  getWeightOptions,
  parseHeight,
  type MeasurementSystem,
  type HeightUnit,
  type WeightUnit
} from "@/lib/measurements";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(getDefaultMeasurementSystem());
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bio: "",
    interests: "",
    location: "",
    relationshipStatus: "Solo",
    photos: [] as string[],
    height: "",
    weight: "",
    measurementSystem: measurementSystem,
    education: "",
    occupation: "",
    religion: "",
    drinking: "",
    smoking: "",
    lookingFor: "",
  });

  const [isManagingPhotos, setIsManagingPhotos] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Update form data when measurement system changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      measurementSystem
    }));
  }, [measurementSystem]);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/profiles", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile creation error:", error);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/profiles/${userData?.profile?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (userData?.profile) {
      const profile = userData.profile;
      const profileMeasurementSystem = (profile.measurementSystem as MeasurementSystem) || getDefaultMeasurementSystem();
      setMeasurementSystem(profileMeasurementSystem);
      
      setFormData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        bio: profile.bio || "",
        interests: profile.interests?.join(", ") || "",
        location: profile.location || "",
        relationshipStatus: profile.relationshipStatus || "Solo",
        photos: profile.photos || [],
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        measurementSystem: profileMeasurementSystem,
        education: profile.education || "",
        occupation: profile.occupation || "",
        religion: profile.religion || "",
        drinking: profile.drinking || "",
        smoking: profile.smoking || "",
        lookingFor: profile.lookingFor || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.age || isNaN(parseInt(formData.age))) {
        toast({
          title: "Error",
          description: "Valid age is required",
          variant: "destructive",
        });
        return;
      }

      const data = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        bio: formData.bio.trim(),
        interests: formData.interests.split(",").map(i => i.trim()).filter(Boolean),
        location: formData.location.trim(),
        relationshipStatus: formData.relationshipStatus,
        photos: formData.photos,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        measurementSystem: formData.measurementSystem,
        education: formData.education.trim(),
        occupation: formData.occupation.trim(),
        religion: formData.religion.trim(),
        drinking: formData.drinking,
        smoking: formData.smoking,
        lookingFor: formData.lookingFor,
      };

      console.log("Saving profile with data:", data);

      if (userData?.profile) {
        updateProfileMutation.mutate(data);
      } else {
        createProfileMutation.mutate(data);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Please check your input data",
        variant: "destructive",
      });
    }
  };

  const calculateProfileCompleteness = () => {
    if (!userData?.profile) return 0;
    const profile = userData.profile;
    let completed = 0;
    const totalFields = 13; // Added weight field
    
    if (profile.name) completed++;
    if (profile.age) completed++;
    if (profile.bio) completed++;
    if (profile.interests?.length > 0) completed++;
    if (profile.location) completed++;
    if (profile.photos?.length > 0) completed++;
    if (profile.height) completed++;
    if (profile.weight) completed++;
    if (profile.education) completed++;
    if (profile.occupation) completed++;
    if (profile.religion) completed++;
    if (profile.drinking) completed++;
    if (profile.smoking) completed++;
    
    return Math.round((completed / totalFields) * 100);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || formData.photos.length >= 6) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Compress and convert to base64 for preview and storage
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 800px on longest side)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, compressedDataUrl]
      }));
    };
    
    img.src = URL.createObjectURL(file);

    // Reset the input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Create a fake event to reuse the existing upload logic
      const fakeEvent = {
        target: { files: [file], value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(fakeEvent);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    
    // Adjust main photo index if needed
    if (index === mainPhotoIndex) {
      setMainPhotoIndex(0);
    } else if (index < mainPhotoIndex) {
      setMainPhotoIndex(mainPhotoIndex - 1);
    }
  };

  const updatePhotoUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map((photo, i) => i === index ? url : photo)
    }));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      const [movedPhoto] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, movedPhoto);
      
      return {
        ...prev,
        photos: newPhotos
      };
    });
    
    // Update main photo index if it was moved
    if (fromIndex === mainPhotoIndex) {
      setMainPhotoIndex(toIndex);
    } else if (fromIndex < mainPhotoIndex && toIndex >= mainPhotoIndex) {
      setMainPhotoIndex(mainPhotoIndex - 1);
    } else if (fromIndex > mainPhotoIndex && toIndex <= mainPhotoIndex) {
      setMainPhotoIndex(mainPhotoIndex + 1);
    }
  };

  const setAsMainPhoto = (index: number) => {
    // Move the selected photo to the front
    if (index !== 0) {
      movePhoto(index, 0);
    }
    setMainPhotoIndex(0);
  };

  const savePhotosMutation = useMutation({
    mutationFn: async (photos: string[]) => {
      console.log("Saving photos mutation:", {
        profileId: userData.profile.id,
        photosCount: photos.length,
        firstPhotoPrefix: photos[0]?.substring(0, 50) || 'none',
        totalSize: JSON.stringify({ photos }).length
      });
      
      const response = await apiRequest("PATCH", `/api/profiles/${userData.profile.id}`, { photos });
      console.log("Photos save response:", response.status, response.statusText);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photos updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsManagingPhotos(false);
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
      
      let errorMessage = "Failed to update photos. Please try again.";
      if (error.message.includes('entity too large') || error.message.includes('PayloadTooLarge')) {
        errorMessage = "Image file is too large. Please use images smaller than 5MB or try compressing them.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

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

  return (
    <div className="bg-white min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto relative overflow-hidden">
        <div className="lg:hidden">
          <Header title="Profile" />
        </div>
        
        <main className="p-4 mobile-nav-padding">
        {/* User Info */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-slate-600">{user?.email}</p>
            {userData?.profile && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Profile Completeness</span>
                  <span className="text-sm font-medium text-slate-800">{calculateProfileCompleteness()}%</span>
                </div>
                <Progress value={calculateProfileCompleteness()} className="h-2" />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Dating Profile */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dating Profile</CardTitle>
            {!isEditing ? (
              <div className="flex space-x-2">
                {userData?.profile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = `/profiles/${userData.profile.id}`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!userData?.profile && !isEditing ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Complete your dating profile to start matching!</p>
                <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-primary to-secondary">
                  Create Profile
                </Button>
              </div>
            ) : isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Your age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Interests</label>
                  <Input
                    value={formData.interests}
                    onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                    placeholder="Photography, hiking, coffee (comma separated)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Your city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Relationship Status</label>
                  <Select value={formData.relationshipStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Explorers">Explorers</SelectItem>
                      <SelectItem value="Potentials">Potentials</SelectItem>
                      <SelectItem value="Warm Sparks">Warm Sparks</SelectItem>
                      <SelectItem value="On Deck">On Deck</SelectItem>
                      <SelectItem value="Committed">Committed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Measurement System Toggle */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-slate-600" />
                      <Label className="text-sm font-medium">Measurement System</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-slate-600">Metric</Label>
                      <Switch
                        checked={measurementSystem === 'imperial'}
                        onCheckedChange={(checked) => setMeasurementSystem(checked ? 'imperial' : 'metric')}
                      />
                      <Label className="text-xs text-slate-600">Imperial</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Height {measurementSystem === 'metric' ? '(cm)' : '(ft/in)'}
                      </Label>
                      <Select 
                        value={formData.height} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={measurementSystem === 'metric' ? "Select height" : "Select height"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getHeightOptions(getUnitsForSystem(measurementSystem).height).map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">
                        Weight {measurementSystem === 'metric' ? '(kg)' : '(lbs)'}
                      </Label>
                      <Select 
                        value={formData.weight} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, weight: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={measurementSystem === 'metric' ? "Select weight" : "Select weight"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getWeightOptions(getUnitsForSystem(measurementSystem).weight).map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Education</label>
                  <Input
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="University, degree"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Occupation</label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Your job title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Religion</label>
                  <Select value={formData.religion} onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Muslim">Muslim</SelectItem>
                      <SelectItem value="Jewish">Jewish</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Atheist">Atheist</SelectItem>
                      <SelectItem value="Agnostic">Agnostic</SelectItem>
                      <SelectItem value="Spiritual">Spiritual</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Drinking</label>
                  <Select value={formData.drinking} onValueChange={(value) => setFormData(prev => ({ ...prev, drinking: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drinking preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                      <SelectItem value="Socially">Socially</SelectItem>
                      <SelectItem value="Regularly">Regularly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Smoking</label>
                  <Select value={formData.smoking} onValueChange={(value) => setFormData(prev => ({ ...prev, smoking: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select smoking preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Occasionally">Occasionally</SelectItem>
                      <SelectItem value="Socially">Socially</SelectItem>
                      <SelectItem value="Regularly">Regularly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Looking For</label>
                  <Select value={formData.lookingFor} onValueChange={(value) => setFormData(prev => ({ ...prev, lookingFor: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long-term relationship">Long-term relationship</SelectItem>
                      <SelectItem value="Short-term relationship">Short-term relationship</SelectItem>
                      <SelectItem value="Casual dating">Casual dating</SelectItem>
                      <SelectItem value="Friends">Friends</SelectItem>
                      <SelectItem value="Marriage">Marriage</SelectItem>
                      <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-slate-800">{userData.profile.name}, {userData.profile.age}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {userData.profile.relationshipStatus}
                    </Badge>
                    {userData.profile.verified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {userData.profile.bio && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">About</h4>
                    <p className="text-slate-600">{userData.profile.bio}</p>
                  </div>
                )}
                
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {userData.profile.height && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Height</h4>
                      <p className="text-slate-600">
                        {formatHeight(
                          userData.profile.height, 
                          (userData.profile.measurementSystem === 'imperial' ? 'ft' : 'cm') as HeightUnit
                        )}
                      </p>
                    </div>
                  )}
                  
                  {userData.profile.weight && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Weight</h4>
                      <p className="text-slate-600">
                        {formatWeight(
                          userData.profile.weight, 
                          (userData.profile.measurementSystem === 'imperial' ? 'lbs' : 'kg') as WeightUnit
                        )}
                      </p>
                    </div>
                  )}
                  
                  {userData.profile.education && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Education</h4>
                      <p className="text-slate-600">{userData.profile.education}</p>
                    </div>
                  )}
                  
                  {userData.profile.occupation && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Occupation</h4>
                      <p className="text-slate-600">{userData.profile.occupation}</p>
                    </div>
                  )}
                  
                  {userData.profile.location && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Location</h4>
                      <p className="text-slate-600">{userData.profile.location}</p>
                    </div>
                  )}
                </div>
                
                {/* Lifestyle Preferences */}
                <div className="grid grid-cols-2 gap-4">
                  {userData.profile.religion && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Religion</h4>
                      <p className="text-slate-600">{userData.profile.religion}</p>
                    </div>
                  )}
                  
                  {userData.profile.drinking && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Drinking</h4>
                      <p className="text-slate-600">{userData.profile.drinking}</p>
                    </div>
                  )}
                  
                  {userData.profile.smoking && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Smoking</h4>
                      <p className="text-slate-600">{userData.profile.smoking}</p>
                    </div>
                  )}
                  
                  {userData.profile.lookingFor && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">Looking For</h4>
                      <p className="text-slate-600">{userData.profile.lookingFor}</p>
                    </div>
                  )}
                </div>
                
                {userData.profile.interests?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {userData.profile.interests.map((interest: string, index: number) => (
                        <Badge key={index} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Statistics */}
        {userData?.profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Profile Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{userData.profile.rating?.toFixed(1) || "0.0"}</p>
                  <p className="text-sm text-slate-600">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{userData.profile.reviewCount || 0}</p>
                  <p className="text-sm text-slate-600">Props</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{calculateProfileCompleteness()}%</p>
                  <p className="text-sm text-slate-600">Complete</p>
                </div>
              </div>
              <PopRepScore profileId={userData.profile.id} showDetails={true} />
            </CardContent>
          </Card>
        )}

        {/* Photo Gallery Management */}
        {userData?.profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Photos ({formData.photos.length}/6)
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsManagingPhotos(!isManagingPhotos)}
                >
                  {isManagingPhotos ? "Cancel" : "Manage Photos"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Photo Display Section */}
              {!isManagingPhotos && formData.photos.length > 0 && (
                <div className="space-y-4">
                  {/* Main Profile Photo */}
                  <div className="relative">
                    <div className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Main Profile Photo
                    </div>
                    <div className="relative group aspect-square w-full max-w-xs mx-auto">
                      <img
                        src={formData.photos[0]}
                        alt="Main profile photo"
                        className="w-full h-full object-cover rounded-lg border-2 border-yellow-200"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Main
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Additional Photos Grid */}
                  {formData.photos.length > 1 && (
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-2">
                        Additional Photos ({formData.photos.length - 1})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.photos.slice(1).map((photo, index) => (
                          <div key={index + 1} className="relative aspect-square">
                            <img
                              src={photo}
                              alt={`Profile photo ${index + 2}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-1 right-1">
                              <span className="text-xs bg-black bg-opacity-50 text-white px-1 rounded">
                                {index + 2}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!isManagingPhotos && formData.photos.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="mb-2">No photos added yet</p>
                  <p className="text-sm">Add photos to make your profile more appealing</p>
                </div>
              )}
              {isManagingPhotos ? (
                <div className="space-y-4">
                  {/* Add New Photo - File Upload Only */}
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label 
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragOver 
                              ? 'border-primary bg-primary/10' 
                              : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`w-8 h-8 mb-2 ${isDragOver ? 'text-primary' : 'text-slate-400'}`} />
                            <p className="mb-2 text-sm text-slate-500">
                              <span className="font-semibold">
                                {isDragOver ? 'Drop image here' : 'Click to upload'}
                              </span> 
                              {!isDragOver && ' or drag and drop'}
                            </p>
                            <p className="text-xs text-slate-500">JPG, PNG, WebP (MAX 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={formData.photos.length >= 6}
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Upload images directly from your device. Maximum 6 photos.
                    </p>
                  </div>
                  
                  {/* Current Photos - Edit Mode with Enhanced Controls */}
                  {formData.photos.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        Current Photos - Organize & Edit
                      </div>
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border-l-4 border-l-transparent hover:border-l-primary transition-colors">
                            
                            {/* Photo Preview */}
                            <div className="relative w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                              {index === 0 && (
                                <div className="absolute -top-1 -right-1">
                                  <Crown className="h-4 w-4 text-yellow-500 bg-white rounded-full p-0.5" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-0.5">
                                {index === 0 ? 'Main' : `#${index + 1}`}
                              </div>
                            </div>

                            {/* URL Editor */}
                            <Input
                              value={photo}
                              onChange={(e) => updatePhotoUrl(index, e.target.value)}
                              placeholder="Photo URL"
                              className="flex-1"
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1">
                              {/* Set as Main Photo */}
                              {index !== 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAsMainPhoto(index)}
                                  title="Set as main photo"
                                  className="h-8 w-8 p-0"
                                >
                                  <Crown className="h-3 w-3" />
                                </Button>
                              )}

                              {/* Move Up */}
                              {index > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => movePhoto(index, index - 1)}
                                  title="Move up"
                                  className="h-8 w-8 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                              )}

                              {/* Move Down */}
                              {index < formData.photos.length - 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => movePhoto(index, index + 1)}
                                  title="Move down"
                                  className="h-8 w-8 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              )}

                              {/* Delete Photo */}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removePhoto(index)}
                                title="Delete photo"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Main Photo Indicator */}
                          {index === 0 && (
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-r-md border border-yellow-200">
                                <Crown className="h-3 w-3 inline mr-1" />
                                Main Photo
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
                        <strong>Tip:</strong> Your first photo is your main profile photo. Use the crown button to set any photo as main, or use arrows to reorder photos.
                      </div>
                    </div>
                  )}
                  
                  {/* Save Changes */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button 
                      onClick={() => savePhotosMutation.mutate(formData.photos)}
                      disabled={savePhotosMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savePhotosMutation.isPending ? "Saving..." : "Save Photos"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, photos: userData.profile.photos || [] }));
                        setIsManagingPhotos(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Display Mode */}
                  {userData.profile.photos?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {userData.profile.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 mb-4">Add photos to make your profile stand out</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsManagingPhotos(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Photos
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
