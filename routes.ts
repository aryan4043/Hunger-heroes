import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertDonorSchema, 
  insertRecipientSchema, 
  insertDonationSchema, 
  insertQualityChecklistSchema,
  oauthLoginSchema,
  adminLoginSchema,
  insertFoodCategorySchema,
  insertInventoryItemSchema,
  insertInventoryTransactionSchema,
  insertDistributionSchema,
  insertDistributionItemSchema,
  insertDemandForecastSchema,
  insertInventoryAlertSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { v4 as uuidv4 } from 'uuid';
import { log } from "./vite";

// Define WebSocket connection structure for typed client connections
interface ConnectedClient {
  ws: WebSocket;
  userId: number;
  userType: 'donor' | 'recipient';
  authenticated: boolean;
}

// Map to track active WebSocket connections
const connectedClients = new Map<string, ConnectedClient>();

// Secret for JWT tokens - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-for-development-only";
const JWT_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Utility for secure password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    // Check if stored password has the correct format (hash.salt)
    if (!stored || !stored.includes(".")) {
      console.error("Invalid password format in database:", stored);
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Make sure both hash and salt exist
    if (!hashed || !salt) {
      console.error("Missing hash or salt in stored password");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// Generate a JWT token for a user
function generateTokens(userId: number, userType: string) {
  // Access token with short expiry
  const accessToken = jwt.sign(
    { userId, userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
  
  // Refresh token with longer expiry
  const refreshToken = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  
  return { accessToken, refreshToken, expiresAt };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    const connectionId = uuidv4();
    log(`WebSocket connection established: ${connectionId}`);
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication
        if (data.type === 'authenticate') {
          const { token } = data;
          
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, userType: string };
            
            // Save connection with user details
            connectedClients.set(connectionId, {
              ws,
              userId: decoded.userId,
              userType: decoded.userType as 'donor' | 'recipient',
              authenticated: true
            });
            
            // Send confirmation
            ws.send(JSON.stringify({ 
              type: 'authenticated',
              userId: decoded.userId,
              userType: decoded.userType 
            }));
            
            log(`WebSocket authenticated: ${connectionId}, UserId: ${decoded.userId}, Type: ${decoded.userType}`);
          } catch (error) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Authentication failed' 
            }));
          }
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });
    
    ws.on('close', () => {
      // Clean up connection when closed
      connectedClients.delete(connectionId);
      log(`WebSocket connection closed: ${connectionId}`);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'info', 
      message: 'Connected to Hunger Heroes real-time server. Please authenticate to receive updates.' 
    }));
  });
  
  // Helper function to send notifications to connected users
  async function sendNotificationToUser(userId: number, userType: string, notification: any) {
    // Find all connections for this user
    for (const [_, client] of connectedClients.entries()) {
      if (client.authenticated && client.userId === userId && client.userType === userType) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        }
      }
    }
  }
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      if (data.userType === "donor") {
        const donor = await storage.getDonorByEmail(data.email);
        
        if (!donor || !donor.password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Check password with secure comparison
        const passwordValid = await comparePasswords(data.password, donor.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Don't send password to client
        const { password, ...donorWithoutPassword } = donor;
        return res.status(200).json({ 
          message: "Login successful", 
          user: donorWithoutPassword,
          userType: "donor" 
        });
      } else {
        const recipient = await storage.getRecipientByEmail(data.email);
        
        if (!recipient || !recipient.password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Check password with secure comparison
        const passwordValid = await comparePasswords(data.password, recipient.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Don't send password to client
        const { password, ...recipientWithoutPassword } = recipient;
        return res.status(200).json({ 
          message: "Login successful", 
          user: recipientWithoutPassword,
          userType: "recipient" 
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  // Donor routes
  app.post("/api/donors/register", async (req: Request, res: Response) => {
    try {
      const donorData = insertDonorSchema.parse(req.body);
      
      // Check if email already exists
      const existingDonor = await storage.getDonorByEmail(donorData.email);
      if (existingDonor) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash the password before storing it
      const hashedPassword = await hashPassword(donorData.password);
      
      const donor = await storage.createDonor({
        ...donorData,
        password: hashedPassword
      });
      
      // Don't send password to client
      const { password, ...donorWithoutPassword } = donor;
      
      return res.status(201).json({
        message: "Donor registered successfully",
        donor: donorWithoutPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.get("/api/donors", async (req: Request, res: Response) => {
    try {
      const donors = await storage.getAllDonors();
      
      // Don't send passwords to client
      const donorsWithoutPasswords = donors.map(donor => {
        const { password, ...donorWithoutPassword } = donor;
        return donorWithoutPassword;
      });
      
      return res.status(200).json(donorsWithoutPasswords);
    } catch (error) {
      console.error("Error fetching all donors:", error);
      return res.status(500).json({ message: "Server error fetching donors" });
    }
  });

  app.get("/api/donors/nearby", async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseFloat(req.query.radius as string) || 50; // Default 50km
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ 
          message: "Invalid coordinates. Latitude and longitude must be valid numbers."
        });
      }
      
      const nearbyDonors = await storage.getNearbyDonors(latitude, longitude, radius);
      
      return res.status(200).json(nearbyDonors);
    } catch (error) {
      console.error("Error fetching nearby donors:", error);
      return res.status(500).json({ message: "Server error fetching nearby donors" });
    }
  });
  
  app.get("/api/donors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const donor = await storage.getDonor(id);
      
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      
      // Don't send password to client
      const { password, ...donorWithoutPassword } = donor;
      
      return res.status(200).json(donorWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching donor" });
    }
  });
  app.post("/api/donors/:id/location", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude } = req.body;
      
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return res.status(400).json({ message: "Invalid location data" });
      }
      
      const donor = await storage.updateDonorLocation(id, latitude, longitude);
      
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      
      // Don't send password to client
      const { password, ...donorWithoutPassword } = donor;
      
      return res.status(200).json({
        message: "Location updated successfully",
        donor: donorWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error updating location" });
    }
  });

  // Recipient routes
  app.post("/api/recipients/register", async (req: Request, res: Response) => {
    try {
      const recipientData = insertRecipientSchema.parse(req.body);
      
      // Check if email already exists
      const existingRecipient = await storage.getRecipientByEmail(recipientData.email);
      if (existingRecipient) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash the password before storing it
      const hashedPassword = await hashPassword(recipientData.password);
      
      const recipient = await storage.createRecipient({
        ...recipientData,
        password: hashedPassword
      });
      
      // Don't send password to client
      const { password, ...recipientWithoutPassword } = recipient;
      
      return res.status(201).json({
        message: "Recipient registered successfully",
        recipient: recipientWithoutPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.get("/api/recipients/nearby", async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseFloat(req.query.radius as string) || 10; // Default 10km
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid location parameters" });
      }
      
      const recipients = await storage.getNearbyRecipients(latitude, longitude, radius);
      
      // Remove passwords from response
      const recipientsWithoutPasswords = recipients.map(recipient => {
        const { password, ...recipientWithoutPassword } = recipient;
        return recipientWithoutPassword;
      });
      
      return res.status(200).json(recipientsWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Server error finding nearby recipients" });
    }
  });
  
  app.get("/api/recipients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const recipient = await storage.getRecipient(id);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Don't send password to client
      const { password, ...recipientWithoutPassword } = recipient;
      
      return res.status(200).json(recipientWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching recipient" });
    }
  });

  app.post("/api/recipients/:id/location", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude } = req.body;
      
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return res.status(400).json({ message: "Invalid location data" });
      }
      
      const recipient = await storage.updateRecipientLocation(id, latitude, longitude);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Don't send password to client
      const { password, ...recipientWithoutPassword } = recipient;
      
      return res.status(200).json({
        message: "Location updated successfully",
        recipient: recipientWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error updating location" });
    }
  });

  // Donation routes
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      
      // Validate donor exists
      const donor = await storage.getDonor(donationData.donorId);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      
      const donation = await storage.createDonation(donationData);
      
      return res.status(201).json({
        message: "Donation created successfully",
        donation
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Server error creating donation" });
    }
  });

  app.get("/api/donations/donor/:donorId", async (req: Request, res: Response) => {
    try {
      const donorId = parseInt(req.params.donorId);
      const donations = await storage.getDonationsByDonor(donorId);
      
      return res.status(200).json(donations);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching donations" });
    }
  });

  app.get("/api/donations/recipient/:recipientId", async (req: Request, res: Response) => {
    try {
      const recipientId = parseInt(req.params.recipientId);
      const donations = await storage.getDonationsByRecipient(recipientId);
      
      return res.status(200).json(donations);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching donations" });
    }
  });

  app.get("/api/donations", async (req: Request, res: Response) => {
    try {
      const donations = await storage.getAvailableDonations();
      
      return res.status(200).json(donations);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching available donations" });
    }
  });

  app.get("/api/donations/nearby", async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseFloat(req.query.radius as string) || 10; // Default 10km
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid location parameters" });
      }
      
      const donations = await storage.getNearbyDonations(latitude, longitude, radius);
      
      return res.status(200).json(donations);
    } catch (error) {
      return res.status(500).json({ message: "Server error finding nearby donations" });
    }
  });
  
  app.get("/api/donations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getDonation(id);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      return res.status(200).json(donation);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching donation" });
    }
  });

  app.post("/api/donations/:id/claim", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { recipientId } = req.body;
      
      if (typeof recipientId !== "number") {
        return res.status(400).json({ message: "Invalid recipient ID" });
      }
      
      // Check if donation exists and is available
      const donation = await storage.getDonation(id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      if (donation.status !== "available") {
        return res.status(400).json({ message: "Donation is not available" });
      }
      
      // Check if recipient exists
      const recipient = await storage.getRecipient(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      const updatedDonation = await storage.updateDonationStatus(id, "claimed", recipientId);
      
      return res.status(200).json({
        message: "Donation claimed successfully",
        donation: updatedDonation
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error claiming donation" });
    }
  });

  app.post("/api/donations/:id/complete", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if donation exists and is claimed
      const donation = await storage.getDonation(id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      if (donation.status !== "claimed") {
        return res.status(400).json({ message: "Donation is not claimed" });
      }
      
      const updatedDonation = await storage.updateDonationStatus(id, "completed");
      
      return res.status(200).json({
        message: "Donation completed successfully",
        donation: updatedDonation
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error completing donation" });
    }
  });

  // Quality checklist routes
  app.post("/api/quality-checklists", async (req: Request, res: Response) => {
    try {
      const checklistData = insertQualityChecklistSchema.parse(req.body);
      
      // Check if donation exists
      const donation = await storage.getDonation(checklistData.donationId);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      // Check if checklist already exists for this donation
      const existingChecklist = await storage.getQualityChecklistByDonation(checklistData.donationId);
      if (existingChecklist) {
        return res.status(400).json({ message: "Checklist already exists for this donation" });
      }
      
      const checklist = await storage.createQualityChecklist(checklistData);
      
      return res.status(201).json({
        message: "Quality checklist created successfully",
        checklist
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Server error creating quality checklist" });
    }
  });

  app.get("/api/quality-checklists/donation/:donationId", async (req: Request, res: Response) => {
    try {
      const donationId = parseInt(req.params.donationId);
      const checklist = await storage.getQualityChecklistByDonation(donationId);
      
      if (!checklist) {
        return res.status(404).json({ message: "Quality checklist not found" });
      }
      
      return res.status(200).json(checklist);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching quality checklist" });
    }
  });

  // Food Attributes endpoints
  app.get("/api/food-attributes", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const attributes = await storage.getFoodAttributes(category);
      res.json(attributes);
    } catch (error) {
      console.error("Error fetching food attributes:", error);
      res.status(500).json({ error: "Failed to fetch food attributes" });
    }
  });

  app.post("/api/food-attributes", async (req: Request, res: Response) => {
    try {
      const newAttribute = await storage.createFoodAttribute(req.body);
      res.status(201).json(newAttribute);
    } catch (error) {
      console.error("Error creating food attribute:", error);
      res.status(500).json({ error: "Failed to create food attribute" });
    }
  });

  // Recipient Preferences endpoints
  app.get("/api/recipients/:id/preferences", async (req: Request, res: Response) => {
    try {
      const recipientId = Number(req.params.id);
      const preferences = await storage.getRecipientPreferences(recipientId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching recipient preferences:", error);
      res.status(500).json({ error: "Failed to fetch recipient preferences" });
    }
  });

  app.post("/api/recipients/:id/preferences", async (req: Request, res: Response) => {
    try {
      const recipientId = Number(req.params.id);
      const { attributeId, importance } = req.body;
      
      if (!attributeId) {
        return res.status(400).json({ error: "Attribute ID is required" });
      }
      
      const preference = await storage.addRecipientPreference(
        recipientId,
        attributeId,
        importance
      );
      
      res.status(201).json(preference);
    } catch (error) {
      console.error("Error adding recipient preference:", error);
      res.status(500).json({ error: "Failed to add recipient preference" });
    }
  });

  app.put("/api/recipients/:recipientId/preferences/:attributeId", async (req: Request, res: Response) => {
    try {
      const recipientId = Number(req.params.recipientId);
      const attributeId = Number(req.params.attributeId);
      const { importance } = req.body;
      
      if (importance === undefined) {
        return res.status(400).json({ error: "Importance value is required" });
      }
      
      const updatedPreference = await storage.updateRecipientPreference(
        recipientId,
        attributeId,
        importance
      );
      
      if (!updatedPreference) {
        return res.status(404).json({ error: "Preference not found" });
      }
      
      res.json(updatedPreference);
    } catch (error) {
      console.error("Error updating recipient preference:", error);
      res.status(500).json({ error: "Failed to update recipient preference" });
    }
  });

  // Donation Attributes endpoints
  app.get("/api/donations/:id/attributes", async (req: Request, res: Response) => {
    try {
      const donationId = Number(req.params.id);
      const attributes = await storage.getDonationAttributes(donationId);
      res.json(attributes);
    } catch (error) {
      console.error("Error fetching donation attributes:", error);
      res.status(500).json({ error: "Failed to fetch donation attributes" });
    }
  });

  app.post("/api/donations/:id/attributes", async (req: Request, res: Response) => {
    try {
      const donationId = Number(req.params.id);
      const { attributeId, value } = req.body;
      
      if (!attributeId) {
        return res.status(400).json({ error: "Attribute ID is required" });
      }
      
      const donationAttribute = await storage.addDonationAttribute(
        donationId,
        attributeId,
        value
      );
      
      res.status(201).json(donationAttribute);
    } catch (error) {
      console.error("Error adding donation attribute:", error);
      res.status(500).json({ error: "Failed to add donation attribute" });
    }
  });

  // Personalized matching endpoints
  app.get("/api/recipients/:id/matching-donations", async (req: Request, res: Response) => {
    try {
      const recipientId = Number(req.params.id);
      const radiusKm = req.query.radius ? Number(req.query.radius) : 10;
      
      const matchingDonations = await storage.getMatchingDonationsForRecipient(
        recipientId,
        radiusKm
      );
      
      res.json(matchingDonations);
    } catch (error) {
      console.error("Error finding matching donations:", error);
      res.status(500).json({ error: "Failed to find matching donations" });
    }
  });

  app.get("/api/donations/:id/matching-recipients", async (req: Request, res: Response) => {
    try {
      const donationId = Number(req.params.id);
      const radiusKm = req.query.radius ? Number(req.query.radius) : 10;
      
      const matchingRecipients = await storage.getMatchingRecipientsForDonation(
        donationId,
        radiusKm
      );
      
      res.json(matchingRecipients);
    } catch (error) {
      console.error("Error finding matching recipients:", error);
      res.status(500).json({ error: "Failed to find matching recipients" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/donations", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDonationStats();
      
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Server error fetching donation analytics" });
    }
  });

  // Enhanced authentication routes with secure password handling
  app.post("/api/auth/secure-login", async (req: Request, res: Response) => {
    try {
      const { email, password, userType } = loginSchema.parse(req.body);
      
      // Record login attempt (for rate limiting)
      const ipAddress = req.ip || req.socket.remoteAddress || "";
      
      if (userType === "donor") {
        const donor = await storage.getDonorByEmail(email);
        
        if (!donor || !donor.password) {
          await storage.recordLoginAttempt(ipAddress, email, false);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Check password with secure comparison
        const passwordValid = await comparePasswords(password, donor.password);
        
        if (!passwordValid) {
          await storage.recordLoginAttempt(ipAddress, email, false);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Record successful login
        await storage.recordLoginAttempt(ipAddress, email, true);
        
        // Update last login time
        if (donor.id) {
          await storage.updateDonorLastLogin?.(donor.id);
        }
        
        // Generate tokens
        const { accessToken, refreshToken, expiresAt } = generateTokens(donor.id, "donor");
        
        // Store refresh token
        await storage.createRefreshToken(donor.id, "donor", refreshToken, expiresAt);
        
        // Don't send password to client
        const { password: _, ...donorWithoutPassword } = donor;
        
        return res.status(200).json({ 
          message: "Login successful", 
          user: donorWithoutPassword,
          userType: "donor",
          accessToken,
          refreshToken
        });
      } else {
        const recipient = await storage.getRecipientByEmail(email);
        
        if (!recipient || !recipient.password) {
          await storage.recordLoginAttempt(ipAddress, email, false);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Check password with secure comparison
        const passwordValid = await comparePasswords(password, recipient.password);
        
        if (!passwordValid) {
          await storage.recordLoginAttempt(ipAddress, email, false);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Record successful login
        await storage.recordLoginAttempt(ipAddress, email, true);
        
        // Update last login time
        if (recipient.id) {
          await storage.updateRecipientLastLogin?.(recipient.id);
        }
        
        // Generate tokens
        const { accessToken, refreshToken, expiresAt } = generateTokens(recipient.id, "recipient");
        
        // Store refresh token
        await storage.createRefreshToken(recipient.id, "recipient", refreshToken, expiresAt);
        
        // Don't send password to client
        const { password: _, ...recipientWithoutPassword } = recipient;
        
        return res.status(200).json({ 
          message: "Login successful", 
          user: recipientWithoutPassword,
          userType: "recipient",
          accessToken,
          refreshToken
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  // OAuth login
  app.post("/api/auth/oauth", async (req: Request, res: Response) => {
    try {
      const { provider, token, userType } = oauthLoginSchema.parse(req.body);
      
      // In a real implementation, validate the token with the provider
      // For now, use a dummy validation
      const dummyUserData = {
        providerId: `${provider}_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
        name: `OAuth User ${Date.now()}`
      };
      
      // Find or create user by OAuth provider
      const { user, isNewUser } = await storage.findOrCreateOAuthUser(
        userType,
        provider,
        dummyUserData.providerId,
        dummyUserData.email,
        dummyUserData.name,
        {}
      );
      
      // Generate tokens
      const { accessToken, refreshToken, expiresAt } = generateTokens(user.id, userType);
      
      // Store refresh token
      await storage.createRefreshToken(user.id, userType, refreshToken, expiresAt);
      
      return res.status(200).json({
        message: isNewUser ? "Account created and logged in" : "Logged in successfully",
        user,
        userType,
        accessToken,
        refreshToken,
        isNewUser
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("OAuth login error:", error);
      return res.status(500).json({ message: "Server error during OAuth login" });
    }
  });

  // Refresh token
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }
      
      // Get refresh token from database
      const token = await storage.getRefreshToken(refreshToken);
      
      if (!token || token.isRevoked || new Date() > token.expiresAt) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }
      
      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt } = 
        generateTokens(token.userId, token.userType);
      
      // Revoke old token
      await storage.revokeRefreshToken(refreshToken);
      
      // Store new refresh token
      await storage.createRefreshToken(token.userId, token.userType, newRefreshToken, expiresAt);
      
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({ message: "Server error refreshing token" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await storage.revokeRefreshToken(refreshToken);
      }
      
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Server error during logout" });
    }
  });

  // Expiring donations endpoint (for admin/scheduled tasks)
  app.get("/api/donations/expiring", async (req: Request, res: Response) => {
    try {
      const hoursThreshold = parseInt(req.query.hours as string) || 2;
      const expiringDonations = await storage.getExpiringDonations(hoursThreshold);
      
      return res.status(200).json(expiringDonations);
    } catch (error) {
      console.error("Error fetching expiring donations:", error);
      return res.status(500).json({ message: "Server error fetching expiring donations" });
    }
  });

  // Notifications endpoint
  app.get("/api/notifications/:userType/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const userType = req.params.userType;
      
      if (userType !== 'donor' && userType !== 'recipient') {
        return res.status(400).json({ message: "Invalid user type" });
      }
      
      const notifications = await storage.getUserNotifications(userId, userType);
      
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Server error fetching notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      await storage.markNotificationAsRead(id);
      
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Server error updating notification" });
    }
  });

  return httpServer;
}
