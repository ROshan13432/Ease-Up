import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import ServiceDetailsPage from "@/pages/service-details-page";
import SchedulingPage from "@/pages/scheduling-page";
import ProviderSelectionPage from "@/pages/provider-selection-page";
import BookingPage from "@/pages/booking-page";
import ProfilePage from "@/pages/profile-page";
import BookingsPage from "@/pages/bookings-page";
import MessagesPage from "@/pages/messages-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/service/:id" component={ServiceDetailsPage} />
      <Route path="/scheduling/:id/:tasks" component={SchedulingPage} />
      <Route path="/booking/:serviceId/provider-selection" component={ProviderSelectionPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/booking/:serviceId/:providerId" component={BookingPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/bookings" component={BookingsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
