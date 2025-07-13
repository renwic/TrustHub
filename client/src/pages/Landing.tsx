import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, MessageCircle, Star } from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
      <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
        {/* Hero Section */}
        <div className="text-center p-8 pt-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Heart className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Heartlink
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Find Your Perfect Match
          </h2>
          
          <p className="text-slate-600 mb-8">
            Connect with genuine people through verified profiles and trusted testimonials from friends and family.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 space-y-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Social Testimonials</h3>
                <p className="text-sm text-slate-600">Verified reviews from trusted friends and family</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="text-secondary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Real-time Messaging</h3>
                <p className="text-sm text-slate-600">Connect instantly with your matches</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Star className="text-success w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Verified Profiles</h3>
                <p className="text-sm text-slate-600">Authentic connections with real people</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8">
          <Button
            onClick={handleGetStarted}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            Get Started
          </Button>
          
          <p className="text-center text-sm text-slate-500 mt-4">
            Join thousands of verified members finding meaningful connections
          </p>
        </div>
      </div>
    </div>
  );
}
