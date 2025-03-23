import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get background color class for a service based on its ID
 * @param id Service ID as a string
 * @returns A Tailwind CSS class name for the background color
 */
export function getServiceBgColor(id: string | number) {
  const serviceId = typeof id === 'number' ? id.toString() : id;
  
  const colors: Record<string, string> = {
    "1": "bg-[#373276]", // Dark blue/purple for Household Tasks
    "2": "bg-[#7E3A00]", // Brown for Yard & Maintenance
    "3": "bg-[#0A5E44]", // Dark green for Grocery Shopping
    "4": "bg-[#841C44]", // Maroon/burgundy for Caregiver Services
    "5": "bg-[#4B2182]", // Purple for Repairs & Fixes
  };
  
  return colors[serviceId] || "bg-primary";
}
