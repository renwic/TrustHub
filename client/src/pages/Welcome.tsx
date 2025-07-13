import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Shield, Users, MessageCircle, Star, ArrowRight, CheckCircle } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "intro",
      title: "Welcome to Heartlink!",
      description: "You've already experienced our trust-based approach by giving a prop. Now discover how dating works differently here.",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dating Built on Trust</h3>
            <p className="text-gray-600">
              Unlike other apps that rely on superficial swiping, Heartlink helps you connect with people 
              based on real testimonials from friends and family.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Trust Scores</h4>
                <p className="text-sm text-gray-600">See verified RealRep scores</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Real Props</h4>
                <p className="text-sm text-gray-600">Read authentic testimonials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Meaningful Chats</h4>
                <p className="text-sm text-gray-600">Connect with verified people</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "profile",
      title: "Create Your Dating Profile",
      description: "Build a complete profile to attract the right matches and start collecting your own props.",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Getting Started Checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">✓ You've given your first prop (done!)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm">Add photos and write your bio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm">Invite your RealOnes to give you props</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm">Start browsing verified profiles</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Your profile is your chance to show who you are. Add photos, write about yourself, 
              and invite trusted friends to give you props that highlight your best qualities.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "props",
      title: "Get Your First Props",
      description: "Invite friends and family to vouch for your character and build your RealRep score.",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Your RealRep</h3>
            <p className="text-gray-600 mb-4">
              Your RealRep score is calculated from props given by your RealOnes, their ratings, 
              and your profile completeness. Higher scores mean more trust and better matches.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Props from RealOnes</span>
                <Badge variant="secondary">Up to 60 points</Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Invite friends, family, and colleagues</p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Ratings</span>
                <Badge variant="secondary">Up to 30 points</Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Quality ratings across all props</p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <Badge variant="secondary">Up to 10 points</Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Complete all profile sections</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and go to profile creation
      localStorage.removeItem('showWelcomeFlow');
      setLocation("/profile");
    }
  };

  const handleSkip = () => {
    // Clear the welcome flow flag and go to main app
    localStorage.removeItem('showWelcomeFlow');
    setLocation("/");
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.content}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button onClick={handleNext} className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? "Start Dating" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}