import { useEffect, useState } from "react";
import { useParams, useLocation, useRoute, useRouter } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { getServiceBgColor } from "@/lib/utils";

// Schema for the form values
const schedulingFormSchema = z.object({
  appointmentDate: z.date({
    required_error: "Please select a date for your appointment.",
  }),
  preferredTime: z.string({
    required_error: "Please select a preferred time.",
  }),
});

type SchedulingFormValues = z.infer<typeof schedulingFormSchema>;

export default function SchedulingPage() {
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();
  const { id, tasks } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location);
  const groceryItems = searchParams.get("groceryItems") || "";
  
  // Helper function to get task list
  const getTasksList = () => {
    if (!tasks) return [];
    return decodeURIComponent(tasks).split(",");
  };
  
  // Prepare available time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];
  
  // Get service data
  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
  });
  
  // Form definition with default values
  const form = useForm<SchedulingFormValues>({
    resolver: zodResolver(schedulingFormSchema),
    defaultValues: {
      appointmentDate: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000), // Tomorrow
      preferredTime: "9:00 AM",
    },
  });
  
  // Handle help overlay
  const handleHelpClick = () => {
    setShowHelp(true);
  };
  
  const handleCloseHelp = () => {
    setShowHelp(false);
  };
  
  const handleNavigateBack = () => {
    // Go back to service details page
    router.navigate(`/service/${id}`);
  };
  
  const onSubmit = (data: SchedulingFormValues) => {
    console.log("Scheduling form submitted:", data);
    
    // Create URL for provider selection with all parameters
    let url = `/booking/${id}/provider-selection?tasks=${encodeURIComponent(getTasksList().join(','))}&date=${format(data.appointmentDate, 'yyyy-MM-dd')}&time=${encodeURIComponent(data.preferredTime)}`;
    
    // Add grocery items if present
    if (groceryItems) {
      url += `&groceryItems=${groceryItems}`;
    }
    
    // Navigate to provider selection
    router.navigate(url);
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-20 bg-[#f6f8f9]">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {isLoadingService ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : service ? (
          <div className={`${getServiceBgColor(id)} text-white rounded-xl p-6 shadow-md mb-6`}>
            <button 
              className="flex items-center text-white text-sm mb-6 hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1"
              onClick={handleNavigateBack}
              aria-label="Go back to service details"
            >
              <span className="material-icons mr-1 text-sm">arrow_back</span>
              <span>Back to Service Details</span>
            </button>
            
            <div className="flex items-start mb-4">
              <div className="bg-white/20 rounded-xl w-14 h-14 flex items-center justify-center mr-4">
                <span className="material-icons">
                  {service.icon === "cleaning_services" ? "home" : 
                   service.icon === "yard" ? "build" :
                   service.icon === "shopping_basket" ? "shopping_cart" :
                   service.icon === "health_and_safety" ? "favorite" : 
                   service.icon}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{service.name}</h2>
                <p className="text-white/90">{service.shortDescription}</p>
              </div>
            </div>
            
            <div className="p-4 bg-white/10 rounded-xl mb-4">
              <h3 className="text-lg font-semibold mb-2">Selected Tasks:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {getTasksList().map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl p-6 text-black">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                    When would you like this service?
                  </h3>
                  
                  {/* Date Selection - Calendar */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-lg font-medium text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-5 w-5" />
                              <span>Select Date</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <div className="border border-gray-200 rounded-xl p-2 overflow-hidden">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                                }
                                className="rounded-xl mx-auto"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Time Selection */}
                  <div>
                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-lg font-medium text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5" />
                              <span>Select Preferred Time</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
                              {timeSlots.map((time) => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={field.value === time ? "default" : "outline"}
                                  className={`py-6 text-lg ${
                                    field.value === time 
                                      ? "border-2 border-primary" 
                                      : "border border-gray-200"
                                  }`}
                                  onClick={() => field.onChange(time)}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`w-full mt-8 py-6 text-lg ${getServiceBgColor(id)} hover:opacity-90 text-white font-medium rounded-lg`}
                  >
                    Continue to Select Provider
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <span className="material-icons text-neutral-400 text-5xl mb-2">error_outline</span>
            <p className="text-xl text-neutral-600">Service not found</p>
            <button 
              className="mt-4 text-primary font-medium text-lg hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
              onClick={() => router.navigate("/")}
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