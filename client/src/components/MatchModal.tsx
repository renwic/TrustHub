import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Profile } from "@shared/schema";
import { Link } from "wouter";

interface MatchModalProps {
  profile: Profile;
  onClose: () => void;
}

export default function MatchModal({ profile, onClose }: MatchModalProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center">
              <Heart className="text-primary text-6xl" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
        <p className="text-white/90 mb-8">You and {profile.name} both liked each other</p>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            onClick={onClose}
          >
            Keep Swiping
          </Button>
          <Link to="/matches">
            <Button 
              className="px-6 py-3 bg-white text-primary hover:shadow-lg"
            >
              Send Message
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
