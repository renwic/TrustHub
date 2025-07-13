import { useState, useEffect } from "react";

interface OnboardingState {
  hasSeenTour: boolean;
  hasCompletedProfile: boolean;
  hasInvitedRealOnes: boolean;
  hasViewedHelp: boolean;
  tourStep: number;
}

const ONBOARDING_STORAGE_KEY = "heartlink_onboarding";

const defaultState: OnboardingState = {
  hasSeenTour: false,
  hasCompletedProfile: false,
  hasInvitedRealOnes: false,
  hasViewedHelp: false,
  tourStep: 0
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load onboarding state from localStorage
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        setState({ ...defaultState, ...parsedState });
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateState = (updates: Partial<OnboardingState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const markTourCompleted = () => {
    updateState({ hasSeenTour: true, tourStep: 0 });
  };

  const markProfileCompleted = () => {
    updateState({ hasCompletedProfile: true });
  };

  const markRealOnesInvited = () => {
    updateState({ hasInvitedRealOnes: true });
  };

  const markHelpViewed = () => {
    updateState({ hasViewedHelp: true });
  };

  const setTourStep = (step: number) => {
    updateState({ tourStep: step });
  };

  const resetOnboarding = () => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const shouldShowTour = !state.hasSeenTour && !isLoading;
  const shouldShowProfilePrompt = false; // Remove blocking prompts
  const shouldShowRealOnesPrompt = false; // Remove blocking prompts

  const completionScore = [
    state.hasSeenTour,
    state.hasCompletedProfile, 
    state.hasInvitedRealOnes,
    state.hasViewedHelp
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completionScore / 4) * 100);

  return {
    state,
    isLoading,
    shouldShowTour,
    shouldShowProfilePrompt,
    shouldShowRealOnesPrompt,
    completionPercentage,
    markTourCompleted,
    markProfileCompleted,
    markRealOnesInvited,
    markHelpViewed,
    setTourStep,
    resetOnboarding,
    updateState
  };
}