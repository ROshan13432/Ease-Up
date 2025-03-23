import { users, services, providers, bookings, favorites, messages } from "@shared/schema";
import type { 
  User, InsertUser, Service, Provider, Booking, InsertBooking, 
  Message, InsertMessage 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Service operations
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  
  // Provider operations
  getProvider(id: number): Promise<Provider | undefined>;
  getProvidersByService(serviceId: number): Promise<Provider[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByProvider(providerId: number): Promise<Booking[]>;
  deleteBooking(id: number): Promise<void>;
  
  // Favorites operations
  getFavoriteProviders(userId: number): Promise<Provider[]>;
  addFavoriteProvider(userId: number, providerId: number): Promise<void>;
  removeFavoriteProvider(userId: number, providerId: number): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId: number, providerId: number): Promise<Message[]>;
  getMessagedProviders(userId: number): Promise<Provider[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private providers: Map<number, Provider>;
  private bookings: Map<number, Booking>;
  private favorites: Map<string, number>; // userId-providerId -> favoriteId
  private messages: Map<number, Message>;
  public sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private bookingIdCounter: number = 1;
  private messageIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.providers = new Map();
    this.bookings = new Map();
    this.favorites = new Map();
    this.messages = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 1 day
    });
    
    // Initialize with services data
    this.initServices();
    this.initProviders();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Service methods
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  // Provider methods
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }
  
  async getProvidersByService(serviceId: number): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(provider => 
      provider.services.includes(this.services.get(serviceId)?.name || "")
    );
  }
  
  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const newBooking: Booking = { 
      ...booking, 
      id,
      status: 'scheduled',
      // Ensure appointmentDate is handled properly
      appointmentDate: booking.appointmentDate instanceof Date 
        ? booking.appointmentDate 
        : new Date(booking.appointmentDate as unknown as string),
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );
  }
  
  async getBookingsByProvider(providerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.providerId === providerId
    );
  }
  
  async deleteBooking(id: number): Promise<void> {
    this.bookings.delete(id);
  }
  
  // Favorites methods
  async getFavoriteProviders(userId: number): Promise<Provider[]> {
    const providerIds: Set<number> = new Set();
    
    // Collect provider IDs from favorites
    for (const [key, _] of this.favorites.entries()) {
      const [favUserId, provId] = key.split('-').map(Number);
      if (favUserId === userId) {
        providerIds.add(provId);
      }
    }
    
    // Get provider objects
    const favoriteProviders: Provider[] = [];
    for (const providerId of providerIds) {
      const provider = await this.getProvider(providerId);
      if (provider) {
        favoriteProviders.push({...provider, isFavorite: true});
      }
    }
    
    return favoriteProviders;
  }
  
  async addFavoriteProvider(userId: number, providerId: number): Promise<void> {
    const key = `${userId}-${providerId}`;
    if (!this.favorites.has(key)) {
      this.favorites.set(key, Date.now());
    }
  }
  
  async removeFavoriteProvider(userId: number, providerId: number): Promise<void> {
    const key = `${userId}-${providerId}`;
    this.favorites.delete(key);
  }
  
  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = { 
      ...message, 
      id,
      // Ensure timestamp is handled properly
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async getMessages(userId: number, providerId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.userId === userId && message.providerId === providerId
      )
      .sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }
  
  async getMessagedProviders(userId: number): Promise<Provider[]> {
    const providerIds: Set<number> = new Set();
    
    // Collect unique provider IDs from messages
    for (const message of this.messages.values()) {
      if (message.userId === userId) {
        providerIds.add(message.providerId);
      }
    }
    
    // Get provider objects
    const messagedProviders: Provider[] = [];
    for (const providerId of providerIds) {
      const provider = await this.getProvider(providerId);
      if (provider) {
        // Check if this provider is a favorite
        const isFavorite = this.favorites.has(`${userId}-${providerId}`);
        messagedProviders.push({...provider, isFavorite});
      }
    }
    
    return messagedProviders;
  }
  
  // Initialize with sample data for services
  private initServices() {
    const servicesData: Service[] = [
      {
        id: 1,
        name: "Household tasks",
        shortDescription: "Help with cleaning, cooking, laundry, and daily chores",
        description: "Help with cleaning, cooking, laundry, and daily chores",
        icon: "cleaning_services",
        inclusions: [
          "General Cleaning: Dusting, vacuuming, mopping, and bathroom cleaning",
          "Meal Preparation: Cooking meals, meal planning, and kitchen organization",
          "Laundry Services: Washing, drying, folding, and ironing clothes",
          "Deep Cleaning Services: Intensive cleaning of specific areas or entire home",
          "Bedroom Care: Changing linens, organizing, and deep cleaning"
        ]
      },
      {
        id: 2,
        name: "Yard & Maintenance",
        shortDescription: "Lawn care, gardening, and home maintenance services",
        description: "Lawn care, gardening, and home maintenance services",
        icon: "yard",
        inclusions: [
          "Lawn mowing and edging",
          "Garden weeding and maintenance",
          "Leaf and debris removal",
          "Shrub and hedge trimming",
          "Basic outdoor cleaning"
        ]
      },
      {
        id: 3,
        name: "Grocery Shopping",
        shortDescription: "Assistance with shopping and delivery of groceries",
        description: "Assistance with shopping and delivery of groceries",
        icon: "shopping_basket",
        inclusions: [
          "Creating grocery lists",
          "Shopping at your preferred stores",
          "Picking fresh produce and quality items",
          "Delivery to your home",
          "Assistance with putting groceries away"
        ]
      },
      {
        id: 4,
        name: "Caregiver Services",
        shortDescription: "Professional care, companionship, and medical support",
        description: "Professional care, companionship, and medical support",
        icon: "health_and_safety",
        inclusions: [
          "Personal care assistance",
          "Medication reminders",
          "Meal preparation",
          "Light housekeeping",
          "Companionship and emotional support"
        ]
      },
      {
        id: 5,
        name: "Repairs",
        shortDescription: "Emergency and non-emergency home repair services",
        description: "Emergency and non-emergency home repair services",
        icon: "build",
        inclusions: [
          "Plumbing repairs: Fixing leaks, clogs, and basic plumbing issues",
          "Electrical repairs: Light fixtures, outlets, and basic electrical work",
          "Appliance troubleshooting: Basic diagnostics and minor repairs",
          "Furniture assembly and repairs",
          "Small carpentry and home fixes"
        ]
      },
      {
        id: 6,
        name: "Other Services",
        shortDescription: "Request any other assistance not listed above",
        description: "Request any other assistance not listed above",
        icon: "more_horiz",
        inclusions: [
          "Transportation assistance",
          "Technology help",
          "Pet care",
          "Errands and deliveries",
          "Custom assistance requests"
        ]
      }
    ];
    
    servicesData.forEach(service => {
      this.services.set(service.id, service);
    });
  }
  
  // Initialize with sample data for providers
  private initProviders() {
    const providersData: Provider[] = [
      {
        id: 1,
        name: "Sarah Johnson",
        experience: "5 years experience, background checked, certified in home cleaning",
        rating: 4.5,
        reviews: 129,
        tags: ["Available Weekdays", "Pet Friendly", "Eco Products"],
        services: ["Household tasks"]
      },
      {
        id: 2,
        name: "Michael Chen",
        experience: "8 years experience, background checked, deep cleaning specialist",
        rating: 5.0,
        reviews: 87,
        tags: ["Weekend Availability", "Deep Cleaning", "Senior Specialist"],
        services: ["Household tasks"]
      },
      {
        id: 3,
        name: "Robert Garcia",
        experience: "10 years experience, licensed landscaper, organic gardening specialist",
        rating: 4.8,
        reviews: 95,
        tags: ["Organic Methods", "Equipment Provided", "7-Day Availability"],
        services: ["Yard & Maintenance"]
      },
      {
        id: 4,
        name: "Jennifer Williams",
        experience: "6 years experience, trained personal shopper, dietary needs specialist",
        rating: 4.7,
        reviews: 112,
        tags: ["Dietary Restrictions", "Same-Day Delivery", "Comparative Shopping"],
        services: ["Grocery Shopping"]
      },
      {
        id: 5,
        name: "David Thompson",
        experience: "12 years experience, certified caregiver, specialized in elder care",
        rating: 4.9,
        reviews: 156,
        tags: ["Elder Care", "Medical Background", "Overnight Available"],
        services: ["Caregiver Services"]
      },
      {
        id: 6,
        name: "James Martinez",
        experience: "15 years experience, licensed handyman, plumbing and electrical certified",
        rating: 4.8,
        reviews: 142,
        tags: ["Emergency Available", "Licensed Professional", "All Tools Provided"],
        services: ["Repairs"]
      },
      {
        id: 7,
        name: "Emily Rodriguez",
        experience: "7 years experience, background checked, versatile assistance provider",
        rating: 4.6,
        reviews: 93,
        tags: ["Flexible Schedule", "Technology Savvy", "Transportation Available"],
        services: ["Other Services"]
      }
    ];
    
    providersData.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }
}

export const storage = new MemStorage();
