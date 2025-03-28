import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Providers
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(parseInt(req.params.id));
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id/providers", async (req, res) => {
    try {
      const providers = await storage.getProvidersByService(parseInt(req.params.id));
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Provider bookings (for checking availability)
  app.get("/api/providers/:id/bookings", async (req, res) => {
    // Use a default user ID since we're not requiring authentication
    const defaultUserId = 1;
    
    try {
      const bookings = await storage.getBookingsByProvider(parseInt(req.params.id));
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bookings
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const booking = await storage.createBooking({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify that the booking belongs to the user
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this booking" });
      }
      
      await storage.deleteBooking(bookingId);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Favorites
  app.get("/api/user/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const favorites = await storage.getFavoriteProviders(req.user.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      await storage.addFavoriteProvider(req.user.id, req.body.providerId);
      res.sendStatus(201);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/user/favorites/:providerId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      await storage.removeFavoriteProvider(req.user.id, parseInt(req.params.providerId));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Messages
  app.get("/api/messages/providers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const providers = await storage.getMessagedProviders(req.user.id);
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/provider/:providerId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const messages = await storage.getMessages(req.user.id, parseInt(req.params.providerId));
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const message = await storage.createMessage({
        userId: req.user.id,
        providerId: req.body.providerId,
        content: req.body.content,
        fromUser: true,
        timestamp: new Date()
      });
      
      // Simulate a response from the provider
      setTimeout(async () => {
        await storage.createMessage({
          userId: req.user.id,
          providerId: req.body.providerId,
          content: `Thank you for your message. I'll get back to you shortly.`,
          fromUser: false,
          timestamp: new Date()
        });
      }, 10000);
      
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add endpoint for the provider selection
  app.get("/api/providers/service/:serviceId", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const providers = await storage.getProvidersByService(serviceId);
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add custom endpoint for task-specific providers
  app.get("/api/tasks/:taskName/providers", async (req, res) => {
    try {
      // This would typically filter providers by task specialization
      // For now, we'll just return all providers
      const allProviders = [];
      for (let i = 1; i <= 5; i++) {
        const serviceProviders = await storage.getProvidersByService(i);
        allProviders.push(...serviceProviders);
      }
      res.json(allProviders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
