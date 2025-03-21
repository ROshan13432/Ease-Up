import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Provider } from "@shared/schema";

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [showHelp, setShowHelp] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get favorite providers
  const { data: favoriteProviders, isLoading: isLoadingFavorites } = useQuery<Provider[]>({
    queryKey: ["/api/user/favorites"],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      emergencyContact: user?.emergencyContact || "",
      emergencyPhone: user?.emergencyPhone || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.setQueryData(["/api/user"], data);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (providerId: number) => {
      await apiRequest("DELETE", `/api/user/favorites/${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: "Provider Removed",
        description: "Provider has been removed from favorites.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const handleProviderClick = (providerId: number) => {
    // Find which service this provider offers
    navigate(`/providers/${providerId}`);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, providerId: number) => {
    e.stopPropagation();
    removeFromFavoritesMutation.mutate(providerId);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/4 flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarFallback className="text-4xl bg-primary text-white">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-medium text-center mb-1">{user?.fullName || user?.username}</h3>
            <p className="text-neutral-600 mb-6 text-center">Member since {new Date().getFullYear()}</p>
            
            <Button 
              variant="outline" 
              className="w-full text-lg py-6 mb-2"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">logout</span>
                  Sign Out
                </>
              )}
            </Button>
          </div>
          
          <div className="md:w-3/4">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details" className="text-lg py-3">Personal Details</TabsTrigger>
                <TabsTrigger value="favorites" className="text-lg py-3">Favorite Providers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" className="text-lg py-6" {...field} />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your phone number" className="text-lg py-6" {...field} />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Home Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your address" className="text-lg py-6" {...field} />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        
                        <h3 className="text-xl font-medium pt-4 pb-2">Emergency Contact</h3>
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Emergency contact name" className="text-lg py-6" {...field} />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Contact Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Emergency contact phone" className="text-lg py-6" {...field} />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full text-lg py-6 mt-6" 
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Favorite Service Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingFavorites ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : favoriteProviders && favoriteProviders.length > 0 ? (
                      <div className="space-y-4">
                        {favoriteProviders.map(provider => (
                          <div 
                            key={provider.id} 
                            className="bg-neutral-100 p-4 rounded-lg flex items-center cursor-pointer hover:bg-neutral-200 transition-colors"
                            onClick={() => handleProviderClick(provider.id)}
                          >
                            <div className="bg-primary rounded-full p-2 mr-4">
                              <span className="material-icons text-white">person</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium">{provider.name}</h4>
                              <div className="flex items-center">
                                <div className="flex items-center text-accent">
                                  {[...Array(Math.floor(provider.rating))].map((_, i) => (
                                    <span key={i} className="material-icons text-sm">star</span>
                                  ))}
                                  {provider.rating % 1 !== 0 && (
                                    <span className="material-icons text-sm">star_half</span>
                                  )}
                                </div>
                                <span className="text-sm ml-1">{provider.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <button 
                              className="flex items-center justify-center p-2 text-red-500 hover:bg-red-100 rounded-full"
                              onClick={(e) => handleRemoveFavorite(e, provider.id)}
                              aria-label={`Remove ${provider.name} from favorites`}
                            >
                              <span className="material-icons">favorite</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="material-icons text-neutral-400 text-5xl mb-2">favorite_border</span>
                        <p className="text-xl text-neutral-600">You haven't added any favorites yet</p>
                        <Button 
                          className="mt-4"
                          onClick={() => navigate("/")}
                        >
                          Browse Services
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BottomNavigation currentPath="/profile" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
