import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Lightbulb, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

interface HelpTip {
  title: string;
  description: string;
  tips: string[];
  learnMorePath?: string;
}

const helpContent: Record<string, HelpTip> = {
  "/": {
    title: "Trust Hub Help",
    description: "Discover profiles organized by trust levels instead of random swiping",
    tips: [
      "Profiles are categorized by RealBar scores from Verified (85%+) to New (<50%)",
      "Click 'Connect' instead of swiping to show intentional interest",
      "Read props before connecting to understand someone's character",
      "Use filters to find people who match your preferences and values",
      "Browse by trust categories to find verified, trustworthy connections",
      "Profile cards show RealBar score, prop count, and verification status"
    ],
    learnMorePath: "/help#trust-hub"
  },
  "/browse": {
    title: "Browse Props Help", 
    description: "Explore authentic testimonials from RealOnes about potential matches",
    tips: [
      "Props are testimonials from people who know others personally",
      "Filter by relationship type to see different perspectives",
      "Use ratings to find highly recommended individuals",
      "Click on photos to see them in full detail with interactions",
      "Sort by recent, highest rated, or most props received",
      "Each prop includes relationship context and rating details"
    ],
    learnMorePath: "/help#browse-props"
  },
  "/profile": {
    title: "Profile Setup Help",
    description: "Complete your profile to build trust and attract quality matches",
    tips: [
      "Add 3-5 authentic photos that show your personality",
      "Fill out all sections to maximize your RealBar score",
      "Write a genuine bio that reflects who you really are",
      "Update lifestyle preferences to help with better matching",
      "Include education, occupation, and relationship goals",
      "Profile completeness directly impacts your trust score"
    ],
    learnMorePath: "/help#profile-setup"
  },
  "/vouches": {
    title: "Props Management Help",
    description: "Invite RealOnes and manage your testimonials",
    tips: [
      "Invite people who know you in different contexts (work, friends, family)",
      "Send personalized messages explaining why their input matters",
      "Review and approve props before they become public",
      "More diverse props create a stronger, more trustworthy profile",
      "Target 8-12 RealOnes for optimal trust score",
      "Follow up with invitees to ensure completion"
    ],
    learnMorePath: "/help#invite-realones"
  },
  "/matches": {
    title: "Matches & Messaging Help",
    description: "Make meaningful connections with your matches",
    tips: [
      "Use insights from props to start authentic conversations",
      "Ask open-ended questions about interests shown in their profile",
      "Request RealOne interviews for deeper character insights",
      "Focus on building genuine connections rather than small talk",
      "Reference specific props or shared interests",
      "Progress through relationship stages with mutual consent"
    ],
    learnMorePath: "/help#messaging-tips"
  },
  "/voucher-interviews": {
    title: "RealOne Interviews Help",
    description: "Get deeper insights by talking to your match's RealOnes",
    tips: [
      "Request permission before interviewing someone's RealOnes",
      "Ask thoughtful questions about character and compatibility",
      "Share your own RealOnes for mutual transparency",
      "Use insights to build deeper understanding and trust",
      "Focus on values, relationship style, and character traits",
      "Respect privacy and ask meaningful, respectful questions"
    ],
    learnMorePath: "/help#realone-interviews"
  },
  "/settings": {
    title: "Settings & Preferences Help",
    description: "Customize your Heartlink experience and privacy settings",
    tips: [
      "Set match preferences for age, distance, and interests",
      "Configure notification preferences for optimal engagement",
      "Manage privacy settings and profile visibility",
      "Review and update your relationship goals regularly",
      "Control who can interview your RealOnes",
      "Adjust discovery and matching algorithm preferences"
    ],
    learnMorePath: "/help#settings"
  },
  "/discovery": {
    title: "Discovery Features Help",
    description: "Find compatible matches using advanced discovery tools",
    tips: [
      "Use advanced filters to find specific types of people",
      "Browse by interests, education, and lifestyle preferences",
      "Discover mutual connections through social networks",
      "Explore compatibility insights and match recommendations",
      "Save interesting profiles for later review",
      "Use location-based discovery for nearby matches"
    ],
    learnMorePath: "/help#discovery"
  },
  "/notifications": {
    title: "Notifications Help",
    description: "Stay updated on matches, messages, and prop activities",
    tips: [
      "Review new match notifications with compatibility insights",
      "Manage message alerts and conversation notifications",
      "Approve or decline new props from RealOnes",
      "Track RealOne interview requests and responses",
      "Monitor relationship stage progression updates",
      "Configure notification frequency and types"
    ],
    learnMorePath: "/help#notifications"
  }
};

interface ContextualHelpProps {
  className?: string;
  variant?: "button" | "inline" | "floating";
}

export default function ContextualHelp({ className = "", variant = "button" }: ContextualHelpProps) {
  const [location] = useLocation();
  const [, setNavigationLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentHelp = helpContent[location];

  if (!currentHelp && variant !== "floating") {
    return null;
  }

  const handleLearnMore = () => {
    if (currentHelp?.learnMorePath) {
      setIsOpen(false);
      setNavigationLocation("/help");
    }
  };

  if (variant === "inline") {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-900">
            <Lightbulb className="w-4 h-4" />
            {currentHelp.title}
          </CardTitle>
          <CardDescription className="text-blue-700">
            {currentHelp.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-sm text-blue-800">
            {currentHelp.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          {currentHelp.learnMorePath && (
            <Button
              variant="link"
              size="sm"
              onClick={handleLearnMore}
              className="text-blue-700 hover:text-blue-900 p-0 h-auto mt-3"
            >
              Learn more <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "floating") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`fixed bottom-40 right-4 z-40 rounded-full w-12 h-12 lg:bottom-4 shadow-lg bg-white hover:bg-slate-50 ${className}`}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Need Help?
            </DialogTitle>
            <DialogDescription>
              Get assistance with Heartlink features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setIsOpen(false);
                setNavigationLocation("/help");
              }}
              className="w-full justify-start"
              variant="outline"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              View Full Help Center
            </Button>
            
            {currentHelp && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-900">
                    {currentHelp.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-blue-700">
                    {currentHelp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-xs text-blue-800">
                    {currentHelp.tips.slice(0, 2).map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleLearnMore}
                    className="text-blue-700 hover:text-blue-900 p-0 h-auto mt-2"
                  >
                    See all tips <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default button variant
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            {currentHelp.title}
          </DialogTitle>
          <DialogDescription>
            {currentHelp.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="space-y-3 text-sm text-slate-600">
            {currentHelp.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Got it
            </Button>
            {currentHelp.learnMorePath && (
              <Button onClick={handleLearnMore} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}