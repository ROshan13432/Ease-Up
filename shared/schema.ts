import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  phoneNumber: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  // Stored as JSON array in text format
  inclusions: text("inclusions").notNull(),
});

// Provider schema
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  experience: text("experience").notNull(),
  rating: real("rating").notNull(),
  reviews: integer("reviews").notNull(),
  // Stored as JSON array in text format
  tags: text("tags").notNull(),
  // Stored as JSON array in text format
  services: text("services").notNull(),
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  providerId: integer("provider_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  notes: text("notes"),
  status: text("status").notNull(), // 'scheduled', 'completed', 'cancelled'
});

// Favorites schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerId: integer("provider_id").notNull(),
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerId: integer("provider_id").notNull(),
  content: text("content").notNull(),
  fromUser: boolean("from_user").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Insert schemas
export const insertBookingSchema = createInsertSchema(bookings).pick({
  serviceId: true,
  providerId: true,
  notes: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  providerId: true,
  content: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Service = {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  inclusions: string[];
};

export type Provider = {
  id: number;
  name: string;
  experience: string;
  rating: number;
  reviews: number;
  tags: string[];
  services: string[];
  isFavorite?: boolean;
};

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
