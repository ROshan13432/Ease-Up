import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VoiceAssistantButton from "@/components/layout/voice-assistant-button";
import HelpOverlay from "@/components/layout/help-overlay";
import { Message, Provider } from "@shared/schema";

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function MessagesPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [activeProviderId, setActiveProviderId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: providers, isLoading: isLoadingProviders } = useQuery<Provider[]>({
    queryKey: ["/api/messages/providers"],
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/provider", activeProviderId],
    enabled: activeProviderId !== null,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { providerId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/provider", activeProviderId] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const selectProvider = (providerId: number) => {
    setActiveProviderId(providerId);
  };

  const onSubmit = (data: MessageFormValues) => {
    if (activeProviderId) {
      sendMessageMutation.mutate({
        providerId: activeProviderId,
        content: data.content,
      });
    }
  };

  const activeProvider = providers?.find(p => p.id === activeProviderId);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header onHelpClick={handleHelpClick} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-6">Messages</h2>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row h-[70vh]">
            <div className="md:w-1/3 border-r border-neutral-200">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="text-xl font-medium">Service Providers</h3>
              </div>
              
              {isLoadingProviders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : providers && providers.length > 0 ? (
                <div className="overflow-y-auto h-[calc(70vh-64px)]">
                  {providers.map(provider => (
                    <div 
                      key={provider.id}
                      className={`flex items-center p-4 cursor-pointer hover:bg-neutral-100 transition-colors ${activeProviderId === provider.id ? 'bg-neutral-100' : ''}`}
                      onClick={() => selectProvider(provider.id)}
                    >
                      <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mr-3">
                        <span className="material-icons text-white">person</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">{provider.name}</h4>
                        <p className="text-neutral-600 text-sm truncate">{provider.services?.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-neutral-400 text-5xl mb-2">forum</span>
                  <p className="text-xl text-neutral-600">No message threads yet</p>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 flex flex-col">
              {activeProvider ? (
                <>
                  <div className="p-4 border-b border-neutral-200 flex items-center">
                    <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <span className="material-icons text-white">person</span>
                    </div>
                    <h3 className="text-xl font-medium">{activeProvider.name}</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map(message => (
                        <div 
                          key={message.id}
                          className={`max-w-3/4 p-3 rounded-lg ${message.fromUser ? 'ml-auto bg-primary text-white' : 'bg-neutral-100'}`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${message.fromUser ? 'text-white/70' : 'text-neutral-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-neutral-600">No messages yet. Start a conversation!</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-neutral-200">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Type your message..."
                                  className="text-lg py-6"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          size="icon" 
                          className="h-14 w-14"
                          disabled={sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <span className="material-icons">send</span>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-icons text-neutral-400 text-5xl mb-2">chat</span>
                    <p className="text-xl text-neutral-600">Select a provider to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation currentPath="/messages" />
      <VoiceAssistantButton />
      <HelpOverlay isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
}
