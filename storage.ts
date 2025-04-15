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
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";
import { json } from "drizzle-orm/pg-core";
import { DatabaseStorage } from './database-storage';

// Create a MemoryStore constructor
const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: any; // Express session store
  
  // Donor operations
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  getAllDonors(): Promise<Donor[]>;
  getNearbyDonors(latitude: number, longitude: number, radiusKm: number): Promise<Donor[]>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonorLocation(id: number, latitude: number, longitude: number): Promise<Donor | undefined>;
  updateDonorVerificationStatus(donorId: number, verificationId: string): Promise<Donor | undefined>;
  
  // Recipient operations
  getRecipient(id: number): Promise<Recipient | undefined>;
  getRecipientByEmail(email: string): Promise<Recipient | undefined>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipientLocation(id: number, latitude: number, longitude: number): Promise<Recipient | undefined>;
  getNearbyRecipients(latitude: number, longitude: number, radiusKm: number): Promise<Recipient[]>;
  updateRecipientVerificationStatus(recipientId: number, status: string): Promise<Recipient | undefined>;
  
  // Donation operations
  getDonation(id: number): Promise<Donation | undefined>;
  getDonationsByDonor(donorId: number): Promise<Donation[]>;
  getDonationsByRecipient(recipientId: number): Promise<Donation[]>;
  getAvailableDonations(): Promise<Donation[]>;
  getNearbyDonations(latitude: number, longitude: number, radiusKm: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(id: number, status: string, recipientId?: number): Promise<Donation | undefined>;
  getExpiringDonations(hoursThreshold: number): Promise<Donation[]>;
  
  // Quality checklist operations
  createQualityChecklist(checklist: InsertQualityChecklist): Promise<QualityChecklist>;
  getQualityChecklistByDonation(donationId: number): Promise<QualityChecklist | undefined>;
  
  // Authentication and security methods
  recordLoginAttempt(ipAddress: string, email: string, successful: boolean): Promise<void>;
  getRecentLoginAttempts(ipAddress: string, email: string, minutes: number): Promise<LoginAttempt[]>;
  createRefreshToken(userId: number, userType: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  revokeRefreshToken(token: string): Promise<void>;
  setEmailVerificationToken(userType: 'donor' | 'recipient', userId: number, token: string, expiryHours?: number): Promise<void>;
  verifyEmail(userType: 'donor' | 'recipient', token: string): Promise<{ verified: boolean, userId?: number }>;
  
  // OAuth methods
  findOrCreateOAuthUser(
    userType: 'donor' | 'recipient',
    provider: 'google' | 'facebook',
    providerId: string,
    email: string,
    name: string,
    userData: any
  ): Promise<{ user: Donor | Recipient, isNewUser: boolean }>;
  
  // Notification methods
  createNotification(userId: number, userType: string, type: string, title: string, message: string, relatedEntityId?: number, relatedEntityType?: string): Promise<Notification>;
  getUserNotifications(userId: number, userType: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Admin methods
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: number): Promise<void>;
  
  // Analytics methods
  getDonationStats(): Promise<{
    totalDonations: number;
    totalDonors: number;
    totalRecipients: number;
    donationsByType: Record<string, number>;
    donationsByStatus: Record<string, number>;
  }>;
  trackAnalyticsMetric(metricName: string, metricValue: number, dimension?: string, dimensionValue?: string): Promise<AnalyticsRecord>;
  getAnalyticsForPeriod(metricName: string, startDate: Date, endDate: Date): Promise<AnalyticsRecord[]>;
  
  // System settings
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string, description?: string): Promise<void>;
  
  // Food attributes and preferences
  createFoodAttribute(attribute: InsertFoodAttribute): Promise<FoodAttribute>;
  getFoodAttributes(category?: string): Promise<FoodAttribute[]>;
  getFoodAttributeById(id: number): Promise<FoodAttribute | undefined>;
  
  // Donation attributes (many-to-many)
  addDonationAttribute(donationId: number, attributeId: number, value?: string): Promise<DonationAttribute>;
  getDonationAttributes(donationId: number): Promise<(DonationAttribute & { attribute: FoodAttribute })[]>;
  
  // Recipient preferences (many-to-many)
  addRecipientPreference(recipientId: number, attributeId: number, importance?: number): Promise<RecipientPreference>;
  getRecipientPreferences(recipientId: number): Promise<(RecipientPreference & { attribute: FoodAttribute })[]>;
  updateRecipientPreference(recipientId: number, attributeId: number, importance: number): Promise<RecipientPreference | undefined>;
  
  // Personalized matching
  getMatchingDonationsForRecipient(recipientId: number, radiusKm?: number): Promise<(Donation & { matchScore: number })[]>;
  getMatchingRecipientsForDonation(donationId: number, radiusKm?: number): Promise<(Recipient & { matchScore: number })[]>;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private donors: Map<number, Donor>;
  private recipients: Map<number, Recipient>;
  private donations: Map<number, Donation>;
  private qualityChecklists: Map<number, QualityChecklist>;
  private loginAttempts: Map<number, LoginAttempt>;
  private refreshTokens: Map<string, RefreshToken>;
  private notifications: Map<number, Notification>;
  private adminUsers: Map<number, AdminUser>;
  private analyticsRecords: Map<number, AnalyticsRecord>;
  private systemSettings: Map<string, SystemSetting>;
  private foodAttributes: Map<number, FoodAttribute>;
  private donationAttributes: Map<string, DonationAttribute>; // Composite key: donationId-attributeId
  private recipientPreferences: Map<string, RecipientPreference>; // Composite key: recipientId-attributeId
  private donorCurrentId: number;
  private recipientCurrentId: number;
  private donationCurrentId: number;
  private qualityChecklistCurrentId: number;
  private loginAttemptCurrentId: number;
  private notificationCurrentId: number;
  private adminUserCurrentId: number;
  private analyticsRecordCurrentId: number;
  private foodAttributeCurrentId: number;
  public sessionStore: any;

  constructor() {
    this.donors = new Map();
    this.recipients = new Map();
    this.donations = new Map();
    this.qualityChecklists = new Map();
    this.loginAttempts = new Map();
    this.refreshTokens = new Map();
    this.notifications = new Map();
    this.adminUsers = new Map();
    this.analyticsRecords = new Map();
    this.systemSettings = new Map();
    this.foodAttributes = new Map();
    this.donationAttributes = new Map();
    this.recipientPreferences = new Map();
    this.donorCurrentId = 1;
    this.recipientCurrentId = 1;
    this.donationCurrentId = 1;
    this.qualityChecklistCurrentId = 1;
    this.loginAttemptCurrentId = 1;
    this.notificationCurrentId = 1;
    this.adminUserCurrentId = 1;
    this.analyticsRecordCurrentId = 1;
    this.foodAttributeCurrentId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add some initial data for testing
    this.seedData();
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(
      (donor) => donor.email === email,
    );
  }

  async getAllDonors(): Promise<Donor[]> {
    return Array.from(this.donors.values());
  }

  async getNearbyDonors(latitude: number, longitude: number, radiusKm: number): Promise<Donor[]> {
    return Array.from(this.donors.values())
      .filter(donor => {
        if (!donor.latitude || !donor.longitude) return false;
        const distance = calculateDistance(latitude, longitude, donor.latitude, donor.longitude);
        return distance <= radiusKm;
      });
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const id = this.donorCurrentId++;
    const donor: Donor = { ...insertDonor, id, createdAt: new Date(), latitude: null, longitude: null };
    this.donors.set(id, donor);
    return donor;
  }

  async updateDonorLocation(id: number, latitude: number, longitude: number): Promise<Donor | undefined> {
    const donor = await this.getDonor(id);
    if (donor) {
      const updatedDonor = { ...donor, latitude, longitude };
      this.donors.set(id, updatedDonor);
      return updatedDonor;
    }
    return undefined;
  }

  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }

  async getRecipientByEmail(email: string): Promise<Recipient | undefined> {
    return Array.from(this.recipients.values()).find(
      (recipient) => recipient.email === email,
    );
  }

  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const id = this.recipientCurrentId++;
    const recipient: Recipient = { 
      ...insertRecipient, 
      id, 
      createdAt: new Date(), 
      verificationStatus: "pending",
      latitude: null,
      longitude: null
    };
    this.recipients.set(id, recipient);
    return recipient;
  }

  async updateRecipientLocation(id: number, latitude: number, longitude: number): Promise<Recipient | undefined> {
    const recipient = await this.getRecipient(id);
    if (recipient) {
      const updatedRecipient = { ...recipient, latitude, longitude };
      this.recipients.set(id, updatedRecipient);
      return updatedRecipient;
    }
    return undefined;
  }

  async getNearbyRecipients(latitude: number, longitude: number, radiusKm: number): Promise<Recipient[]> {
    return Array.from(this.recipients.values())
      .filter(recipient => {
        if (!recipient.latitude || !recipient.longitude) return false;
        const distance = calculateDistance(latitude, longitude, recipient.latitude, recipient.longitude);
        return distance <= radiusKm;
      });
  }

  // Donation methods
  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.donorId === donorId);
  }

  async getDonationsByRecipient(recipientId: number): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.recipientId === recipientId);
  }

  async getAvailableDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.status === "available");
  }

  async getNearbyDonations(latitude: number, longitude: number, radiusKm: number): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => {
        if (!donation.latitude || !donation.longitude || donation.status !== "available") return false;
        const distance = calculateDistance(latitude, longitude, donation.latitude, donation.longitude);
        return distance <= radiusKm;
      });
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.donationCurrentId++;
    const trackingId = nanoid(10);
    const donation: Donation = { 
      ...insertDonation, 
      id, 
      recipientId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "available",
      trackingId
    };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonationStatus(id: number, status: string, recipientId?: number): Promise<Donation | undefined> {
    const donation = await this.getDonation(id);
    if (donation) {
      const updatedDonation = { 
        ...donation, 
        status, 
        updatedAt: new Date(),
        recipientId: recipientId !== undefined ? recipientId : donation.recipientId,
      };
      this.donations.set(id, updatedDonation);
      return updatedDonation;
    }
    return undefined;
  }

  // Quality checklist methods
  async createQualityChecklist(insertChecklist: InsertQualityChecklist): Promise<QualityChecklist> {
    const id = this.qualityChecklistCurrentId++;
    const checklist: QualityChecklist = { ...insertChecklist, id, createdAt: new Date() };
    this.qualityChecklists.set(id, checklist);
    return checklist;
  }

  async getQualityChecklistByDonation(donationId: number): Promise<QualityChecklist | undefined> {
    return Array.from(this.qualityChecklists.values()).find(
      (checklist) => checklist.donationId === donationId,
    );
  }
  
  // Verification methods
  async updateDonorVerificationStatus(donorId: number, verificationId: string): Promise<Donor | undefined> {
    const donor = await this.getDonor(donorId);
    if (donor) {
      const updatedDonor = { ...donor, verificationId, updatedAt: new Date() };
      this.donors.set(donorId, updatedDonor);
      return updatedDonor;
    }
    return undefined;
  }
  
  // Add missing method for updating donor last login time
  async updateDonorLastLogin(donorId: number): Promise<Donor | undefined> {
    const donor = await this.getDonor(donorId);
    if (donor) {
      const updatedDonor = { ...donor, lastLoginAt: new Date(), updatedAt: new Date() };
      this.donors.set(donorId, updatedDonor);
      return updatedDonor;
    }
    return undefined;
  }

  async updateRecipientVerificationStatus(recipientId: number, status: string): Promise<Recipient | undefined> {
    const recipient = await this.getRecipient(recipientId);
    if (recipient) {
      const updatedRecipient = { ...recipient, verificationStatus: status, updatedAt: new Date() };
      this.recipients.set(recipientId, updatedRecipient);
      return updatedRecipient;
    }
    return undefined;
  }
  
  // Add missing method for updating recipient last login time
  async updateRecipientLastLogin(recipientId: number): Promise<Recipient | undefined> {
    const recipient = await this.getRecipient(recipientId);
    if (recipient) {
      const updatedRecipient = { ...recipient, lastLoginAt: new Date(), updatedAt: new Date() };
      this.recipients.set(recipientId, updatedRecipient);
      return updatedRecipient;
    }
    return undefined;
  }
  
  // Expiring donations
  async getExpiringDonations(hoursThreshold: number): Promise<Donation[]> {
    const thresholdDate = new Date(Date.now() + hoursThreshold * 60 * 60 * 1000);
    return Array.from(this.donations.values()).filter(donation => {
      return donation.status === "available" && 
             donation.expiryDate && 
             donation.expiryDate <= thresholdDate;
    });
  }
  
  // Login attempt tracking
  async recordLoginAttempt(ipAddress: string, email: string, successful: boolean): Promise<void> {
    const id = this.loginAttemptCurrentId++;
    const loginAttempt: LoginAttempt = {
      id,
      ipAddress,
      email,
      successful,
      timestamp: new Date()
    };
    this.loginAttempts.set(id, loginAttempt);
  }
  
  async getRecentLoginAttempts(ipAddress: string, email: string, minutes: number): Promise<LoginAttempt[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.loginAttempts.values()).filter(attempt => {
      return attempt.timestamp >= cutoffTime &&
             (attempt.ipAddress === ipAddress || attempt.email === email);
    });
  }
  
  // Refresh token management
  async createRefreshToken(userId: number, userType: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const refreshToken: RefreshToken = {
      token,
      userId,
      userType,
      expiresAt,
      createdAt: new Date(),
      isRevoked: false
    };
    this.refreshTokens.set(token, refreshToken);
    return refreshToken;
  }
  
  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.refreshTokens.get(token);
  }
  
  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = this.refreshTokens.get(token);
    if (refreshToken) {
      refreshToken.isRevoked = true;
      this.refreshTokens.set(token, refreshToken);
    }
  }
  
  // Email verification
  async setEmailVerificationToken(
    userType: 'donor' | 'recipient', 
    userId: number, 
    token: string, 
    expiryHours: number = 24
  ): Promise<void> {
    const expiryDate = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    
    if (userType === 'donor') {
      const donor = await this.getDonor(userId);
      if (donor) {
        const updatedDonor = { 
          ...donor,
          emailVerificationToken: token,
          emailVerificationExpiry: expiryDate,
          isEmailVerified: false
        };
        this.donors.set(userId, updatedDonor);
      }
    } else if (userType === 'recipient') {
      const recipient = await this.getRecipient(userId);
      if (recipient) {
        const updatedRecipient = { 
          ...recipient,
          emailVerificationToken: token,
          emailVerificationExpiry: expiryDate,
          isEmailVerified: false
        };
        this.recipients.set(userId, updatedRecipient);
      }
    }
  }
  
  async verifyEmail(userType: 'donor' | 'recipient', token: string): Promise<{ verified: boolean, userId?: number }> {
    if (userType === 'donor') {
      const donor = Array.from(this.donors.values()).find(
        d => d.emailVerificationToken === token && d.emailVerificationExpiry && d.emailVerificationExpiry > new Date()
      );
      
      if (donor) {
        const updatedDonor = { 
          ...donor,
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        };
        this.donors.set(donor.id, updatedDonor);
        return { verified: true, userId: donor.id };
      }
    } else if (userType === 'recipient') {
      const recipient = Array.from(this.recipients.values()).find(
        r => r.emailVerificationToken === token && r.emailVerificationExpiry && r.emailVerificationExpiry > new Date()
      );
      
      if (recipient) {
        const updatedRecipient = { 
          ...recipient,
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        };
        this.recipients.set(recipient.id, updatedRecipient);
        return { verified: true, userId: recipient.id };
      }
    }
    
    return { verified: false };
  }
  
  // OAuth user management
  async findOrCreateOAuthUser(
    userType: 'donor' | 'recipient',
    provider: 'google' | 'facebook',
    providerId: string,
    email: string,
    name: string,
    userData: any
  ): Promise<{ user: Donor | Recipient, isNewUser: boolean }> {
    // Try to find existing user by email
    let user;
    let isNewUser = false;
    
    if (userType === 'donor') {
      user = await this.getDonorByEmail(email);
      
      if (!user) {
        // Create new donor
        isNewUser = true;
        const insertDonor: InsertDonor = {
          email,
          name,
          password: null, // OAuth users don't have passwords
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          zipCode: userData.zipCode || "",
          organizationType: userData.organizationType || "individual",
          verificationId: nanoid(10),
          latitude: null,
          longitude: null,
          oauthProvider: provider,
          oauthProviderId: providerId
        };
        
        user = await this.createDonor(insertDonor);
      }
      
      return { user, isNewUser };
    } else {
      user = await this.getRecipientByEmail(email);
      
      if (!user) {
        // Create new recipient
        isNewUser = true;
        const insertRecipient: InsertRecipient = {
          email,
          name,
          password: null, // OAuth users don't have passwords
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          zipCode: userData.zipCode || "",
          organizationType: userData.organizationType || "individual",
          registrationNumber: userData.registrationNumber || null,
          latitude: null,
          longitude: null,
          oauthProvider: provider,
          oauthProviderId: providerId
        };
        
        user = await this.createRecipient(insertRecipient);
      }
      
      return { user, isNewUser };
    }
  }
  
  // Notification methods
  async createNotification(
    userId: number, 
    userType: string, 
    type: string, 
    title: string, 
    message: string, 
    relatedEntityId?: number, 
    relatedEntityType?: string
  ): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const notification: Notification = {
      id,
      userId,
      userType,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
      relatedEntityId: relatedEntityId || null,
      relatedEntityType: relatedEntityType || null
    };
    
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getUserNotifications(userId: number, userType: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && notification.userType === userType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by most recent first
  }
  
  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }
  
  // Admin methods
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(admin => admin.email === email);
  }
  
  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = this.adminUserCurrentId++;
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      createdAt: new Date(),
      lastLoginAt: null
    };
    
    this.adminUsers.set(id, admin);
    return admin;
  }
  
  async updateAdminLastLogin(id: number): Promise<void> {
    const admin = this.adminUsers.get(id);
    if (admin) {
      admin.lastLoginAt = new Date();
      this.adminUsers.set(id, admin);
    }
  }
  
  // Analytics methods
  async trackAnalyticsMetric(
    metricName: string, 
    metricValue: number, 
    dimension?: string, 
    dimensionValue?: string
  ): Promise<AnalyticsRecord> {
    const id = this.analyticsRecordCurrentId++;
    const record: AnalyticsRecord = {
      id,
      metricName,
      metricValue,
      dimension: dimension || null,
      dimensionValue: dimensionValue || null,
      timestamp: new Date()
    };
    
    this.analyticsRecords.set(id, record);
    return record;
  }
  
  async getAnalyticsForPeriod(
    metricName: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AnalyticsRecord[]> {
    return Array.from(this.analyticsRecords.values())
      .filter(record => {
        return record.metricName === metricName && 
               record.timestamp >= startDate && 
               record.timestamp <= endDate;
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  // System settings
  async getSystemSetting(key: string): Promise<string | null> {
    const setting = this.systemSettings.get(key);
    return setting ? setting.value : null;
  }
  
  async setSystemSetting(key: string, value: string, description?: string): Promise<void> {
    const setting: SystemSetting = {
      key,
      value,
      description: description || null,
      updatedAt: new Date()
    };
    
    this.systemSettings.set(key, setting);
  }

  // Food attributes methods
  async createFoodAttribute(attribute: InsertFoodAttribute): Promise<FoodAttribute> {
    const id = this.foodAttributeCurrentId++;
    const foodAttribute: FoodAttribute = {
      ...attribute,
      id,
      createdAt: new Date()
    };
    this.foodAttributes.set(id, foodAttribute);
    return foodAttribute;
  }
  
  async getFoodAttributes(category?: string): Promise<FoodAttribute[]> {
    let attributes = Array.from(this.foodAttributes.values());
    if (category) {
      attributes = attributes.filter(attr => attr.category === category);
    }
    return attributes;
  }
  
  async getFoodAttributeById(id: number): Promise<FoodAttribute | undefined> {
    return this.foodAttributes.get(id);
  }
  
  // Donation attributes methods
  async addDonationAttribute(donationId: number, attributeId: number, value?: string): Promise<DonationAttribute> {
    const compositeKey = `${donationId}-${attributeId}`;
    const donationAttribute: DonationAttribute = {
      donationId,
      attributeId,
      value: value || null,
      createdAt: new Date()
    };
    this.donationAttributes.set(compositeKey, donationAttribute);
    return donationAttribute;
  }
  
  async getDonationAttributes(donationId: number): Promise<(DonationAttribute & { attribute: FoodAttribute })[]> {
    const attributes = Array.from(this.donationAttributes.values())
      .filter(attr => attr.donationId === donationId);
    
    return attributes.map(attr => {
      const foodAttribute = this.foodAttributes.get(attr.attributeId);
      if (!foodAttribute) {
        throw new Error(`Food attribute with ID ${attr.attributeId} not found`);
      }
      return { ...attr, attribute: foodAttribute };
    });
  }
  
  // Recipient preferences methods
  async addRecipientPreference(recipientId: number, attributeId: number, importance?: number): Promise<RecipientPreference> {
    const compositeKey = `${recipientId}-${attributeId}`;
    const recipientPreference: RecipientPreference = {
      recipientId,
      attributeId,
      importance: importance !== undefined ? importance : 5, // Default importance 5 (medium)
      createdAt: new Date()
    };
    this.recipientPreferences.set(compositeKey, recipientPreference);
    return recipientPreference;
  }
  
  async getRecipientPreferences(recipientId: number): Promise<(RecipientPreference & { attribute: FoodAttribute })[]> {
    const preferences = Array.from(this.recipientPreferences.values())
      .filter(pref => pref.recipientId === recipientId);
    
    return preferences.map(pref => {
      const foodAttribute = this.foodAttributes.get(pref.attributeId);
      if (!foodAttribute) {
        throw new Error(`Food attribute with ID ${pref.attributeId} not found`);
      }
      return { ...pref, attribute: foodAttribute };
    });
  }
  
  async updateRecipientPreference(recipientId: number, attributeId: number, importance: number): Promise<RecipientPreference | undefined> {
    const compositeKey = `${recipientId}-${attributeId}`;
    const preference = this.recipientPreferences.get(compositeKey);
    
    if (!preference) {
      return undefined;
    }
    
    const updatedPreference: RecipientPreference = {
      ...preference,
      importance
    };
    
    this.recipientPreferences.set(compositeKey, updatedPreference);
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
        
        // Base match: distance as a percentage of the radius (closer = higher score)
        const distance = calculateDistance(
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
              preferenceScore += preference.importance;
            }
            
            // Add to max possible score
            maxPossibleScore += preference.importance;
          });
        }
        
        // Normalize preference score to 0-100
        const normalizedPreferenceScore = maxPossibleScore > 0 
          ? (preferenceScore / maxPossibleScore) * 100 
          : 0;
        
        // Calculate final match score: 40% distance, 60% preferences
        const matchScore = Math.round((distanceScore * 0.4) + (normalizedPreferenceScore * 0.6));
        
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
        // Base match: distance as a percentage of the radius (closer = higher score)
        const distance = calculateDistance(
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
              preferenceScore += preference.importance;
            }
            
            // Add to max possible score
            maxPossibleScore += preference.importance;
          });
        }
        
        // Normalize preference score to 0-100
        const normalizedPreferenceScore = maxPossibleScore > 0 
          ? (preferenceScore / maxPossibleScore) * 100 
          : 0;
        
        // Calculate final match score: 40% distance, 60% preferences
        const matchScore = Math.round((distanceScore * 0.4) + (normalizedPreferenceScore * 0.6));
        
        return { ...recipient, matchScore };
      })
    );
    
    // Sort by match score (highest first)
    return matchingResults.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Analytics methods
  async getDonationStats(): Promise<{
    totalDonations: number;
    totalDonors: number;
    totalRecipients: number;
    donationsByType: Record<string, number>;
    donationsByStatus: Record<string, number>;
  }> {
    const allDonations = Array.from(this.donations.values());
    
    // Count donations by type
    const donationsByType: Record<string, number> = {};
    allDonations.forEach(donation => {
      donationsByType[donation.foodType] = (donationsByType[donation.foodType] || 0) + 1;
    });
    
    // Count donations by status
    const donationsByStatus: Record<string, number> = {};
    allDonations.forEach(donation => {
      donationsByStatus[donation.status] = (donationsByStatus[donation.status] || 0) + 1;
    });
    
    return {
      totalDonations: allDonations.length,
      totalDonors: this.donors.size,
      totalRecipients: this.recipients.size,
      donationsByType,
      donationsByStatus,
    };
  }

  // Seed some initial data for testing
  private seedData() {
    // Seed food attributes
    const dietaryAttributes: FoodAttribute[] = [
      {
        id: this.foodAttributeCurrentId++,
        name: "Vegetarian",
        category: "dietary",
        description: "Food suitable for vegetarians",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Vegan",
        category: "dietary",
        description: "Food suitable for vegans",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Gluten-Free",
        category: "dietary",
        description: "Food that doesn't contain gluten",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Dairy-Free",
        category: "dietary",
        description: "Food that doesn't contain dairy",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Nut-Free",
        category: "dietary",
        description: "Food that doesn't contain nuts",
        createdAt: new Date()
      }
    ];
    
    // Seed food categories
    const categoryAttributes: FoodAttribute[] = [
      {
        id: this.foodAttributeCurrentId++,
        name: "Fresh Produce",
        category: "category",
        description: "Fresh fruits and vegetables",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Bakery",
        category: "category",
        description: "Bread, pastries, and baked goods",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Dairy",
        category: "category",
        description: "Milk, cheese, yogurt, and other dairy products",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Canned Goods",
        category: "category",
        description: "Canned foods and preserves",
        createdAt: new Date()
      },
      {
        id: this.foodAttributeCurrentId++,
        name: "Cooked Meals",
        category: "category",
        description: "Ready-to-eat or prepared meals",
        createdAt: new Date()
      }
    ];
    
    // Add all attributes to the food attributes map
    [...dietaryAttributes, ...categoryAttributes].forEach(attr => {
      this.foodAttributes.set(attr.id, attr);
    });
    
    // Add sample donors
    const donor1: Donor = {
      id: this.donorCurrentId++,
      email: "restaurant@example.com",
      password: "password123",
      name: "Fresh Harvest Restaurant",
      phone: "555-123-4567",
      address: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      organizationType: "restaurant",
      verificationId: "REXTA5421",
      createdAt: new Date(),
      latitude: 19.0760,
      longitude: 72.8777
    };
    this.donors.set(donor1.id, donor1);

    const donor2: Donor = {
      id: this.donorCurrentId++,
      email: "grocery@example.com",
      password: "password123",
      name: "Green Grocers",
      phone: "555-987-6543",
      address: "456 Park Ave",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      organizationType: "supermarket",
      verificationId: "SMXID7890",
      createdAt: new Date(),
      latitude: 28.6139,
      longitude: 77.2090
    };
    this.donors.set(donor2.id, donor2);

    // Add sample recipients
    const recipient1: Recipient = {
      id: this.recipientCurrentId++,
      email: "foodbank@example.com",
      password: "password123",
      name: "Community Food Bank",
      phone: "555-444-3333",
      address: "789 Oak St",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110002",
      organizationType: "food_bank",
      registrationNumber: "NGO12345",
      verificationStatus: "verified",
      createdAt: new Date(),
      latitude: 28.6129,
      longitude: 77.2295
    };
    this.recipients.set(recipient1.id, recipient1);

    const recipient2: Recipient = {
      id: this.recipientCurrentId++,
      email: "shelter@example.com",
      password: "password123",
      name: "Hope Shelter",
      phone: "555-222-1111",
      address: "101 Pine St",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002",
      organizationType: "ngo",
      registrationNumber: "NGO67890",
      verificationStatus: "verified",
      createdAt: new Date(),
      latitude: 19.0821,
      longitude: 72.8416
    };
    this.recipients.set(recipient2.id, recipient2);

    // Add sample donations
    const donation1: Donation = {
      id: this.donationCurrentId++,
      donorId: donor1.id,
      recipientId: null,
      title: "Fresh Vegetables",
      description: "Assorted fresh vegetables from today's stock",
      foodType: "fresh produce",
      quantity: "10 kg",
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      pickupInstructions: "Available for pickup at back door between 8-10pm",
      status: "available",
      anonymous: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      latitude: 19.0760,
      longitude: 72.8777,
      qualityChecklist: {
        properlyStored: true,
        properlyPackaged: true,
        notExpired: true,
        noVisibleSigns: true
      },
      trackingId: nanoid(10)
    };
    this.donations.set(donation1.id, donation1);

    const donation2: Donation = {
      id: this.donationCurrentId++,
      donorId: donor2.id,
      recipientId: recipient1.id,
      title: "Canned Goods",
      description: "Various canned foods near expiration but still good",
      foodType: "non-perishable",
      quantity: "30 cans",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      pickupInstructions: "Ask for manager at front desk",
      status: "claimed",
      anonymous: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      latitude: 28.6139,
      longitude: 77.2090,
      qualityChecklist: {
        properlyStored: true,
        properlyPackaged: true,
        notExpired: true,
        noVisibleSigns: true
      },
      trackingId: nanoid(10)
    };
    this.donations.set(donation2.id, donation2);

    // Add sample quality checklists
    const checklist1: QualityChecklist = {
      id: this.qualityChecklistCurrentId++,
      donationId: donation1.id,
      properlyStored: true,
      properlyPackaged: true,
      notExpired: true,
      noVisibleSigns: true,
      createdAt: new Date()
    };
    this.qualityChecklists.set(checklist1.id, checklist1);

    const checklist2: QualityChecklist = {
      id: this.qualityChecklistCurrentId++,
      donationId: donation2.id,
      properlyStored: true,
      properlyPackaged: true,
      notExpired: true,
      noVisibleSigns: true,
      createdAt: new Date()
    };
    this.qualityChecklists.set(checklist2.id, checklist2);
  }
}

// Import the database storage implementation
import { DatabaseStorage } from './database-storage';

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();
