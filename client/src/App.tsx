import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import ServiceDetailsPage from "@/pages/service-details-page";
import BookingPage from "@/pages/booking-page";
import ProfilePage from "@/pages/profile-page";
import BookingsPage from "@/pages/bookings-page";
import MessagesPage from "@/pages/messages-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/service/:id" component={ServiceDetailsPage} />
      <Route path="/booking/:serviceId/:providerId" component={BookingPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/bookings" component={BookingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
