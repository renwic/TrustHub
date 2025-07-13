import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ArrowLeft, ArrowRight, Target } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
}

interface TutorialOverlayProps {
  tutorialId: string;
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ tutorialId, steps, isActive, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isVisible && steps[currentStep]?.target) {
      const element = document.querySelector(steps[currentStep].target!);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight');
      }
    }

    return () => {
      // Clean up highlights
      const highlighted = document.querySelectorAll('.tutorial-highlight');
      highlighted.forEach(el => el.classList.remove('tutorial-highlight'));
    };
  }, [currentStep, isVisible]);

  if (!isVisible || !steps.length) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    
    // Save completion to localStorage
    const completed = JSON.parse(localStorage.getItem('heartlink-completed-tutorials') || '[]');
    if (!completed.includes(tutorialId)) {
      completed.push(tutorialId);
      localStorage.setItem('heartlink-completed-tutorials', JSON.stringify(completed));
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
        {/* Tutorial card */}
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-900">Tutorial</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-slate-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tutorial
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Tutorial step definitions
export const profileTutorialSteps: TutorialStep[] = [
  {
    id: 'profile-intro',
    title: 'Welcome to Your Profile',
    description: 'Your profile is your first impression. Let\'s make it shine with photos, bio, and personal details.',
    position: 'center'
  },
  {
    id: 'profile-photo',
    title: 'Add Your Photos',
    description: 'Upload 3-5 high-quality photos that show your personality. First impressions matter!',
    target: '.profile-photo-section',
    position: 'bottom'
  },
  {
    id: 'profile-bio',
    title: 'Write Your Bio',
    description: 'Tell your story in 150+ words. Share your interests, values, and what makes you unique.',
    target: '.profile-bio-section',
    position: 'bottom'
  },
  {
    id: 'profile-details',
    title: 'Complete Your Details',
    description: 'Fill out lifestyle preferences, interests, and relationship goals to improve matching.',
    target: '.profile-details-section',
    position: 'bottom'
  }
];

export const trustHubTutorialSteps: TutorialStep[] = [
  {
    id: 'trust-intro',
    title: 'Welcome to Trust Hub',
    description: 'Trust Hub organizes profiles by trust level, making it easier to find genuine connections.',
    position: 'center'
  },
  {
    id: 'trust-categories',
    title: 'Trust Categories',
    description: 'Profiles are organized by RealBar score: Verified (85%+), Trusted (70%+), Emerging (50%+), and New (<50%).',
    target: '.trust-categories',
    position: 'bottom'
  },
  {
    id: 'profile-cards',
    title: 'Profile Cards',
    description: 'Each card shows RealBar score, props count, and key info. Click to view full profiles.',
    target: '.profile-card:first-child',
    position: 'bottom'
  },
  {
    id: 'connect-button',
    title: 'Connect with People',
    description: 'Use "Connect" buttons to show interest instead of swiping. It\'s more intentional and respectful.',
    target: '.connect-button:first-child',
    position: 'top'
  }
];

export const vouchesTutorialSteps: TutorialStep[] = [
  {
    id: 'vouches-intro',
    title: 'Your Props System',
    description: 'Props are testimonials from people who know you. They build trust and show your authentic character.',
    position: 'center'
  },
  {
    id: 'invite-realones',
    title: 'Invite Your RealOnes',
    description: 'Choose 8-12 people from different contexts: family, friends, colleagues, classmates.',
    target: '.invite-section',
    position: 'bottom'
  },
  {
    id: 'manage-requests',
    title: 'Manage Requests',
    description: 'Track invitation status and follow up with your RealOnes to ensure they complete their props.',
    target: '.requests-section',
    position: 'bottom'
  }
];