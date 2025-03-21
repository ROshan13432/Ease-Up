import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Booking } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Provider, Service } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentCardProps {
  booking: Booking;
  onContactClick?: () => void;
  onRescheduleClick?: () => void;
  onCancelClick?: () => void;
  showCancelButton?: boolean;
  isPast?: boolean;
}

export default function AppointmentCard({ 
  booking, 
  onContactClick, 
  onRescheduleClick,
  onCancelClick,
  showCancelButton = false,
  isPast = false 
}: AppointmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${booking.serviceId}`],
  });

  const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
    queryKey: [`/api/providers/${booking.providerId}`],
  });

  const appointmentDate = new Date(booking.appointmentDate);
  const formattedDate = format(appointmentDate, "EEEE, MMMM d");
  const formattedTime = format(appointmentDate, "h:mm a");

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoadingService || isLoadingProvider) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md mb-4">
        <div className="flex items-start">
          <Skeleton className="w-12 h-12 rounded-full mr-4" />
          <div className="flex-1">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-md mb-4">
      <div className="flex items-start">
        <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mr-4 shrink-0">
          <span className="material-icons text-white">
            {service?.icon || "calendar_today"}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-1">{service?.name}</h3>
          <div className="flex flex-col md:flex-row md:items-center text-neutral-600 mb-3">
            <div className="flex items-center mr-4 mb-1 md:mb-0">
              <span className="material-icons text-neutral-500 mr-1 text-lg">calendar_today</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral-500 mr-1 text-lg">schedule</span>
              <span>{formattedTime}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="bg-primary-light w-10 h-10 rounded-full flex items-center justify-center mr-2">
                <span className="material-icons text-white">person</span>
              </div>
              <div>
                <p className="font-medium">{provider?.name}</p>
                {provider && (
                  <div className="flex items-center">
                    {[...Array(Math.floor(provider.rating))].map((_, i) => (
                      <span key={i} className="material-icons text-accent text-sm">star</span>
                    ))}
                    {provider.rating % 1 !== 0 && (
                      <span className="material-icons text-accent text-sm">star_half</span>
                    )}
                    <span className="text-sm ml-1">{provider.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {!isPast && (
              <div className="flex space-x-2 w-full md:w-auto">
                {onContactClick && (
                  <Button
                    className="flex-1 md:flex-none flex items-center justify-center"
                    onClick={onContactClick}
                  >
                    <span className="material-icons mr-2">message</span>
                    <span>Contact</span>
                  </Button>
                )}
                
                {onRescheduleClick && (
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none flex items-center justify-center"
                    onClick={onRescheduleClick}
                  >
                    <span className="material-icons mr-2">edit_calendar</span>
                    <span>Reschedule</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="mt-2">
              <button
                className="text-primary flex items-center text-sm font-medium"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                aria-controls={`notes-${booking.id}`}
              >
                <span className="material-icons text-sm mr-1">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
                {isExpanded ? "Hide Notes" : "View Notes"}
              </button>
              
              {isExpanded && (
                <div id={`notes-${booking.id}`} className="mt-2 p-3 bg-neutral-100 rounded-lg">
                  <p className="text-neutral-700">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {showCancelButton && onCancelClick && (
            <div className="mt-3 border-t pt-3 border-neutral-200">
              <Button 
                variant="destructive" 
                className="w-full md:w-auto"
                onClick={onCancelClick}
              >
                <span className="material-icons mr-2">cancel</span>
                Cancel Appointment
              </Button>
            </div>
          )}

          {isPast && (
            <div className="mt-3 border-t pt-3 border-neutral-200 flex justify-between items-center">
              <span className="text-neutral-600">Completed</span>
              <Button variant="link" className="p-0">
                <span className="material-icons mr-1">rate_review</span>
                Leave Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
