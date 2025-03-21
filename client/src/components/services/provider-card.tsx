import { Provider } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProviderCardProps {
  provider: Provider;
  onBookClick: () => void;
}

export default function ProviderCard({ provider, onBookClick }: ProviderCardProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(provider.isFavorite || false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/user/favorites/${provider.id}`);
      } else {
        await apiRequest("POST", "/api/user/favorites", { providerId: provider.id });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? `${provider.name} removed from your favorites` 
          : `${provider.name} added to your favorites`,
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <div className="border-b border-neutral-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start">
        <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center mr-4 shrink-0">
          <span className="material-icons text-white text-2xl">person</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <h4 className="text-xl font-medium">{provider.name}</h4>
            <div className="flex items-center mt-1 md:mt-0">
              {[...Array(Math.floor(provider.rating))].map((_, i) => (
                <span key={i} className="material-icons text-accent text-sm">star</span>
              ))}
              {provider.rating % 1 !== 0 && (
                <span className="material-icons text-accent text-sm">star_half</span>
              )}
              <span className="text-sm ml-1">{provider.rating.toFixed(1)} ({provider.reviews} reviews)</span>
            </div>
          </div>
          <p className="text-neutral-600 mb-3">{provider.experience}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {provider.tags?.map((tag, index) => (
              <span key={index} className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              className="py-3 text-lg flex items-center justify-center flex-1 md:flex-none"
              onClick={onBookClick}
            >
              <span>Book This Provider</span>
              <span className="material-icons ml-2">arrow_forward</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="material-icons text-2xl text-red-500">
                {isFavorite ? "favorite" : "favorite_border"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
