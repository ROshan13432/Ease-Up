import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function VoiceAssistantButton() {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleVoiceAssistant = () => {
    setIsListening(true);
    
    // Simulate voice recognition activation
    toast({
      title: "Voice Assistant Activated",
      description: "What can I help you with?",
    });
    
    // Simulate voice recognition ending after 3 seconds
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };

  return (
    <Button
      className={`fixed right-4 bottom-24 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-light transition-all bg-accent ${isListening ? 'animate-pulse' : ''}`}
      aria-label="Voice Assistant"
      onClick={handleVoiceAssistant}
    >
      <span className="material-icons text-3xl">mic</span>
    </Button>
  );
}
