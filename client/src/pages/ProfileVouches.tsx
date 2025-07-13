import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import PhotoLightbox from "@/components/PhotoLightbox";
import PopRepScore from "@/components/PopRepScore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Shield, Heart, MapPin, User, Award, Clock, Camera, Image } from "lucide-react";
import { formatNameWithInitials, formatUserDisplayName } from "@/lib/nameUtils";

export default function ProfileVouches() {
  const { id } = useParams();
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxDescriptions, setLightboxDescriptions] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxAuthor, setLightboxAuthor] = useState("");
  const [lightboxProfile, setLightboxProfile] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/profiles/${id}`],
    retry: false,
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: [`/api/profiles/${id}/testimonials`],
    retry: false,
  });

  const calculateAverageRating = (testimonial: any) => {
    if (!testimonial.ratings) return 0;
    const ratings = Object.values(testimonial.ratings).filter(r => typeof r === 'number');
    return ratings.length > 0 ? ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length : 0;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getRatingColor = (rating: number) => {
    // Convert rating to percentage (0-100)
    const percentage = (rating / 5) * 100;
    
    if (percentage >= 80) {
      // High ratings: Pink/Magenta shades (matching trust hub and hearts)
      return "bg-gradient-to-r from-pink-400 to-rose-500";
    } else if (percentage >= 60) {
      // Good ratings: Yellow-pink shades
      return "bg-gradient-to-r from-yellow-400 to-pink-400";
    } else if (percentage >= 40) {
      // Average ratings: Orange shades
      return "bg-gradient-to-r from-orange-400 to-yellow-400";
    } else if (percentage >= 20) {
      // Below average: Red-orange shades
      return "bg-gradient-to-r from-red-400 to-orange-400";
    } else {
      // Low ratings: Red shades
      return "bg-gradient-to-r from-red-500 to-red-400";
    }
  };

  const [lightboxTestimonialId, setLightboxTestimonialId] = useState(0);

  const openLightbox = (testimonial: any, photoIndex: number) => {
    setLightboxPhotos(testimonial.sharedPhotos || []);
    setLightboxDescriptions(testimonial.photoDescriptions || []);
    setLightboxIndex(photoIndex);
    setLightboxAuthor(formatNameWithInitials(testimonial.authorName || "Unknown", false));
    setLightboxProfile(profile ? formatUserDisplayName(profile) : "");
    setLightboxTestimonialId(testimonial.id);
    setLightboxOpen(true);
  };

  if (profileLoading || testimonialsLoading) {
    return (
      <div className="bg-white min-h-screen">
        <DesktopNav />
        <div className="max-w-md lg:max-w-4xl mx-auto">
          <div className="lg:hidden">
            <Header title="Props" />
          </div>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading props...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
      <DesktopNav />
      <div className="max-w-md lg:max-w-4xl mx-auto">
        <div className="lg:hidden">
          <Header title="Props" />
        </div>

        <main className="p-4 mobile-nav-padding">
          {/* Back Button */}
          <div className="mb-6 lg:mb-8">
            <Link to={`/profiles/${id}`}>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-800 p-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
          </div>

          {/* Profile Summary */}
          {profile && (
            <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden ring-2 ring-white shadow-lg">
                      {profile.photos && profile.photos.length > 0 && !imageError ? (
                        <img 
                          src={profile.photos[0]} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1.5 shadow-md">
                      <Shield className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">{formatUserDisplayName(profile)}, {profile.age}</h2>
                        {profile.location && (
                          <div className="flex items-center space-x-1 text-slate-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{profile.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {profile.rating && (
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2 rounded-full border border-red-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-slate-600">Rating</span>
                              <div className="w-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full h-1.5">
                                <div 
                                  className={`${getRatingColor(profile.rating)} h-1.5 rounded-full transition-all duration-300`}
                                  style={{ width: `${(profile.rating / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col space-y-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {testimonials.length} prop{testimonials.length !== 1 ? 's' : ''}
                          </Badge>
                          <PopRepScore profileId={parseInt(id!)} />
                        </div>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-sm text-slate-600 line-clamp-2 mt-3">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vouches Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Props for {profile ? formatUserDisplayName(profile) : 'User'}
              </h1>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-slate-600">
                  {testimonials.length} prop{testimonials.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {testimonials.length > 0 ? (
              <div className="space-y-6">
                {testimonials.map((testimonial: any, index: number) => {
                  const averageRating = calculateAverageRating(testimonial);
                  
                  return (
                    <Card key={testimonial.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {testimonial.authorName ? testimonial.authorName.charAt(0) : '?'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{formatNameWithInitials(testimonial.authorName || 'Anonymous', false)}</h3>
                              <p className="text-sm text-slate-600 capitalize">{testimonial.relationship}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-2 py-1.5 rounded-full border border-red-200">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-medium text-slate-600">Rating</span>
                                <div className="w-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full h-1">
                                  <div 
                                    className={`${getRatingColor(averageRating)} h-1 rounded-full transition-all duration-300`}
                                    style={{ width: `${(averageRating / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-slate-500 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(testimonial.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="relative">
                          <div className="absolute top-0 left-0 text-4xl text-primary/10 font-serif leading-none">"</div>
                          <blockquote className="text-slate-700 leading-relaxed pl-6 italic">
                            {testimonial.content}
                          </blockquote>
                          <div className="absolute bottom-0 right-0 text-4xl text-primary/10 font-serif leading-none rotate-180">"</div>
                        </div>
                        
                        {/* Shared Photos Section */}
                        {testimonial.allowPhotoSharing && testimonial.sharedPhotos && testimonial.sharedPhotos.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-slate-200">
                            <div className="flex items-center space-x-2 mb-4">
                              <Camera className="w-4 h-4 text-slate-600" />
                              <h4 className="text-sm font-semibold text-slate-700">Shared Photos</h4>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {testimonial.sharedPhotos.length} photo{testimonial.sharedPhotos.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {testimonial.sharedPhotos.map((photo: string, photoIndex: number) => (
                                <div 
                                  key={photoIndex} 
                                  className="group cursor-pointer"
                                  onClick={() => openLightbox(testimonial, photoIndex)}
                                >
                                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all duration-300 relative">
                                    <img
                                      src={photo}
                                      alt={testimonial.photoDescriptions?.[photoIndex] || `Photo ${photoIndex + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling!.style.display = 'flex';
                                      }}
                                    />
                                    <div 
                                      className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs"
                                      style={{display: 'none'}}
                                    >
                                      <Image className="w-8 h-8 mb-2" />
                                      <span>Image unavailable</span>
                                    </div>
                                    
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2">
                                        <Image className="w-5 h-5 text-slate-700" />
                                      </div>
                                    </div>
                                  </div>
                                  {testimonial.photoDescriptions?.[photoIndex] && (
                                    <p className="text-xs text-slate-600 mt-2 px-1 line-clamp-2 group-hover:text-slate-800 transition-colors">
                                      {testimonial.photoDescriptions[photoIndex]}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {testimonial.ratings && (
                          <div className="mt-6 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Ratings</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                              {Object.entries(testimonial.ratings).map(([key, value]) => (
                                <div key={key} className="text-center">
                                  <div className="text-xs text-slate-600 mb-2 capitalize">{key}</div>
                                  <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 rounded-full h-2">
                                    <div 
                                      className={`${getRatingColor(value)} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${(value / 5) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No props yet</h3>
                  <p className="text-slate-500">
                    {profile?.name} hasn't received any props yet. Be the first to give them props!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      
      <BottomNav />
      
      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        descriptions={lightboxDescriptions}
        initialPhotoIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        authorName={lightboxAuthor}
        profileName={lightboxProfile}
        testimonialId={lightboxTestimonialId}
      />
    </div>
  );
}