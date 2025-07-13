import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, X, Star, MapPin, Info, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PropsModal from "./VouchesModal";
import { formatUserDisplayName } from "@/lib/nameUtils";

interface Profile {
  id: number;
  name: string;
  age: number;
  bio?: string;
  location?: string;
  photos?: string[];
  rating: number;
  relationshipStatus: string;
}

interface SwipeCardProps {
  profile: Profile;
  style?: React.CSSProperties;
  isInteractive?: boolean;
  onSwipe?: (action: 'like' | 'pass' | 'super_like') => void;
}

export default function SwipeCard({ profile, style, isInteractive = false, onSwipe }: SwipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showProps, setShowProps] = useState(false);

  return (
    <motion.div
      className="relative w-full h-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
      style={style}
      whileHover={isInteractive ? { scale: 1.005 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Main Profile Image */}
      <div className="relative w-full h-full">
        {!imageError && profile.photos && profile.photos.length > 0 ? (
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <User className="w-16 h-16 text-slate-300" />
          </div>
        )}
        
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
        
        {/* Action Buttons - Top Right */}
        {isInteractive && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
            <Link to={`/profiles/${profile.id}`}>
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md border-0 backdrop-blur-sm"
              >
                <Info className="w-4 h-4 text-gray-600" />
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md border-0 backdrop-blur-sm"
              onClick={() => setShowProps(true)}
            >
              <Users className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        )}
        
        {/* Profile Information */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-28">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
            {/* Name and Age */}
            <div className="flex items-baseline space-x-3 mb-2">
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                {formatUserDisplayName(profile)}
              </h1>
              <span className="text-2xl font-light text-white/90">
                {profile.age}
              </span>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="text-white/95 text-base leading-relaxed mb-3 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            {/* Location and Rating */}
            <div className="flex items-center justify-between">
              {profile.location && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span className="text-white/90 text-sm">{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
                <span className="text-white text-sm font-medium">
                  {profile.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Action Buttons */}
        {isInteractive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
            {/* Pass Button */}
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => onSwipe?.('pass')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
            
            {/* Like Button */}
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => onSwipe?.('like')}
            >
              <Heart className="w-6 h-6 text-white" />
            </Button>
            
            {/* Super Like Button */}
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full border-2 border-blue-300 bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => onSwipe?.('super_like')}
            >
              <Star className="w-5 h-5 text-blue-500" />
            </Button>
          </div>
        )}
      </div>

      {/* Props Modal */}
      {showProps && (
        <PropsModal
          profileId={profile.id}
          profileName={profile.name}
          onClose={() => setShowProps(false)}
        />
      )}
    </motion.div>
  );
}