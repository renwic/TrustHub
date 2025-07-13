import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Shield, 
  Users, 
  Heart, 
  MessageCircle, 
  User, 
  Search,
  ArrowRight,
  CheckCircle,
  Play,
  Lightbulb
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  action: { text: string; path: string; optional?: boolean } | null;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Heartlink!",
    description: "Let's take a quick tour to help you get started with meaningful connections.",
    icon: Heart,
    content: "Heartlink is different from other dating apps. We focus on authentic relationships built through trust and verification from people who know you personally.",
    action: null
  },
  {
    id: "realrep",
    title: "Understanding RealRep",
    description: "Your trust score based on testimonials from real people",
    icon: Shield,
    content: "RealRep is calculated from props (testimonials) from your RealOnes, your profile completeness, and the quality of your ratings. Higher RealRep means more trustworthy connections.",
    action: null
  },
  {
    id: "realones",
    title: "Invite Your RealOnes (Optional)",
    description: "Get testimonials from people who know you well",
    icon: Users,
    content: "RealOnes are friends, family, colleagues, or anyone who knows you personally. They can give you 'props' - testimonials about your character, personality, and experiences together. You can always do this later!",
    action: { text: "Invite RealOnes Later", path: "/vouches", optional: true }
  },
  {
    id: "profile",
    title: "Complete Your Profile (Optional)",
    description: "A complete profile builds trust and attracts better matches",
    icon: User,
    content: "Fill out all sections of your profile including photos, bio, interests, and lifestyle preferences. Profile completeness contributes to your RealRep score. You can enhance this anytime!",
    action: { text: "Complete Profile Later", path: "/profile", optional: true }
  },
  {
    id: "discovery",
    title: "Start Exploring!",
    description: "Find connections through our Trust Hub",
    icon: Search,
    content: "You're all set! Browse profiles organized by trust levels and use the 'Connect' button to show interest in someone based on their verified character. Remember, you can always complete your profile and invite RealOnes later.",
    action: { text: "Start Exploring", path: "/" }
  },

];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleAction = (path: string) => {
    onClose();
    setLocation(path);
  };

  if (!isOpen) return null;

  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
          </div>
          
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-white" />
            </div>
            
            <DialogTitle className="text-xl font-bold text-slate-900 mb-2">
              {currentStepData.title}
            </DialogTitle>
            
            <DialogDescription className="text-sm font-medium text-primary mb-3">
              {currentStepData.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed text-center">
            {currentStepData.content}
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          {currentStepData.action && (
            <Card className="bg-gradient-to-r from-primary/5 to-pink-500/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(currentStepData.action!.path)}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {currentStepData.action.text}
                  </Button>
                  {currentStepData.action.optional && (
                    <Button
                      onClick={handleNext}
                      className="flex-1"
                      size="lg"
                    >
                      Skip for Now
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {currentStepData.action.optional 
                    ? "You can do this anytime from the navigation menu" 
                    : "You can continue the tour after completing this action"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}