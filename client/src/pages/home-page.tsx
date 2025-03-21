import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import ServiceCard from "@/components/services/service-card";
import AppointmentCard from "@/components/services/appointment-card";
import { Service, Booking } from "@shared/schema";

export default function HomePage() {
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const upcomingBookings = bookings?.filter(
    (booking) => new Date(booking.appointmentDate) >= new Date()
  ).sort((a, b) => 
    new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  ) || [];

  const handleServiceClick = (serviceId: number) => {
    navigate(`/service/${serviceId}`);
  };

  const handleNavigateTo = (path: string) => {
    navigate(path);
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome, {user?.fullName || user?.username}</h2>
          <p className="text-xl mb-6">What type of help do you need today?</p>
        </section>

        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingServices ? (
              // Loading state for services
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="h-48 bg-neutral-200 animate-pulse rounded-xl"></div>
              ))
            ) : (
              services?.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => handleServiceClick(service.id)}
                />
              ))
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center justify-center min-h-[4.5rem] hover:bg-neutral-200 transition-all focus:ring-2 focus:ring-primary"
                onClick={() => handleNavigateTo("/bookings")}
                aria-label="View your bookings"
              >
                <span className="material-icons text-primary text-3xl mb-2">event</span>
                <span className="text-lg font-medium">My Bookings</span>
              </button>
              <button 
                className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center justify-center min-h-[4.5rem] hover:bg-neutral-200 transition-all focus:ring-2 focus:ring-primary"
                onClick={() => handleNavigateTo("/profile")}
                aria-label="View favorite service providers"
              >
                <span className="material-icons text-primary text-3xl mb-2">favorite</span>
                <span className="text-lg font-medium">Favorites</span>
              </button>
              <button 
                className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center justify-center min-h-[4.5rem] hover:bg-neutral-200 transition-all focus:ring-2 focus:ring-primary"
                onClick={() => handleNavigateTo("/messages")}
                aria-label="View your messages"
              >
                <span className="material-icons text-primary text-3xl mb-2">message</span>
                <span className="text-lg font-medium">Messages</span>
              </button>
              <button 
                className="bg-neutral-100 rounded-lg p-4 flex flex-col items-center justify-center min-h-[4.5rem] hover:bg-neutral-200 transition-all focus:ring-2 focus:ring-primary"
                onClick={() => handleNavigateTo("/profile")}
                aria-label="Emergency contacts"
              >
                <span className="material-icons text-status-error text-3xl mb-2">emergency</span>
                <span className="text-lg font-medium">Emergency</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          
          {isLoadingBookings ? (
            // Loading state for bookings
            <div className="h-32 bg-neutral-200 animate-pulse rounded-xl"></div>
          ) : upcomingBookings.length > 0 ? (
            <>
              {upcomingBookings.slice(0, 2).map((booking) => (
                <AppointmentCard 
                  key={booking.id} 
                  booking={booking} 
                  onContactClick={() => handleNavigateTo(`/messages`)}
                  onRescheduleClick={() => handleNavigateTo(`/booking/${booking.serviceId}/${booking.providerId}`)}
                />
              ))}
              
              {upcomingBookings.length > 2 && (
                <div className="text-center mt-6">
                  <button 
                    className="text-primary font-medium flex items-center mx-auto py-2 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 text-lg"
                    onClick={() => handleNavigateTo("/bookings")}
                    aria-label="View all of your appointments"
                  >
                    View All Appointments
                    <span className="material-icons ml-1">arrow_forward</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <span className="material-icons text-neutral-400 text-5xl mb-2">event_busy</span>
              <p className="text-xl text-neutral-600">You have no upcoming appointments</p>
              <button 
                className="mt-4 text-primary font-medium text-lg hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
                onClick={() => handleNavigateTo("/")}
              >
                Browse Services
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation currentPath="/" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
