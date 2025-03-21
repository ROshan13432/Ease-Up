import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import ProviderCard from "@/components/services/provider-card";
import { Service, Provider } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();

  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
  });

  const { data: providers, isLoading: isLoadingProviders } = useQuery<Provider[]>({
    queryKey: [`/api/services/${id}/providers`],
  });

  const handleNavigateBack = () => {
    navigate("/");
  };

  const handleBookProvider = (providerId: number) => {
    navigate(`/booking/${id}/${providerId}`);
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
        <button 
          className="flex items-center text-primary text-lg mb-4 hover:text-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
          onClick={handleNavigateBack}
          aria-label="Go back to services list"
        >
          <span className="material-icons mr-2">arrow_back</span>
          <span>Back to Services</span>
        </button>
        
        {isLoadingService ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        ) : service ? (
          <div className="mb-6">
            <h2 className="text-3xl font-bold flex items-center mb-4">
              <span className={`material-icons bg-primary text-white p-2 rounded-full mr-3 text-3xl`}>
                {service.icon}
              </span>
              {service.name}
            </h2>
            
            <p className="text-xl text-neutral-600 mb-6">{service.description}</p>
            
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="text-2xl font-medium mb-4">What's included:</h3>
              <ul className="text-lg space-y-3">
                {service.inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="material-icons text-secondary mr-2 mt-1">check_circle</span>
                    <span>{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md mb-8">
              <h3 className="text-2xl font-medium mb-4">Available Service Providers</h3>
              
              {isLoadingProviders ? (
                <div className="space-y-6">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : providers && providers.length > 0 ? (
                <div className="space-y-6">
                  {providers.map((provider) => (
                    <ProviderCard 
                      key={provider.id} 
                      provider={provider} 
                      onBookClick={() => handleBookProvider(provider.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-icons text-neutral-400 text-5xl mb-2">person_off</span>
                  <p className="text-xl text-neutral-600">No providers available at this time</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-neutral-400 text-5xl mb-2">error_outline</span>
            <p className="text-xl text-neutral-600">Service not found</p>
            <button 
              className="mt-4 text-primary font-medium text-lg hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
              onClick={handleNavigateBack}
            >
              Return to Services
            </button>
          </div>
        )}
      </main>

      <BottomNavigation currentPath="/" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
