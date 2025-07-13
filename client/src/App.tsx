import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useEffect, useState } from "react";
import OnboardingTour from "@/components/OnboardingTour";
import ContextualHelp from "@/components/ContextualHelp";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Discover from "@/pages/Discover";
import Discovery from "@/pages/Discovery";
import Browse from "@/pages/Browse";
import BrowseTest from "@/pages/BrowseTest";
import Help from "@/pages/Help";

import TrustHub from "@/pages/TrustHub";
import Matches from "@/pages/Matches";
import RealOneInterviews from "@/pages/VoucherInterviews";
import Profile from "@/pages/Profile";
import ProfileDetail from "@/pages/ProfileDetail";
import ProfileVouches from "@/pages/ProfileVouches";
import Vouches from "@/pages/Vouches";
import VouchSubmit from "@/pages/VouchSubmit";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Welcome from "@/pages/Welcome";
import RelationshipStages from "@/pages/RelationshipStages";
import AdminDashboard from "@/pages/AdminDashboard";
import Circles from "@/pages/Circles";
import CircleDetail from "@/pages/CircleDetail";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { 
    shouldShowTour, 
    markTourCompleted, 
    isLoading: onboardingLoading 
  } = useOnboarding();
  
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  
  // Check if user should see welcome flow
  useEffect(() => {
    if (isAuthenticated && user) {
      const showWelcomeFlag = localStorage.getItem('showWelcomeFlow');
      if (showWelcomeFlag === 'true') {
        setShouldShowWelcome(true);
        localStorage.removeItem('showWelcomeFlow'); // Clear the flag
      }
    }
  }, [isAuthenticated, user]);

  // Show loading during auth check and brief initialization
  if (isLoading || onboardingLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/auth" component={Auth} />
            <Route path="/login" component={Auth} />
            <Route path="/signup" component={Auth} />
            <Route path="/vouch/:token" component={VouchSubmit} />
            {/* Redirect all other paths to login */}
            <Route path="*">
              <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Please log in to continue</p>
                  <button 
                    onClick={() => window.location.href = "/auth"}
                    className="bg-primary text-white px-4 py-2 rounded-lg"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </Route>
          </>
        ) : (
          <>
            <Route path="/" component={shouldShowWelcome ? Welcome : TrustHub} />
            <Route path="/browse" component={Browse} />
            <Route path="/browse-test" component={BrowseTest} />
            <Route path="/help" component={Help} />

            <Route path="/discover" component={Discover} />
            <Route path="/discovery" component={Discovery} />
            <Route path="/matches" component={Matches} />
            <Route path="/voucher-interviews" component={RealOneInterviews} />
            <Route path="/profile" component={Profile} />
            <Route path="/profiles/:id" component={ProfileDetail} />
            <Route path="/profiles/:id/vouches" component={ProfileVouches} />
            <Route path="/vouches" component={Vouches} />
            <Route path="/vouch/:token" component={VouchSubmit} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/settings" component={Settings} />
            <Route path="/welcome" component={Welcome} />
            <Route path="/relationship-stages" component={RelationshipStages} />
            <Route path="/circles" component={Circles} />
            <Route path="/circles/:id" component={CircleDetail} />
            <Route path="/admin" component={AdminDashboard} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Onboarding Tour */}
      {isAuthenticated && !onboardingLoading && (
        <OnboardingTour
          isOpen={shouldShowTour}
          onClose={markTourCompleted}
          onComplete={markTourCompleted}
        />
      )}
      
      {/* Contextual Help */}
      {isAuthenticated && <ContextualHelp variant="floating" />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
