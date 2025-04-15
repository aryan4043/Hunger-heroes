import { 
  Donor, InsertDonor, 
  Recipient, InsertRecipient, 
  Donation, InsertDonation, 
  QualityChecklist, InsertQualityChecklist,
  LoginAttempt, InsertLoginAttempt,
  RefreshToken, InsertRefreshToken,
  Notification, InsertNotification,
  AdminUser, InsertAdminUser,
  AnalyticsRecord, InsertAnalyticsRecord,
  SystemSetting, InsertSystemSetting,
  FoodAttribute, InsertFoodAttribute,
  DonationAttribute, InsertDonationAttribute,
  RecipientPreference, InsertRecipientPreference,
  donors, recipients, donations, qualityChecklists,
  loginAttempts, refreshTokens, notifications,
  adminUsers, analytics, systemSettings,
  foodAttributes, donationAttributes, recipientPreferences
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, gt, lte, lt, gte, or } from "drizzle-orm";
import { IStorage } from "./storage";
import { nanoid } from "nanoid";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Initialize connect-pg-simple for session storage
const PostgresSessionStore = connectPgSimple(session);

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Express session store

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.id, id));
    return donor;
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.email, email));
    return donor;
  }

  async getAllDonors(): Promise<Donor[]> {
    return await db.select().from(donors);
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const [donor] = await db.insert(donors).values({
      ...insertDonor,
      isEmailVerified: false,
      authProvider: 'local',
      updatedAt: new Date()
    }).returning();
    return donor;
  }

  async updateDonorLocation(id: number, latitude: number, longitude: number): Promise<Donor | undefined> {
    const [updatedDonor] = await db.update(donors)
      .set({ latitude, longitude, updatedAt: new Date() })
      .where(eq(donors.id, id))
      .returning();
    return updatedDonor;
  }

  async getNearbyDonors(latitude: number, longitude: number, radiusKm: number): Promise<Donor[]> {
    try {
      // Using a different approach with prepared parameters
      const result = await db.query.donors.findMany({
        where: (donors, { and, isNotNull, sql }) => and(
          isNotNull(donors.latitude),
          isNotNull(donors.longitude)
        ),
        orderBy: (donors, { asc }) => [asc(donors.name)]
      });

      // Filter in JS since we're having issues with the SQL parameters
      return result.filter(donor => {
        if (!donor.latitude || !donor.longitude) return false;
        const distance = calculateDistance(latitude, longitude, donor.latitude, donor.longitude);
        return distance <= radiusKm;
      });
      
      // Return the filtered donors
      return result;
    } catch (error) {
      console.error("Error in getNearbyDonors:", error);
      return [];
    }
  }

  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    const [recipient] = await db.select().from(recipients).where(eq(recipients.id, id));
    return recipient;
  }

  async getRecipientByEmail(email: string): Promise<Recipient | undefined> {
    const [recipient] = await db.select().from(recipients).where(eq(recipients.email, email));
    return recipient;
  }

  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const [recipient] = await db.insert(recipients).values({
      ...insertRecipient,
      verificationStatus: "pending",
      isEmailVerified: false,
      authProvider: 'local',
      updatedAt: new Date()
    }).returning();
    return recipient;
  }

  async updateRecipientLocation(id: number, latitude: number, longitude: number): Promise<Recipient | undefined> {
    const [updatedRecipient] = await db.update(recipients)
      .set({ latitude, longitude, updatedAt: new Date() })
      .where(eq(recipients.id, id))
      .returning();
    return updatedRecipient;
  }

  async getNearbyRecipients(latitude: number, longitude: number, radiusKm: number): Promise<Recipient[]> {
    try {
      // Using Haversine formula to calculate distances without PostGIS
      const result = await db.execute(`
        SELECT 
          *,
          (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(latitude))
            )
          ) AS distance_km
        FROM 
          recipients
        WHERE 
          latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(latitude))
            )
          ) <= $3
        ORDER BY 
          distance_km ASC
      `, [latitude, longitude, radiusKm]);
      
      // Convert PostgreSQL rows to Recipient objects
      return result.map(row => {
        // Remove password for security
        const { password, ...recipient } = row;
        return {
          ...recipient,
          distance: parseFloat(row.distance_km as string)
        } as Recipient & { distance: number };
      });
    } catch (error) {
      console.error("Error in getNearbyRecipients:", error);
      return [];
    }
  }

  // Donation methods
  async getDonation(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.donorId, donorId));
  }

  async getDonationsByRecipient(recipientId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.recipientId, recipientId));
  }

  async getAvailableDonations(): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.status, "available"));
  }

  async getNearbyDonations(latitude: number, longitude: number, radiusKm: number): Promise<Donation[]> {
    try {
      // Using Haversine formula to calculate distances without PostGIS
      const result = await db.execute(`
        SELECT 
          *,
          (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(latitude))
            )
          ) AS distance_km
        FROM 
          donations
        WHERE 
          latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND status = 'available'
          AND (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(latitude))
            )
          ) <= $3
        ORDER BY 
          distance_km ASC
      `, [latitude, longitude, radiusKm]);
      
      // Convert PostgreSQL rows to Donation objects
      return result.map(row => {
        return {
          ...row,
          distance: parseFloat(row.distance_km as string)
        } as Donation & { distance: number };
      });
    } catch (error) {
      console.error("Error in getNearbyDonations:", error);
      return [];
    }
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const trackingId = nanoid(10);
    const [donation] = await db.insert(donations).values({
      ...insertDonation,
      recipientId: null,
      status: "available",
      trackingId,
      updatedAt: new Date()
    }).returning();
    return donation;
  }

  async updateDonationStatus(id: number, status: string, recipientId?: number): Promise<Donation | undefined> {
    const [updatedDonation] = await db.update(donations)
      .set({ 
        status, 
        updatedAt: new Date(),
        ...(recipientId !== undefined ? { recipientId } : {})
      })
      .where(eq(donations.id, id))
      .returning();
    return updatedDonation;
  }

  // Quality checklist methods
  async createQualityChecklist(insertChecklist: InsertQualityChecklist): Promise<QualityChecklist> {
    const [checklist] = await db.insert(qualityChecklists).values(insertChecklist).returning();
    return checklist;
  }

  async getQualityChecklistByDonation(donationId: number): Promise<QualityChecklist | undefined> {
    const [checklist] = await db.select()
      .from(qualityChecklists)
      .where(eq(qualityChecklists.donationId, donationId));
    return checklist;
  }

  // Analytics methods
  async getDonationStats(): Promise<{
    totalDonations: number;
    totalDonors: number;
    totalRecipients: number;
    donationsByType: Record<string, number>;
    donationsByStatus: Record<string, number>;
  }> {
    // Get total counts
    const [[donationCount], [donorCount], [recipientCount]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(donations),
      db.select({ count: sql<number>`count(*)` }).from(donors),
      db.select({ count: sql<number>`count(*)` }).from(recipients)
    ]);

    // Get donations by type
    const donationsByTypeResult = await db.select({
      foodType: donations.foodType,
      count: sql<number>`count(*)`
    })
    .from(donations)
    .groupBy(donations.foodType);

    // Get donations by status
    const donationsByStatusResult = await db.select({
      status: donations.status,
      count: sql<number>`count(*)`
    })
    .from(donations)
    .groupBy(donations.status);

    // Convert results to expected format
    const donationsByType: Record<string, number> = {};
    donationsByTypeResult.forEach(row => {
      donationsByType[row.foodType] = Number(row.count);
    });

    const donationsByStatus: Record<string, number> = {};
    donationsByStatusResult.forEach(row => {
      donationsByStatus[row.status] = Number(row.count);
    });

    return {
      totalDonations: Number(donationCount?.count || 0),
      totalDonors: Number(donorCount?.count || 0),
      totalRecipients: Number(recipientCount?.count || 0),
      donationsByType,
      donationsByStatus
    };
  }

  // Authentication and security methods
  async recordLoginAttempt(ipAddress: string, email: string, successful: boolean): Promise<void> {
    await db.insert(loginAttempts).values({
      ipAddress,
      email,
      successful
    });
  }

  async getRecentLoginAttempts(ipAddress: string, email: string, minutes: number): Promise<LoginAttempt[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return await db.select()
      .from(loginAttempts)
      .where(
        and(
          or(
            eq(loginAttempts.ipAddress, ipAddress),
            eq(loginAttempts.email, email)
          ),
          gte(loginAttempts.timestamp, cutoffTime)
        )
      );
  }

  async createRefreshToken(userId: number, userType: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const [refreshToken] = await db.insert(refreshTokens).values({
      userId,
      userType,
      token,
      expiresAt,
      isRevoked: false
    }).returning();
    
    return refreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const [refreshToken] = await db.select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
    
    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await db.update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, token));
  }

  async createNotification(
    userId: number, 
    userType: string, 
    type: string, 
    title: string, 
    message: string,
    relatedEntityId?: number,
    relatedEntityType?: string
  ): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      userId,
      userType,
      // @ts-ignore - The type is coming from an enum
      type,
      title,
      message,
      relatedEntityId,
      relatedEntityType
    }).returning();
    
    return notification;
  }

  async getUserNotifications(userId: number, userType: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.userType, userType)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Admin methods
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));
    
    return admin;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values({
      ...insertAdmin,
      updatedAt: new Date()
    }).returning();
    
    return admin;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db.update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async trackAnalyticsMetric(
    metricName: string, 
    metricValue: number,
    dimension?: string,
    dimensionValue?: string
  ): Promise<AnalyticsRecord> {
    const [record] = await db.insert(analytics).values({
      metricName,
      metricValue,
      dimension,
      dimensionValue
    }).returning();
    
    return record;
  }

  async getAnalyticsForPeriod(
    metricName: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsRecord[]> {
    return await db.select()
      .from(analytics)
      .where(
        and(
          eq(analytics.metricName, metricName),
          gte(analytics.date, startDate),
          lte(analytics.date, endDate)
        )
      )
      .orderBy(analytics.date);
  }

  async getSystemSetting(key: string): Promise<string | null> {
    const [setting] = await db.select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key));
    
    return setting ? setting.settingValue : null;
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<void> {
    // Try to update first
    const result = await db.update(systemSettings)
      .set({ 
        settingValue: value,
        updatedAt: new Date(),
        ...(description ? { description } : {})
      })
      .where(eq(systemSettings.settingKey, key))
      .returning();
    
    // If no rows updated, insert new setting
    if (result.length === 0) {
      await db.insert(systemSettings).values({
        settingKey: key,
        settingValue: value,
        description
      });
    }
  }

  // Food attributes methods
  async createFoodAttribute(attribute: InsertFoodAttribute): Promise<FoodAttribute> {
    const [foodAttribute] = await db.insert(foodAttributes).values({
      ...attribute
    }).returning();
    
    return foodAttribute;
  }
  
  async getFoodAttributes(category?: string): Promise<FoodAttribute[]> {
    if (category) {
      return await db.select()
        .from(foodAttributes)
        .where(eq(foodAttributes.category, category));
    }
    
    return await db.select().from(foodAttributes);
  }
  
  async getFoodAttributeById(id: number): Promise<FoodAttribute | undefined> {
    const [attribute] = await db.select()
      .from(foodAttributes)
      .where(eq(foodAttributes.id, id));
    
    return attribute;
  }
  
  // Donation attributes methods
  async addDonationAttribute(donationId: number, attributeId: number, value?: string): Promise<DonationAttribute> {
    const [donationAttribute] = await db.insert(donationAttributes).values({
      donationId,
      attributeId,
      value: value || null
    }).returning();
    
    return donationAttribute;
  }
  
  async getDonationAttributes(donationId: number): Promise<(DonationAttribute & { attribute: FoodAttribute })[]> {
    // Use JOIN to get both donation attributes and their related food attributes
    const results = await db
      .select({
        donationAttribute: donationAttributes,
        attribute: foodAttributes
      })
      .from(donationAttributes)
      .innerJoin(
        foodAttributes,
        eq(donationAttributes.attributeId, foodAttributes.id)
      )
      .where(eq(donationAttributes.donationId, donationId));
    
    // Format the results to match the expected return type
    return results.map(row => ({
      ...row.donationAttribute,
      attribute: row.attribute
    }));
  }
  
  // Recipient preferences methods
  async addRecipientPreference(recipientId: number, attributeId: number, importance?: number): Promise<RecipientPreference> {
    const [recipientPreference] = await db.insert(recipientPreferences).values({
      recipientId,
      attributeId,
      importance: importance !== undefined ? importance : 5, // Default importance is 5
      updatedAt: new Date() // Ensure updatedAt is set
    }).returning();
    
    return recipientPreference;
  }
  
  async getRecipientPreferences(recipientId: number): Promise<(RecipientPreference & { attribute: FoodAttribute })[]> {
    // Use JOIN to get both recipient preferences and their related food attributes
    const results = await db
      .select({
        preference: recipientPreferences,
        attribute: foodAttributes
      })
      .from(recipientPreferences)
      .innerJoin(
        foodAttributes,
        eq(recipientPreferences.attributeId, foodAttributes.id)
      )
      .where(eq(recipientPreferences.recipientId, recipientId));
    
    // Format the results to match the expected return type
    return results.map(row => ({
      ...row.preference,
      attribute: row.attribute
    }));
  }
  
  async updateRecipientPreference(recipientId: number, attributeId: number, importance: number): Promise<RecipientPreference | undefined> {
    const [updatedPreference] = await db.update(recipientPreferences)
      .set({ 
        importance,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(recipientPreferences.recipientId, recipientId),
          eq(recipientPreferences.attributeId, attributeId)
        )
      )
      .returning();
    
    return updatedPreference;
  }
  
  // Personalized matching
  async getMatchingDonationsForRecipient(recipientId: number, radiusKm: number = 10): Promise<(Donation & { matchScore: number })[]> {
    const recipient = await this.getRecipient(recipientId);
    if (!recipient || !recipient.latitude || !recipient.longitude) {
      return [];
    }
    
    // Get recipient preferences
    const preferences = await this.getRecipientPreferences(recipientId);
    
    // Get available donations within the radius
    const nearbyDonations = await this.getNearbyDonations(
      recipient.latitude, 
      recipient.longitude, 
      radiusKm
    );
    
    if (nearbyDonations.length === 0 || preferences.length === 0) {
      // If there are no preferences, just return nearby donations with 0 score
      return nearbyDonations.map(donation => ({ ...donation, matchScore: 0 }));
    }
    
    // Calculate match scores for each donation
    const matchingResults = await Promise.all(
      nearbyDonations.map(async donation => {
        const donationAttributes = await this.getDonationAttributes(donation.id);
        
        // Calculate distance score (closer = higher score)
        // Using the distance that was already calculated or calculate it now
        const distance = (donation as any).distance || calculateDistance(
          recipient.latitude!, 
          recipient.longitude!, 
          donation.latitude!, 
          donation.longitude!
        );
        const distanceScore = Math.max(0, 100 * (1 - distance / radiusKm));
        
        // Calculate preference match score
        let preferenceScore = 0;
        let maxPossibleScore = 0;
        
        if (donationAttributes.length > 0) {
          preferences.forEach(preference => {
            const matchingAttribute = donationAttributes.find(
              attr => attr.attributeId === preference.attributeId
            );
            
            if (matchingAttribute) {
              // Add to score based on preference importance (scale: 1-10)
              // Handle potentially null importance with nullish coalescing
              preferenceScore += preference.importance ?? 5;
            }
            
            // Add to max possible score
            maxPossibleScore += preference.importance ?? 5;
          });
        }
        
        // Normalize preference score to 0-100
        const normalizedPreferenceScore = maxPossibleScore > 0 
          ? (preferenceScore / maxPossibleScore) * 100 
          : 0;
        
        // Calculate final match score: 40% distance, 60% preferences
        const matchScore = Math.round((distanceScore * 0.4) + (normalizedPreferenceScore * 0.6));
        
        // Remove distance property after using it
        if ((donation as any).distance) {
          delete (donation as any).distance;
        }
        
        return { ...donation, matchScore };
      })
    );
    
    // Sort by match score (highest first)
    return matchingResults.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  async getMatchingRecipientsForDonation(donationId: number, radiusKm: number = 10): Promise<(Recipient & { matchScore: number })[]> {
    const donation = await this.getDonation(donationId);
    if (!donation || !donation.latitude || !donation.longitude) {
      return [];
    }
    
    // Get donation attributes
    const donationAttributes = await this.getDonationAttributes(donationId);
    
    // Get nearby recipients
    const nearbyRecipients = await this.getNearbyRecipients(
      donation.latitude, 
      donation.longitude, 
      radiusKm
    );
    
    if (nearbyRecipients.length === 0 || donationAttributes.length === 0) {
      // If there are no attributes, just return nearby recipients with 0 score
      return nearbyRecipients.map(recipient => ({ ...recipient, matchScore: 0 }));
    }
    
    // Calculate match scores for each recipient
    const matchingResults = await Promise.all(
      nearbyRecipients.map(async recipient => {
        // Get distance score (closer = higher score)
        // Using the distance property or calculating it
        const distance = (recipient as any).distance || calculateDistance(
          donation.latitude!, 
          donation.longitude!, 
          recipient.latitude!, 
          recipient.longitude!
        );
        const distanceScore = Math.max(0, 100 * (1 - distance / radiusKm));
        
        // Get recipient preferences
        const preferences = await this.getRecipientPreferences(recipient.id);
        
        // Calculate preference match score
        let preferenceScore = 0;
        let maxPossibleScore = 0;
        
        if (preferences.length > 0) {
          preferences.forEach(preference => {
            const matchingAttribute = donationAttributes.find(
              attr => attr.attributeId === preference.attributeId
            );
            
            if (matchingAttribute) {
              // Add to score based on preference importance (scale: 1-10)
              // Handle potentially null importance with nullish coalescing
              preferenceScore += preference.importance ?? 5;
            }
            
            // Add to max possible score
            maxPossibleScore += preference.importance ?? 5;
          });
        }
        
        // Normalize preference score to 0-100
        const normalizedPreferenceScore = maxPossibleScore > 0 
          ? (preferenceScore / maxPossibleScore) * 100 
          : 0;
        
        // Calculate final match score: 40% distance, 60% preferences
        const matchScore = Math.round((distanceScore * 0.4) + (normalizedPreferenceScore * 0.6));
        
        // Remove distance property after using it
        if ((recipient as any).distance) {
          delete (recipient as any).distance;
        }
        // @ts-ignore - password is already removed in the getNearbyRecipients method
        
        return { ...recipient, matchScore };
      })
    );
    
    // Sort by match score (highest first)
    return matchingResults.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Admin verification methods
  async updateDonorVerificationStatus(donorId: number, verificationId: string): Promise<Donor | undefined> {
    const [updatedDonor] = await db.update(donors)
      .set({
        verificationId,
        updatedAt: new Date()
      })
      .where(eq(donors.id, donorId))
      .returning();
    
    return updatedDonor;
  }

  async updateRecipientVerificationStatus(recipientId: number, status: string): Promise<Recipient | undefined> {
    const [updatedRecipient] = await db.update(recipients)
      .set({
        verificationStatus: status,
        updatedAt: new Date()
      })
      .where(eq(recipients.id, recipientId))
      .returning();
    
    return updatedRecipient;
  }

  // Email verification methods
  async setEmailVerificationToken(
    userType: 'donor' | 'recipient',
    userId: number,
    token: string,
    expiryHours: number = 24
  ): Promise<void> {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);
    
    if (userType === 'donor') {
      await db.update(donors)
        .set({
          emailVerificationToken: token,
          emailVerificationExpiry: expiry,
          updatedAt: new Date()
        })
        .where(eq(donors.id, userId));
    } else {
      await db.update(recipients)
        .set({
          emailVerificationToken: token,
          emailVerificationExpiry: expiry,
          updatedAt: new Date()
        })
        .where(eq(recipients.id, userId));
    }
  }

  async verifyEmail(
    userType: 'donor' | 'recipient',
    token: string
  ): Promise<{ verified: boolean, userId?: number }> {
    const now = new Date();
    
    if (userType === 'donor') {
      const [donor] = await db.select()
        .from(donors)
        .where(
          and(
            eq(donors.emailVerificationToken, token),
            gt(donors.emailVerificationExpiry as any, now)
          )
        );
      
      if (!donor) {
        return { verified: false };
      }
      
      await db.update(donors)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          updatedAt: new Date()
        })
        .where(eq(donors.id, donor.id));
      
      return { verified: true, userId: donor.id };
    } else {
      const [recipient] = await db.select()
        .from(recipients)
        .where(
          and(
            eq(recipients.emailVerificationToken, token),
            gt(recipients.emailVerificationExpiry as any, now)
          )
        );
      
      if (!recipient) {
        return { verified: false };
      }
      
      await db.update(recipients)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          updatedAt: new Date()
        })
        .where(eq(recipients.id, recipient.id));
      
      return { verified: true, userId: recipient.id };
    }
  }

  // OAuth methods
  async findOrCreateOAuthUser(
    userType: 'donor' | 'recipient',
    provider: 'google' | 'facebook',
    providerId: string,
    email: string,
    name: string,
    userData: any
  ): Promise<{ user: Donor | Recipient, isNewUser: boolean }> {
    // Check if user exists with this provider ID
    if (userType === 'donor') {
      const [existingDonor] = await db.select()
        .from(donors)
        .where(
          and(
            eq(donors.authProvider, provider),
            eq(donors.providerId, providerId)
          )
        );
      
      if (existingDonor) {
        // Update last login
        await db.update(donors)
          .set({ lastLoginAt: new Date() })
          .where(eq(donors.id, existingDonor.id));
        
        return { user: existingDonor, isNewUser: false };
      }
      
      // Check if user exists with this email
      const [existingEmail] = await db.select()
        .from(donors)
        .where(eq(donors.email, email));
      
      if (existingEmail) {
        // Link provider to existing account
        const [updatedDonor] = await db.update(donors)
          .set({
            authProvider: provider,
            providerId,
            lastLoginAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(donors.id, existingEmail.id))
          .returning();
        
        return { user: updatedDonor, isNewUser: false };
      }
      
      // Create new donor
      const [newDonor] = await db.insert(donors).values({
        email,
        name,
        // Minimal required fields with dummy values for now
        phone: userData.phone || '0000000000',
        address: userData.address || 'Address pending',
        city: userData.city || 'City pending',
        state: userData.state || 'State pending',
        zipCode: userData.zipCode || '000000',
        organizationType: userData.organizationType || 'individual',
        authProvider: provider,
        providerId,
        isEmailVerified: true, // OAuth emails are pre-verified
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return { user: newDonor, isNewUser: true };
    } else {
      // Similar logic for recipients
      const [existingRecipient] = await db.select()
        .from(recipients)
        .where(
          and(
            eq(recipients.authProvider, provider),
            eq(recipients.providerId, providerId)
          )
        );
      
      if (existingRecipient) {
        await db.update(recipients)
          .set({ lastLoginAt: new Date() })
          .where(eq(recipients.id, existingRecipient.id));
        
        return { user: existingRecipient, isNewUser: false };
      }
      
      const [existingEmail] = await db.select()
        .from(recipients)
        .where(eq(recipients.email, email));
      
      if (existingEmail) {
        const [updatedRecipient] = await db.update(recipients)
          .set({
            authProvider: provider,
            providerId,
            lastLoginAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(recipients.id, existingEmail.id))
          .returning();
        
        return { user: updatedRecipient, isNewUser: false };
      }
      
      const [newRecipient] = await db.insert(recipients).values({
        email,
        name,
        phone: userData.phone || '0000000000',
        address: userData.address || 'Address pending',
        city: userData.city || 'City pending',
        state: userData.state || 'State pending',
        zipCode: userData.zipCode || '000000',
        organizationType: userData.organizationType || 'ngo',
        verificationStatus: 'pending',
        authProvider: provider,
        providerId,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return { user: newRecipient, isNewUser: true };
    }
  }

  // Expiring donations methods
  async getExpiringDonations(hoursThreshold: number): Promise<Donation[]> {
    const threshold = new Date(Date.now() + hoursThreshold * 60 * 60 * 1000);
    
    return await db.select()
      .from(donations)
      .where(
        and(
          eq(donations.status, 'available'),
          lt(donations.expiryDate as any, threshold),
          gt(donations.expiryDate as any, new Date())
        )
      );
  }
}