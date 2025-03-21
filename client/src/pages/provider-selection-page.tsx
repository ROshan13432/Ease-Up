import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import ProviderCard from "@/components/services/provider-card";
import { Service, Provider } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProviderSelectionPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [showHelp, setShowHelp] = useState(false);
  const [location, navigate] = useLocation();
  
  // Parse query parameters from location
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const tasks = searchParams.get("tasks")?.split(",") || [];
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  // Get service data
  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${serviceId}`],
  });

  // Get providers for this service
  const { data: providers, isLoading: isLoadingProviders } = useQuery<Provider[]>({
    queryKey: [`/api/providers/service/${serviceId}`],
  });

  // Get service color based on id
  const getServiceBgColor = (serviceId: string) => {
    const colors: Record<string, string> = {
      "1": "bg-[#373276]", // Dark blue/purple for Household Tasks
      "2": "bg-[#7E3A00]", // Brown for Yard & Maintenance
      "3": "bg-[#0A5E44]", // Dark green for Grocery Shopping
      "4": "bg-[#841C44]", // Maroon/burgundy for Caregiver Services
      "5": "bg-[#4B2182]", // Purple for Other Services
    };
    return colors[serviceId] || "bg-primary";
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handleNavigateBack = () => {
    navigate(`/service/${serviceId}`);
  };

  const handleBookProvider = (providerId: number) => {
    navigate(`/booking/${serviceId}/${providerId}?tasks=${tasks.join(',')}&date=${date}&time=${time}`);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-[#f6f8f9]">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <button 
          className="flex items-center text-primary text-lg mb-4 hover:text-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
          onClick={handleNavigateBack}
          aria-label="Go back to service details"
        >
          <span className="material-icons mr-2">arrow_back</span>
          <span>Back to Service Details</span>
        </button>
        
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-3xl font-bold mb-6">Select a Provider</h2>
          
          {service && (
            <div className="mb-6 flex items-start gap-4">
              <div className={`${getServiceBgColor(serviceId)} rounded-full p-3 shrink-0`}>
                <span className="material-icons text-white text-3xl">{service.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-medium">{service.name}</h3>
                {tasks.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Selected Tasks:</p>
                    <ul className="ml-2 mt-1">
                      {tasks.map((task: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="material-icons text-primary text-sm mr-1">check_circle</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isLoadingProviders || isLoadingService ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map(provider => (
                <ProviderCard 
                  key={provider.id} 
                  provider={provider}
                  onBookClick={() => handleBookProvider(provider.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-gray-400 text-5xl mb-2">person_off</span>
              <p className="text-xl text-gray-600">No providers available for this service</p>
              <Button 
                className="mt-4"
                onClick={handleNavigateBack}
              >
                Go Back
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation currentPath={`/service/${serviceId}`} />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}