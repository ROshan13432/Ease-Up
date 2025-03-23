import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Service } from "@shared/schema";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Define schema for the scheduling form
const schedulingFormSchema = z.object({
  appointmentDate: z.date({
    required_error: "Please select a date",
  }),
  appointmentTime: z.string({
    required_error: "Please select a time",
  }),
});

type SchedulingFormValues = z.infer<typeof schedulingFormSchema>;

export default function SchedulingPage() {
  const { id, tasks } = useParams<{ id: string; tasks: string }>();
  const [searchParams] = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();

  // Parse tasks from URL
  const decodedTasks = tasks ? decodeURIComponent(tasks).split(',') : [];
  
  // Parse grocery items if they exist
  const urlParams = new URLSearchParams(searchParams);
  const groceryItemsParam = urlParams.get('groceryItems');
  const groceryItems = groceryItemsParam ? JSON.parse(decodeURIComponent(groceryItemsParam)) : [];

  // Get service color based on id
  const getServiceBgColor = (serviceId: string) => {
    const colors: Record<string, string> = {
      "1": "bg-[#373276]", // Dark blue/purple for Household Tasks
      "2": "bg-[#7E3A00]", // Brown for Yard & Maintenance
      "3": "bg-[#0A5E44]", // Dark green for Grocery Shopping
      "4": "bg-[#841C44]", // Maroon/burgundy for Caregiver Services
      "5": "bg-[#336699]", // Blue for Repairs
      "6": "bg-[#4B2182]", // Purple for Other Services
    };
    return colors[serviceId] || "bg-primary";
  };

  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
  });

  const form = useForm<SchedulingFormValues>({
    resolver: zodResolver(schedulingFormSchema),
    defaultValues: {
      appointmentTime: ""
    }
  });

  const handleNavigateBack = () => {
    navigate(`/service/${id}`);
  };

  // Pre-defined time slots
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", 
    "16:00", "17:00", "18:00", "19:00"
  ];

  // Filter available time slots based on date (mock implementation)
  const getAvailableTimeSlots = (date: Date | undefined) => {
    if (!date) return [];
    
    // For demo purposes: weekends have different availability
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      // Weekends only morning slots
      return timeSlots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour < 14;
      });
    }
    
    // Weekdays: all slots available except a few
    return timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      // Remove some slots for demo
      return hour !== 12 && hour !== 13;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots(form.watch("appointmentDate"));

  const onSubmit = (data: SchedulingFormValues) => {
    // Create URL with all necessary parameters
    let url = `/booking/${id}/provider-selection?`;
    url += `tasks=${encodeURIComponent(decodedTasks.join(','))}`;
    url += `&date=${format(data.appointmentDate, "yyyy-MM-dd")}`;
    url += `&time=${data.appointmentTime}`;
    
    if (groceryItems.length > 0) {
      url += `&groceryItems=${encodeURIComponent(JSON.stringify(groceryItems))}`;
    }
    
    // Navigate to provider selection
    navigate(url);
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
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
                <p className="text-white/90">Schedule your service appointment</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 text-black mt-6">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">When would you like this service?</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Date Selection */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xl mb-3">Select a Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "h-20 text-lg pl-6 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-8 w-8 opacity-70 mr-3" />
                                      <div>
                                        <p className="text-xl">{format(field.value, "EEEE")}</p>
                                        <p className="text-lg font-medium">{format(field.value, "MMMM d, yyyy")}</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-8 w-8 opacity-50 mr-3" />
                                      <span className="text-xl">Pick a date</span>
                                    </div>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  isBefore(date, startOfDay(new Date())) || 
                                  // Disable dates more than 30 days in the future
                                  isAfter(date, addDays(new Date(), 30))
                                }
                                initialFocus
                                className="rounded-md border"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="appointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xl mb-3">Select a Time</FormLabel>
                          
                          {form.watch("appointmentDate") ? (
                            <div>
                              <div className="text-lg mb-4">
                                Available times for {form.watch("appointmentDate") ? 
                                  format(form.watch("appointmentDate"), "EEEE, MMMM d") : ""}:
                              </div>
                              
                              {availableTimeSlots.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {availableTimeSlots.map((time) => (
                                    <Button
                                      key={time}
                                      type="button"
                                      variant={field.value === time ? "default" : "outline"}
                                      className={`h-16 text-lg ${field.value === time ? "bg-primary text-white" : ""}`}
                                      onClick={() => field.onChange(time)}
                                    >
                                      {time}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                                  <p className="text-lg text-muted-foreground">No available times for the selected date.</p>
                                  <p className="text-sm text-muted-foreground mt-2">Please select a different date.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50">
                              <p className="text-lg text-muted-foreground">Please select a date first</p>
                            </div>
                          )}
                          
                          <FormMessage className="text-base mt-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full py-6 text-xl ${getServiceBgColor(id)} hover:opacity-90`}
                    disabled={!form.formState.isValid}
                  >
                    Continue to Select Provider
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <span className="material-icons text-neutral-400 text-5xl mb-2">error_outline</span>
            <p className="text-xl text-neutral-600">Service not found</p>
            <button 
              className="mt-4 text-primary font-medium text-lg hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
              onClick={() => navigate("/")}
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