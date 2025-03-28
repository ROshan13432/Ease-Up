import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addDays, format, parse, isBefore, isAfter, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { Service, Provider, Booking, insertBookingSchema } from "@shared/schema";

// Time slots available for booking
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// Extend booking schema for the form
const bookingFormSchema = insertBookingSchema.extend({
  appointmentDate: z.date({
    required_error: "Please select a date",
  }).refine(
    date => isAfter(date, startOfDay(new Date())),
    {
      message: "Appointment date must be in the future",
    }
  ),
  appointmentTime: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const { serviceId, providerId } = useParams<{ serviceId: string, providerId: string }>();
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Parse query parameters
  const queryParams = window.location.search;
  const searchParams = new URLSearchParams(queryParams);
  const tasks = searchParams.get("tasks")?.split(",") || [];
  const groceryItemsParam = searchParams.get("groceryItems") || "";
  const groceryItems = groceryItemsParam ? JSON.parse(decodeURIComponent(groceryItemsParam)) : [];

  const { data: service } = useQuery<Service>({
    queryKey: [`/api/services/${serviceId}`],
  });

  const { data: provider } = useQuery<Provider>({
    queryKey: [`/api/providers/${providerId}`],
  });

  // Get existing bookings to disable already booked time slots
  const { data: existingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/providers/${providerId}/bookings`],
  });

  // Create default notes text with grocery items if this is a grocery shopping service
  const createDefaultNotes = () => {
    if (serviceId === "3" && groceryItems.length > 0) {
      return `Grocery Shopping List:\n- ${groceryItems.join("\n- ")}`;
    }
    return "";
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: parseInt(serviceId),
      providerId: parseInt(providerId),
      appointmentDate: addDays(new Date(), 1),
      appointmentTime: "",
      notes: createDefaultNotes(),
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: BookingFormValues) => {
      const { appointmentDate, appointmentTime, ...rest } = booking;
      
      // Combine date and time
      const dateTimeStr = format(appointmentDate, 'yyyy-MM-dd') + 'T' + appointmentTime;
      const combinedDateTime = new Date(dateTimeStr);
      
      const newBooking = {
        ...rest,
        appointmentDate: combinedDateTime.toISOString(),
      };
      
      const res = await apiRequest("POST", "/api/bookings", newBooking);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully scheduled. You will receive a confirmation call 24 hours before the appointment.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate("/bookings");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
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

  const handleNavigateBack = () => {
    navigate(`/booking/${serviceId}/provider-selection${window.location.search}`);
  };

  // Check if a time slot is already booked for the selected date
  const isTimeSlotBooked = (date: Date, timeSlot: string) => {
    if (!existingBookings) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return existingBookings.some(booking => {
      const bookingDate = new Date(booking.appointmentDate);
      const bookingDateStr = format(bookingDate, 'yyyy-MM-dd');
      const bookingTimeStr = format(bookingDate, 'HH:mm');
      
      return bookingDateStr === dateStr && bookingTimeStr === timeSlot;
    });
  };

  // Get available time slots for the selected date
  const getAvailableTimeSlots = (date: Date) => {
    return TIME_SLOTS.filter(slot => !isTimeSlotBooked(date, slot));
  };

  const onSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };

  const selectedDate = form.watch("appointmentDate");
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <button 
          className="flex items-center text-primary text-lg mb-4 hover:text-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
          onClick={handleNavigateBack}
          aria-label="Go back to service details"
        >
          <span className="material-icons mr-2">arrow_back</span>
          <span>Back to Service</span>
        </button>
        
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-3xl font-bold mb-6">Book Appointment</h2>
          
          {service && provider ? (
            <div className="mb-6 flex items-start gap-4">
              <div className={`bg-primary rounded-full p-3 shrink-0`}>
                <span className="material-icons text-white text-3xl">{service.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-medium">{service.name}</h3>
                <div className="flex items-center mt-2">
                  <span className="font-medium text-lg">Provider:</span>
                  <span className="ml-2 text-lg">{provider.name}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Display tasks */}
              {tasks.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium mb-2">Selected Tasks:</h3>
                  <ul className="ml-2">
                    {tasks.map((task, index) => (
                      <li key={index} className="flex items-start mb-1">
                        <span className="material-icons text-primary text-sm mr-1 mt-1">check_circle</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Display grocery list for grocery shopping service */}
              {serviceId === "3" && groceryItems.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2 flex items-center">
                    <span className="material-icons mr-2">shopping_cart</span>
                    Grocery Shopping List
                  </h3>
                  <ul className="ml-2">
                    {groceryItems.map((item, index) => (
                      <li key={index} className="flex items-start mb-1">
                        <span className="material-icons text-green-600 text-sm mr-1 mt-1">check</span>
                        <span className="text-green-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-lg mb-2">Appointment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal h-14 text-lg",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "EEEE, MMMM d, yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg mb-2">Appointment Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="grid grid-cols-2 gap-1 p-1">
                            {availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot} className="text-lg rounded-md p-2 cursor-pointer hover:bg-primary/10">
                                  {slot.replace(":00", "")}:00
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground col-span-2">
                                No available times for this date
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg mb-2">Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any special instructions or needs here..." 
                        className="text-lg min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-base" />
                  </FormItem>
                )}
              />
              
              {/* Confirmation call notification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 flex items-start">
                <span className="material-icons text-blue-600 mr-3 text-xl mt-0.5">info</span>
                <div>
                  <p className="font-medium text-lg">Confirmation Call</p>
                  <p className="mt-1">
                    You will receive a confirmation call from your provider 24 hours before your scheduled appointment.
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full text-lg py-6 mt-6" 
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>

      <BottomNavigation currentPath="/" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
