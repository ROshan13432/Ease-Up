import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import AppointmentCard from "@/components/services/appointment-card";
import { Service, Booking } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();

  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: false, // Disable this query since we don't have authentication
  });

  const upcomingBookings: Booking[] = [];

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

  // Function to get the background color class based on service id
  const getServiceBgColor = (id: number) => {
    const colors = {
      1: "bg-[#373276]", // Dark blue/purple for Household Tasks
      2: "bg-[#7E3A00]", // Brown for Yard & Maintenance
      3: "bg-[#0A5E44]", // Dark green for Grocery Shopping
      4: "bg-[#841C44]", // Maroon/burgundy for Caregiver Services
      5: "bg-[#4B2182]", // Purple for Other Services
    };
    return colors[id as keyof typeof colors] || "bg-primary";
  };

  // Function to get the icon element based on service icon
  const getServiceIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "cleaning_services": <span className="material-icons text-white">home</span>,
      "yard": <span className="material-icons text-white">build</span>,
      "shopping_basket": <span className="material-icons text-white">shopping_cart</span>,
      "health_and_safety": <span className="material-icons text-white">favorite</span>,
      "more_horiz": <span className="material-icons text-white">more_horiz</span>,
    };
    return iconMap[icon] || <span className="material-icons text-white">{icon}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-[#f6f8f9]">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <section className="mb-6">
          <h1 className="text-3xl font-bold text-[#1e293b] mb-1">Ease Up</h1>
          <p className="text-lg text-[#475569]">How can we help you today?</p>
        </section>

        <section className="mb-10">
          {isLoadingServices ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services?.map((service) => (
                <div 
                  key={service.id} 
                  className={`${getServiceBgColor(service.id)} rounded-xl p-6 shadow-md text-white`}
                >
                  <div className="flex items-start mb-4">
                    <div className="bg-white/20 rounded-xl w-14 h-14 flex items-center justify-center mr-4">
                      {getServiceIcon(service.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                      <p className="text-white/90">{service.shortDescription}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleServiceClick(service.id)}
                    className="flex items-center text-white mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-white/70 rounded-md px-2 py-1"
                    aria-label={`Book ${service.name} service`}
                  >
                    <span className="font-medium">Book Service</span>
                    <span className="material-icons ml-1">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">Quick Access</h2>
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
          <h2 className="text-2xl font-bold mb-4 text-[#1e293b]">Upcoming Appointments</h2>
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
        </section>
      </main>

      <BottomNavigation currentPath="/" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
