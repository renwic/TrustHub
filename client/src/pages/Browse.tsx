import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Shield, Star, Heart, ChevronRight, Search, Filter, RotateCcw, Check, ChevronsUpDown } from "lucide-react";
import Header from "@/components/Header";
import DesktopNav from "@/components/DesktopNav";
import BottomNav from "@/components/BottomNav";
import ContextualHelp from "@/components/ContextualHelp";
import { useIsMobile } from "@/hooks/use-mobile";

interface VouchStatement {
  id: number;
  profileId: number;
  profileName: string;
  profileAge: number;
  profilePhotos: string[];
  authorName: string;
  relationship: string;
  content: string;
  ratings: {
    personality: number;
    reliability: number;
    kindness: number;
    fun: number;
    recommendation: number;
  };
  vouchCount: number;
  trustScore: number;
}

// Helper function to calculate average rating
const getAverageRating = (ratings: any): number => {
  if (!ratings || typeof ratings !== 'object') return 0;
  
  const validRatings = Object.values(ratings).filter(
    (rating): rating is number => typeof rating === 'number' && !isNaN(rating)
  );
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
};

// Helper function to get trust badge
const getTrustBadge = (trustScore: number) => {
  if (trustScore >= 85) return { label: "Verified", color: "bg-green-100 text-green-800 border-green-200" };
  if (trustScore >= 70) return { label: "Trusted", color: "bg-blue-100 text-blue-800 border-blue-200" };
  if (trustScore >= 50) return { label: "Emerging", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  return { label: "New", color: "bg-gray-100 text-gray-800 border-gray-200" };
};

// Relationship options for the searchable combobox
const relationshipOptions = [
  { value: "all", label: "All Relationships" },
  // Family
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "sibling", label: "Sibling" },
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "cousin", label: "Cousin" },
  { value: "uncle", label: "Uncle" },
  // Friends
  { value: "best friend", label: "Best Friend" },
  { value: "college friend", label: "College Friend" },
  { value: "medical school friend", label: "Medical School Friend" },
  // Work/Professional
  { value: "colleague", label: "Colleague" },
  { value: "coworker", label: "Coworker" },
  { value: "work colleague", label: "Work Colleague" },
  { value: "former colleague", label: "Former Colleague" },
  { value: "teaching colleague", label: "Teaching Colleague" },
  { value: "business partner", label: "Business Partner" },
  { value: "professor", label: "Professor" },
  { value: "research mentor", label: "Research Mentor" },
  // Living Situation
  { value: "roommate", label: "Roommate" },
  { value: "college roommate", label: "College Roommate" },
  { value: "neighbor", label: "Neighbor" },
  // Activity Partners
  { value: "gym buddy", label: "Gym Buddy" },
  { value: "workout partner", label: "Workout Partner" },
  { value: "hiking partner", label: "Hiking Partner" },
  { value: "hiking buddy", label: "Hiking Buddy" },
  { value: "running partner", label: "Running Partner" },
  { value: "climbing partner", label: "Climbing Partner" },
  { value: "study partner", label: "Study Partner" },
  { value: "law school study partner", label: "Law School Study Partner" },
  { value: "travel companion", label: "Travel Companion" },
  { value: "band member", label: "Band Member" },
  { value: "dance partner", label: "Dance Partner" },
  // Classes/Groups
  { value: "art class partner", label: "Art Class Partner" },
  { value: "book club member", label: "Book Club Member" },
  { value: "pottery class friend", label: "Pottery Class Friend" },
  { value: "meditation partner", label: "Meditation Partner" },
  { value: "photography partner", label: "Photography Partner" },
  { value: "writing partner", label: "Writing Partner" },
  // Other
  { value: "swimming coach", label: "Swimming Coach" },
  { value: "yoga instructor", label: "Yoga Instructor" },
  { value: "volunteer coordinator", label: "Volunteer Coordinator" },
  { value: "conservation team lead", label: "Conservation Team Lead" },
  { value: "creative director", label: "Creative Director" },
];

