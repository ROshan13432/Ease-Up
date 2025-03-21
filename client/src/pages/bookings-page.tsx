import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import AppointmentCard from "@/components/services/appointment-card";
import { Booking } from "@shared/schema";

export default function BookingsPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your appointment has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handleContactClick = () => {
    navigate("/messages");
  };

  const handleRescheduleClick = (booking: Booking) => {
    navigate(`/booking/${booking.serviceId}/${booking.providerId}`);
  };

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings?.filter(
    booking => new Date(booking.appointmentDate) >= now
  ).sort((a, b) => 
    new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  ) || [];
  
  const pastBookings = bookings?.filter(
    booking => new Date(booking.appointmentDate) < now
  ).sort((a, b) => 
    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  ) || [];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" className="text-lg py-3">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="text-lg py-3">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <AppointmentCard 
                    key={booking.id} 
                    booking={booking}
                    onContactClick={handleContactClick}
                    onRescheduleClick={() => handleRescheduleClick(booking)}
                    onCancelClick={() => handleCancelBooking(booking.id)}
                    showCancelButton
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <span className="material-icons text-neutral-400 text-5xl mb-2">event_busy</span>
                <p className="text-xl text-neutral-600 mb-4">You have no upcoming appointments</p>
                <button 
                  className="text-primary font-medium text-lg hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
                  onClick={() => navigate("/")}
                >
                  Browse Services
                </button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map(booking => (
                  <AppointmentCard 
                    key={booking.id} 
                    booking={booking}
                    isPast
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <span className="material-icons text-neutral-400 text-5xl mb-2">history</span>
                <p className="text-xl text-neutral-600">You have no past appointments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation currentPath="/bookings" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
