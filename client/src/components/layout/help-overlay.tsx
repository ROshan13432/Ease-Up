import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  if (!isOpen) return null;

  const handleCallSupport = () => {
    // In a real app, this would initiate a call
    alert("Initiating support call...");
  };

  const handleViewTutorials = () => {
    // In a real app, this would navigate to tutorials
    alert("Opening tutorials...");
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-neutral-800 bg-opacity-80 z-50 flex items-center justify-center transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-white rounded-xl p-6 max-w-lg w-full m-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold">Need Help?</h2>
          <button 
            className="p-2 min-h-[3.5rem] min-w-[3.5rem] flex items-center justify-center rounded-full hover:bg-neutral-100" 
            aria-label="Close help" 
            onClick={onClose}
          >
            <span className="material-icons text-neutral-600 text-3xl">close</span>
          </button>
        </div>
        <div className="mb-6">
          <p className="text-xl mb-4">Here are some quick ways to get help:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="material-icons text-primary mr-2 mt-1">voice_chat</span>
              <div>
                <p className="font-medium text-lg">Use Voice Commands</p>
                <p className="text-neutral-600">Tap the microphone button and say what you need.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary mr-2 mt-1">support_agent</span>
              <div>
                <p className="font-medium text-lg">Call Support</p>
                <p className="text-neutral-600">Our team is available 24/7 to help you.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="material-icons text-primary mr-2 mt-1">menu_book</span>
              <div>
                <p className="font-medium text-lg">View Tutorials</p>
                <p className="text-neutral-600">Step-by-step guides on using the app.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex flex-col space-y-3">
          <Button
            className="py-6 text-lg flex items-center justify-center w-full"
            onClick={handleCallSupport}
          >
            <span className="material-icons mr-2">call</span>
            Call Support Now
          </Button>
          <Button
            variant="outline"
            className="py-6 text-lg flex items-center justify-center w-full"
            onClick={handleViewTutorials}
          >
            <span className="material-icons mr-2">play_circle</span>
            View Tutorials
          </Button>
        </div>
      </div>
    </div>
  );
}