export default function Browse() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch props data
  const { data: props, isLoading: propsLoading, error: propsError } = useQuery({
    queryKey: ["/api/props/browse"],
  });

  console.log("Props data:", props, "Array?", Array.isArray(props), "Length:", props?.length);
  console.log("Filter states:", { relationshipFilter, filterBy, searchTerm, sortBy });

  // Random props for carousel (unfiltered)
  const randomProps = Array.isArray(props) ? [...props].sort(() => Math.random() - 0.5) : [];

  // Filtered props for grid display
  const filteredProps = Array.isArray(props) ? props.filter((prop) => {
    try {
      if (!prop) return false;
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
             (prop.content && prop.content.toLowerCase().includes(searchLower)) ||
             (prop.profileName && prop.profileName.toLowerCase().includes(searchLower)) ||
             (prop.authorName && prop.authorName.toLowerCase().includes(searchLower));
      
      // Relationship filter - handle partial matches for relationships with additional text
      const matchesRelationship = relationshipFilter === "all" || 
             (prop.relationship && (
               prop.relationship.toLowerCase() === relationshipFilter.toLowerCase() ||
               prop.relationship.toLowerCase().includes(relationshipFilter.toLowerCase())
             ));
      
      // Rating filter
      const avgRating = getAverageRating(prop.ratings);
      const matchesRating = filterBy === "all" ||
             (filterBy === "4.5+" && avgRating >= 4.5) ||
             (filterBy === "4.0+" && avgRating >= 4.0) ||
             (filterBy === "3.5+" && avgRating >= 3.5) ||
             (filterBy === "3.0+" && avgRating >= 3.0);
      
      return matchesSearch && matchesRelationship && matchesRating;
    } catch {
      return false;
    }
  }).sort((a, b) => {
    if (sortBy === "rating") {
      return getAverageRating(b.ratings) - getAverageRating(a.ratings);
    }
    if (sortBy === "recent") {
      return b.id - a.id;
    }
    if (sortBy === "props") {
      return (b.vouchCount || 0) - (a.vouchCount || 0);
    }
    if (sortBy === "random") {
      return Math.random() - 0.5;
    }
    return 0;
  }) : [];

  console.log("Random props count:", randomProps.length);
  console.log("Filtered props count:", filteredProps.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {!isMobile && <DesktopNav />}
      
      <div className={`${isMobile ? '' : 'ml-64'}`}>
        <main className="container mx-auto px-4 py-6 max-w-7xl mobile-nav-padding overflow-visible">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-slate-900">Browse Props</h1>
              <ContextualHelp />
            </div>
            <p className="text-lg text-slate-600 leading-relaxed">
              Discover authentic testimonials from RealOnes who know these members personally
            </p>
          </div>

          {/* Single Random Props Carousel */}
          {randomProps.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Trending Props</h3>
              <div className="overflow-hidden rounded-2xl">
                <div className="flex space-x-6 animate-scroll-left">
                  {randomProps.map((prop: VouchStatement) => {
                    if (!prop) return null;
                    const propRating = getAverageRating(prop.ratings || {});
                    const trustScore = Math.min(100, (prop.vouchCount * 10) + (propRating * 15));
                    const trustBadge = getTrustBadge(trustScore);
                    
                    return (
                      <Link key={`carousel-${prop.id}`} to={`/profiles/${prop.profileId}`}>
                        <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden cursor-pointer w-80 h-80 flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30 backdrop-blur-sm flex-shrink-0">
                          {/* Decorative Top Bar */}
                          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary flex-shrink-0"></div>
                          
                          {/* Main Vouch Content */}
                          <CardContent className="p-6 relative flex-1 flex flex-col justify-between">
                            {/* Quote Icon */}
                            <div className="absolute top-4 left-4 text-4xl text-primary/10 font-serif">"</div>
                            
                            <div className="flex-1 flex flex-col justify-center">
                              <blockquote className="text-base font-medium text-slate-800 leading-relaxed mb-4 italic text-center relative z-10 line-clamp-4">
                                {prop.content || 'No content available'}
                              </blockquote>
                            </div>
                            
                            {/* Decorative divider */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-16"></div>
                              <div className="mx-2 w-1.5 h-1.5 bg-primary/20 rounded-full"></div>
                              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-16"></div>
                            </div>
                            
                            {/* Author Information */}
                            <div className="flex items-center justify-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xs">
                                  {prop.authorName ? prop.authorName.charAt(0) : '?'}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {prop.authorName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-600 capitalize truncate">
                                  {prop.relationship || 'Unknown relationship'}
                                </p>
                              </div>
                              <div className="flex items-center bg-gradient-to-r from-red-50 to-pink-50 px-2 py-1 rounded-full border border-red-200/50">
                                <Heart className="w-3 h-3 text-red-500 mr-1 fill-current" />
                                <span className="text-xs font-semibold text-slate-700">{propRating.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            {/* Profile Section */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-lg">
                                  {prop.profilePhotos && prop.profilePhotos.length > 0 ? (
                                    <img
                                      src={prop.profilePhotos[0]}
                                      alt={prop.profileName || 'Profile'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {prop.profileName ? prop.profileName.charAt(0) : '?'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-bold text-slate-800 truncate">
                                        {prop.profileName || 'Unknown'}
                                      </h3>
                                      <p className="text-xs text-slate-600 truncate">
                                        {prop.profileAge ? `${prop.profileAge}` : 'Age unknown'} • {prop.vouchCount || 1} prop{(prop.vouchCount || 1) !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      <Badge className={`text-xs font-medium px-2 py-0.5 ${trustBadge.color} shadow-sm`}>
                                        {trustBadge.label}
                                      </Badge>
                                      <ChevronRight className="w-3 h-3 text-secondary" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search props, names, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-primary"
                  />
                </div>
              </div>

              {/* Relationship Filter - Searchable */}
              <div className="w-full lg:w-48">
                <Popover open={relationshipOpen} onOpenChange={setRelationshipOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={relationshipOpen}
                      className="w-full justify-between border-slate-300 text-left font-normal"
                    >
                      {relationshipFilter
                        ? relationshipOptions.find((option) => option.value === relationshipFilter)?.label
                        : "Select relationship..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search relationships..." />
                      <CommandList>
                        <CommandEmpty>No relationship found.</CommandEmpty>
                        <CommandGroup>
                          {relationshipOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={(currentValue) => {
                                setRelationshipFilter(currentValue === relationshipFilter ? "all" : currentValue);
                                setRelationshipOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  relationshipFilter === option.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rating Filter */}
              <div className="w-full lg:w-32">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4.5+">4.5+ Hearts</SelectItem>
                    <SelectItem value="4.0+">4.0+ Hearts</SelectItem>
                    <SelectItem value="3.5+">3.5+ Hearts</SelectItem>
                    <SelectItem value="3.0+">3.0+ Hearts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="w-full lg:w-32">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="props">Most Props</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(relationshipFilter !== "all" || filterBy !== "all" || searchTerm || sortBy !== "rating") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setRelationshipFilter("all");
                    setFilterBy("all");
                    setSearchTerm("");
                    setSortBy("rating");
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {propsLoading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading props...</p>
            </div>
          )}

          {/* Error State */}
          {propsError && (
            <div className="text-center py-16">
              <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Props</h3>
              <p className="text-slate-500">Please try again later.</p>
            </div>
          )}

          {/* Filtered Props Grid */}
          <div className="pb-32">
            {filteredProps.length > 0 ? (
              <>
                <h3 className="text-xl font-semibold text-slate-800 mb-6">
                  {relationshipFilter !== "all" || filterBy !== "all" || searchTerm 
                    ? "Filtered Results" 
                    : "All Props"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProps.map((prop: VouchStatement) => {
                    if (!prop) return null;
                    const propRating = getAverageRating(prop.ratings || {});
                    const trustScore = Math.min(100, (prop.vouchCount * 10) + (propRating * 15));
                    const trustBadge = getTrustBadge(trustScore);
                    
                    return (
                      <Link key={`grid-${prop.id}`} to={`/profiles/${prop.profileId}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 overflow-hidden cursor-pointer min-h-96 flex flex-col bg-gradient-to-br from-white to-slate-50/30">
                          {/* Decorative Top Bar */}
                          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary flex-shrink-0"></div>
                          
                          {/* Main Vouch Content */}
                          <CardContent className="p-5 relative flex-1 flex flex-col justify-between">
                            {/* Quote Icon */}
                            <div className="absolute top-3 left-3 text-3xl text-primary/10 font-serif">"</div>
                            
                            <div className="flex-1 flex flex-col justify-center">
                              <blockquote className="text-sm font-medium text-slate-800 leading-relaxed mb-4 italic text-center relative z-10 line-clamp-4">
                                {prop.content || 'No content available'}
                              </blockquote>
                            </div>
                            
                            {/* Author Information */}
                            <div className="flex items-center justify-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-xs">
                                  {prop.authorName ? prop.authorName.charAt(0) : '?'}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {prop.authorName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-600 capitalize truncate">
                                  {prop.relationship || 'Unknown relationship'}
                                </p>
                              </div>
                              <div className="flex items-center bg-gradient-to-r from-red-50 to-pink-50 px-2 py-1 rounded-full border border-red-200/50">
                                <Heart className="w-3 h-3 text-red-500 mr-1 fill-current" />
                                <span className="text-xs font-semibold text-slate-700">{propRating.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            {/* Profile Section */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-md">
                                  {prop.profilePhotos && prop.profilePhotos.length > 0 ? (
                                    <img
                                      src={prop.profilePhotos[0]}
                                      alt={prop.profileName || 'Profile'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                                      <span className="text-white font-bold text-xs">
                                        {prop.profileName ? prop.profileName.charAt(0) : '?'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-bold text-slate-800 truncate">
                                        {prop.profileName || 'Unknown'}
                                      </h3>
                                      <p className="text-xs text-slate-600 truncate">
                                        {prop.profileAge ? `${prop.profileAge}` : 'Age unknown'} • {prop.vouchCount || 1} prop{(prop.vouchCount || 1) !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1 flex-shrink-0">
                                      <Badge className={`text-xs font-medium px-2 py-0.5 ${trustBadge.color} shadow-sm`}>
                                        {trustBadge.label}
                                      </Badge>
                                      <ChevronRight className="w-3 h-3 text-primary" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No props found</h3>
                <p className="text-slate-500 mb-4">
                  {relationshipFilter !== "all" || filterBy !== "all" || searchTerm
                    ? "Try adjusting your filters to see more results."
                    : "Be the first to give props to the community!"}
                </p>
                {(relationshipFilter !== "all" || filterBy !== "all" || searchTerm) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRelationshipFilter("all");
                      setFilterBy("all");
                      setSearchTerm("");
                      setSortBy("rating");
                    }}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

      </div>
      
      <BottomNav />
    </div>
  );
}