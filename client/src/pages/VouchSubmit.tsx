import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import PhotoLightbox from "@/components/PhotoLightbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Heart, CheckCircle, AlertCircle, Camera, X, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { vouchSubmissionSchema, type VouchSubmissionData } from "@shared/schema";

export default function VouchSubmit() {
  const { token } = useParams();
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoDescriptions, setPhotoDescriptions] = useState<string[]>([]);
  const [allowPhotoSharing, setAllowPhotoSharing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { toast } = useToast();

  const { data: inviteData, isLoading, error } = useQuery({
    queryKey: [`/api/prop-invite/${token}`],
    enabled: !!token,
    retry: false,
  });

  const form = useForm<VouchSubmissionData>({
    resolver: zodResolver(vouchSubmissionSchema),
    defaultValues: {
      inviteToken: token || "",
      content: "",
      ratings: {
        trustworthy: 5,
        fun: 5,
        caring: 5,
        ambitious: 5,
        reliable: 5,
      },
      allowPhotoSharing: false,
      sharedPhotos: [],
      photoDescriptions: [],
    },
  });

  const submitVouchMutation = useMutation({
    mutationFn: async (data: VouchSubmissionData) => {
      const submissionData = {
        ...data,
        allowPhotoSharing,
        sharedPhotos: allowPhotoSharing ? photoUrls.filter(url => url.trim() !== '') : [],
        photoDescriptions: allowPhotoSharing ? photoDescriptions.filter(desc => desc.trim() !== '') : [],
      };
      return await apiRequest("/api/prop-submit", {
        method: "POST",
        body: JSON.stringify(submissionData),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Prop submitted!",
        description: "Thank you for vouching. Your testimonial has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit prop. Please try again.",
        variant: "destructive",
      });
    },
  });

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Heart
              className={`w-6 h-6 ${
                star <= value ? "fill-red-400 text-red-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const addPhotoUrl = () => {
    setPhotoUrls([...photoUrls, ""]);
    setPhotoDescriptions([...photoDescriptions, ""]);
  };

  const removePhotoUrl = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
    setPhotoDescriptions(photoDescriptions.filter((_, i) => i !== index));
  };

  const updatePhotoUrl = (index: number, url: string) => {
    const newUrls = [...photoUrls];
    newUrls[index] = url;
    setPhotoUrls(newUrls);
  };

  const updatePhotoDescription = (index: number, description: string) => {
    const newDescriptions = [...photoDescriptions];
    newDescriptions[index] = description;
    setPhotoDescriptions(newDescriptions);
  };

  const openPhotoPreview = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-4">
              This prop invitation link is no longer valid or has expired.
            </p>
            <Button onClick={() => setLocation("/")}>
              Go to Heartlink
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your prop for {inviteData.profile.name} has been submitted successfully.
              It will help them build trust with potential matches.
            </p>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-pink-800 mb-2">Interested in Dating with Trust?</h3>
              <p className="text-sm text-pink-700">
                You've just experienced Heartlink's unique approach to dating. Instead of swiping blindly, 
                we help people connect based on real testimonials from friends and family. Join thousands 
                finding meaningful relationships built on trust.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => {
                // Store a flag to show welcome flow after login
                localStorage.setItem('showWelcomeFlow', 'true');
                window.location.href = "/api/login";
              }} className="w-full">
                Join Heartlink as a Dater
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="w-full"
              >
                Just Visit Heartlink
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter out empty URLs for lightbox
  const validPhotos = photoUrls.filter(url => url.trim() !== '');
  const validDescriptions = photoDescriptions.filter((desc, index) => photoUrls[index]?.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Prop for {inviteData.profile.name}</h1>
          <p className="text-gray-600">
            {inviteData.vouchRequest.recipientName}, you've been invited to write a prop as their{" "}
            <Badge variant="secondary">{inviteData.vouchRequest.relationship}</Badge>
          </p>
        </div>

        {inviteData.vouchRequest.personalMessage && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Personal Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 italic">
                "{inviteData.vouchRequest.personalMessage}"
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Write Your Prop</CardTitle>
            <CardDescription>
              Share what makes {inviteData.profile.name} special. Your honest testimonial
              will help them connect with compatible matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => submitVouchMutation.mutate(data))}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Testimonial</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Tell us about ${inviteData.profile.name}. What are they like as a person? What makes them a great friend/colleague/family member? Share specific examples or qualities that stand out...`}
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rate Their Qualities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ratings.trustworthy"
                      render={({ field }) => (
                        <FormItem>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            label="Trustworthy"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ratings.fun"
                      render={({ field }) => (
                        <FormItem>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            label="Fun to be around"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ratings.caring"
                      render={({ field }) => (
                        <FormItem>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            label="Caring"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ratings.ambitious"
                      render={({ field }) => (
                        <FormItem>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            label="Ambitious"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ratings.reliable"
                      render={({ field }) => (
                        <FormItem>
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            label="Reliable"
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Photo Sharing Section */}
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="photo-sharing"
                      checked={allowPhotoSharing}
                      onCheckedChange={(checked) => setAllowPhotoSharing(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="photo-sharing" className="text-base font-medium cursor-pointer">
                        Share photos with {inviteData.profile.name}
                      </Label>
                      <p className="text-sm text-slate-600">
                        Share memorable photos of you and {inviteData.profile.name} to make your prop more personal. 
                        These photos will only be visible to people viewing their dating profile.
                      </p>
                    </div>
                  </div>

                  {allowPhotoSharing && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-800">Shared Photos</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPhotoUrl}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Photo</span>
                        </Button>
                      </div>

                      {photoUrls.map((url, index) => (
                        <div key={index} className="space-y-3 p-4 bg-white rounded-lg border">
                          <div className="flex items-start space-x-3">
                            <Camera className="w-5 h-5 text-slate-400 mt-2" />
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label htmlFor={`photo-url-${index}`} className="text-sm font-medium">
                                  Photo URL {index + 1}
                                </Label>
                                <Input
                                  id={`photo-url-${index}`}
                                  type="url"
                                  placeholder="https://example.com/photo.jpg"
                                  value={url}
                                  onChange={(e) => updatePhotoUrl(index, e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`photo-desc-${index}`} className="text-sm font-medium">
                                  Photo Description
                                </Label>
                                <Input
                                  id={`photo-desc-${index}`}
                                  placeholder="Describe this photo (e.g., 'At graduation ceremony 2023')"
                                  value={photoDescriptions[index] || ""}
                                  onChange={(e) => updatePhotoDescription(index, e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePhotoUrl(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {url && (
                            <div className="ml-8">
                              <div className="w-32 h-24 bg-slate-100 rounded-lg overflow-hidden border relative group cursor-pointer" onClick={() => openPhotoPreview(index)}>
                                <img
                                  src={url}
                                  alt={photoDescriptions[index] || `Photo ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs" style={{display: 'none'}}>
                                  Invalid URL
                                </div>
                                
                                {/* Preview overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-1">
                                    <Eye className="w-4 h-4 text-slate-700" />
                                  </div>
                                </div>
                              </div>
                              {photoDescriptions[index] && (
                                <p className="text-xs text-slate-600 mt-1 ml-8 line-clamp-2">
                                  {photoDescriptions[index]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {photoUrls.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Camera className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-sm">No photos added yet</p>
                          <p className="text-xs">Click "Add Photo" to share memorable moments</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitVouchMutation.isPending}
                  >
                    {submitVouchMutation.isPending ? "Submitting..." : "Submit Prop"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Your prop will be visible on their dating profile
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Photo Preview Lightbox */}
      <PhotoLightbox
        photos={validPhotos}
        descriptions={validDescriptions}
        initialPhotoIndex={Math.min(lightboxIndex, validPhotos.length - 1)}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        authorName="Preview"
        profileName={inviteData?.profile?.name || ""}
      />
    </div>
  );
}