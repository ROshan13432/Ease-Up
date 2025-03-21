import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { Service, Provider } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define schema for the form
const taskFormSchema = z.object({
  selectedTasks: z.array(z.string()),
  preferredTime: z.string().optional(),
  appointmentDate: z.string().optional()
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [showHelp, setShowHelp] = useState(false);
  const [, navigate] = useLocation();

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

  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      selectedTasks: [],
      preferredTime: "",
      appointmentDate: ""
    }
  });

  const handleNavigateBack = () => {
    navigate("/");
  };

  const onSubmit = (data: TaskFormValues) => {
    console.log("Form submitted:", data);
    // Navigate to booking page or provider selection
    navigate(`/booking/${id}/provider-selection?tasks=${data.selectedTasks.join(',')}&date=${data.appointmentDate}&time=${data.preferredTime}`);
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  // Extract task names and descriptions from inclusions for all services
  const getTasksFromInclusions = () => {
    if (!service) return [];
    
    return service.inclusions.map(inclusion => {
      // Handle both formats: with colon or without
      if (inclusion.includes(": ")) {
        const [name, description] = inclusion.split(": ");
        return { name, description };
      } else {
        return { name: inclusion, description: "" };
      }
    });
  };

  const tasks = getTasksFromInclusions();

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
              aria-label="Go back to services list"
            >
              <span className="material-icons mr-1 text-sm">arrow_back</span>
              <span>Back to Services</span>
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
                <p className="text-white/90">{service.description}</p>
              </div>
            </div>

            {tasks.length > 0 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  <div className="bg-white rounded-xl p-6 text-black">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Select Tasks</h3>
                    
                    {tasks.map((task, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="mr-4">
                            {/* Select appropriate icon based on service type and task index */}
                            {id === "1" ? (
                              // Household tasks icons
                              index === 0 ? (
                                <span className="material-icons text-gray-600">cleaning_services</span>
                              ) : index === 1 ? (
                                <span className="material-icons text-gray-600">restaurant</span>
                              ) : index === 2 ? (
                                <span className="material-icons text-gray-600">local_laundry_service</span>
                              ) : index === 3 ? (
                                <span className="material-icons text-gray-600">cleaning</span>
                              ) : (
                                <span className="material-icons text-gray-600">bed</span>
                              )
                            ) : id === "2" ? (
                              // Yard & Maintenance icons
                              index === 0 ? (
                                <span className="material-icons text-gray-600">grass</span>
                              ) : index === 1 ? (
                                <span className="material-icons text-gray-600">yard</span>
                              ) : index === 2 ? (
                                <span className="material-icons text-gray-600">delete_sweep</span>
                              ) : index === 3 ? (
                                <span className="material-icons text-gray-600">content_cut</span>
                              ) : (
                                <span className="material-icons text-gray-600">build</span>
                              )
                            ) : id === "4" ? (
                              // Caregiver Services icons
                              index === 0 ? (
                                <span className="material-icons text-gray-600">accessibility</span>
                              ) : index === 1 ? (
                                <span className="material-icons text-gray-600">medical_services</span>
                              ) : index === 2 ? (
                                <span className="material-icons text-gray-600">restaurant</span>
                              ) : index === 3 ? (
                                <span className="material-icons text-gray-600">cleaning_services</span>
                              ) : (
                                <span className="material-icons text-gray-600">favorite</span>
                              )
                            ) : id === "3" ? (
                              // Grocery Shopping icons
                              index === 0 ? (
                                <span className="material-icons text-gray-600">list_alt</span>
                              ) : index === 1 ? (
                                <span className="material-icons text-gray-600">shopping_cart</span>
                              ) : index === 2 ? (
                                <span className="material-icons text-gray-600">shopping_basket</span>
                              ) : index === 3 ? (
                                <span className="material-icons text-gray-600">local_shipping</span>
                              ) : (
                                <span className="material-icons text-gray-600">kitchen</span>
                              )
                            ) : (
                              // Default icon for Other Services
                              <span className="material-icons text-gray-600">more_horiz</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{task.name}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="selectedTasks"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="h-5 w-5 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-primary"
                                  value={task.name}
                                  checked={field.value?.includes(task.name)}
                                  onChange={(e) => {
                                    const value = task.name;
                                    const values = [...(field.value || [])];
                                    if (e.target.checked) {
                                      values.push(value);
                                    } else {
                                      const index = values.indexOf(value);
                                      if (index !== -1) {
                                        values.splice(index, 1);
                                      }
                                    }
                                    field.onChange(values);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-600 mr-2">schedule</span>
                        <select 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          {...form.register("preferredTime")}
                        >
                          <option value="">Select preferred time</option>
                          <option value="morning">Morning (8am - 12pm)</option>
                          <option value="afternoon">Afternoon (12pm - 4pm)</option>
                          <option value="evening">Evening (4pm - 8pm)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="material-icons text-gray-600 mr-2">calendar_today</span>
                        <input
                          type="date"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          {...form.register("appointmentDate")}
                        />
                      </div>
                      

                    </div>
                    
                    <Button 
                      type="submit" 
                      className={`w-full mt-6 py-4 ${getServiceBgColor(id)} hover:opacity-90 text-white font-medium rounded-lg`}
                    >
                      Request Service
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="bg-white rounded-xl p-6 text-black mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Service Details</h3>
                <ul className="space-y-4">
                  {service.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="material-icons text-primary mr-2 mt-1">check_circle</span>
                      <span className="text-gray-700">{inclusion}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate(`/booking/${id}/provider-selection`)}
                  className={`w-full mt-6 py-4 ${getServiceBgColor(id)} hover:opacity-90 text-white font-medium rounded-lg`}
                >
                  Request Service
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
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
