import {
  users,
  profiles,
  swipes,
  matches,
  messages,
  testimonials,
  reports,
  vouchRequests,
  vouchPermissions,
  voucherInterviews,
  photoLikes,
  photoComments,
  notifications,
  matchMetadata,
  matchPreferences,
  adminActions,
  moderationQueue,
  platformSettings,
  announcements,
  userVerifications,
  circles,
  circleMemberships,
  circleInvitations,
  circleMessages,
  circleActivities,
  circleEvents,
  circleEventAttendees,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Swipe,
  type InsertSwipe,
  type Match,
  type Message,
  type InsertMessage,
  type Testimonial,
  type InsertTestimonial,
  type Report,
  type InsertReport,
  type VouchRequest,
  type InsertVouchRequest,
  type VouchPermission,
  type InsertVouchPermission,
  type VoucherInterview,
  type InsertVoucherInterview,
  type PhotoLike,
  type InsertPhotoLike,
  type PhotoComment,
  type InsertPhotoComment,
  type Notification,
  type InsertNotification,
  type MatchMetadata,
  type InsertMatchMetadata,
  type MatchPreferences,
  type InsertMatchPreferences,
  type AdminAction,
  type InsertAdminAction,
  type ModerationQueue,
  type InsertModerationQueue,
  type PlatformSetting,
  type InsertPlatformSetting,
  type Announcement,
  type InsertAnnouncement,
  type UserVerification,
  type InsertUserVerification,
  type Circle,
  type InsertCircle,
  type CircleMembership,
  type InsertCircleMembership,
  type CircleInvitation,
  type InsertCircleInvitation,
  type CircleMessage,
  type InsertCircleMessage,
  type CircleActivity,
  type InsertCircleActivity,
  type CircleEvent,
  type InsertCircleEvent,
  type CircleEventAttendee,
  type InsertCircleEventAttendee,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, ne, not, notInArray, sql, count, inArray, gte, lte, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserNamePreference(userId: string, showFullName: boolean): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileById(profileId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile>;
  getProfilesForDiscovery(userId: string, filters: any): Promise<Profile[]>;
  
  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipe(swiperId: string, swipedId: number): Promise<Swipe | undefined>;
  
  // Match operations
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: number): Promise<Message[]>;
  getDirectMessageConversation(userId1: string, userId2: string): Promise<Message[]>;
  markMessagesAsRead(matchId: number, userId: string): Promise<void>;
  
  // Testimonial operations
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getProfileTestimonials(profileId: number): Promise<Testimonial[]>;
  approveTestimonial(id: number): Promise<void>;
  getAllVouchesWithProfiles(relationship?: string, sortBy?: string): Promise<any[]>;
  getPropsGivers(profileId: number): Promise<any[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  
  // Vouch request operations
  createVouchRequest(vouchRequest: InsertVouchRequest): Promise<VouchRequest>;
  getVouchRequest(token: string): Promise<VouchRequest | undefined>;
  getVouchRequestsByProfileId(profileId: number): Promise<VouchRequest[]>;
  updateVouchRequestStatus(token: string, status: string): Promise<void>;
  
  // Voucher permission operations
  createVouchPermission(permission: InsertVouchPermission): Promise<VouchPermission>;
  getVouchPermission(profileId: number, matchId: number): Promise<VouchPermission | undefined>;
  getVouchPermissionsByProfile(profileId: number): Promise<VouchPermission[]>;
  revokeVouchPermission(permissionId: number): Promise<void>;
  
  // Voucher interview operations
  createVoucherInterview(interview: InsertVoucherInterview): Promise<VoucherInterview>;
  getVoucherInterview(id: number): Promise<VoucherInterview | undefined>;
  getVoucherInterviewsByPermission(permissionId: number): Promise<VoucherInterview[]>;
  updateVoucherInterviewStatus(id: number, status: string, responses?: string[]): Promise<void>;

  // Photo interaction operations for PopRep system
  createPhotoLike(like: InsertPhotoLike): Promise<PhotoLike>;
  removePhotoLike(testimonialId: number, photoIndex: number, userId: string): Promise<void>;
  getPhotoLikes(testimonialId: number, photoIndex: number): Promise<PhotoLike[]>;
  getUserPhotoLike(testimonialId: number, photoIndex: number, userId: string): Promise<PhotoLike | undefined>;
  
  createPhotoComment(comment: InsertPhotoComment): Promise<PhotoComment>;
  getPhotoComments(testimonialId: number, photoIndex: number): Promise<PhotoComment[]>;
  
  // PopRep calculation
  getProfilePopRep(profileId: number): Promise<{ totalLikes: number; totalComments: number; popRepScore: number }>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Enhanced match operations
  createMatchWithMetadata(user1Id: string, user2Id: string, metadata?: Partial<InsertMatchMetadata>): Promise<{ match: Match; metadata: MatchMetadata }>;
  getEnhancedMatches(userId: string): Promise<Array<Match & { metadata?: MatchMetadata; user1?: User; user2?: User; profile1?: Profile; profile2?: Profile }>>;
  updateMatchMetadata(matchId: number, metadata: Partial<InsertMatchMetadata>): Promise<MatchMetadata>;
  getMatchCompatibility(user1Id: string, user2Id: string): Promise<number>;
  
  // Match preferences operations
  createMatchPreferences(preferences: InsertMatchPreferences): Promise<MatchPreferences>;
  getMatchPreferences(userId: string): Promise<MatchPreferences | undefined>;
  updateMatchPreferences(userId: string, preferences: Partial<InsertMatchPreferences>): Promise<MatchPreferences>;
  getRecommendedMatches(userId: string, limit?: number): Promise<Profile[]>;

  // Admin and moderation operations
  // User management
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(userId: string, role: string, permissions?: string[]): Promise<User>;
  suspendUser(userId: string, duration: number, reason: string, suspendedBy: string): Promise<User>;
  reactivateUser(userId: string, reactivatedBy: string): Promise<User>;
  getUsersWithFilters(filters: {
    role?: string;
    isActive?: boolean;
    isSuspended?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }>;

  // Admin action logging
  logAdminAction(action: InsertAdminAction): Promise<AdminAction>;
  getAdminActions(filters?: {
    adminId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ actions: AdminAction[]; total: number }>;

  // Content moderation
  addToModerationQueue(item: InsertModerationQueue): Promise<ModerationQueue>;
  getModerationQueue(filters?: {
    status?: string;
    contentType?: string;
    priority?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ModerationQueue[]; total: number }>;
  assignModerationItem(itemId: number, moderatorId: string): Promise<ModerationQueue>;
  resolveModerationItem(itemId: number, status: string, notes?: string, resolvedBy?: string): Promise<ModerationQueue>;

  // Platform settings
  getPlatformSettings(category?: string): Promise<PlatformSetting[]>;
  updatePlatformSetting(settingKey: string, settingValue: any, updatedBy: string, description?: string): Promise<PlatformSetting>;
  createPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting>;

  // Announcements
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(filters?: {
    isActive?: boolean;
    type?: string;
    targetAudience?: string;
    page?: number;
    limit?: number;
  }): Promise<{ announcements: Announcement[]; total: number }>;
  updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  // User verification
  createUserVerification(verification: InsertUserVerification): Promise<UserVerification>;
  getUserVerifications(userId: string): Promise<UserVerification[]>;
  updateVerificationStatus(verificationId: number, status: string, verifiedBy?: string, notes?: string): Promise<UserVerification>;
  getVerificationQueue(filters?: {
    status?: string;
    verificationType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ verifications: UserVerification[]; total: number }>;

  // Admin analytics and reporting
  getAdminDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalProfiles: number;
    verifiedProfiles: number;
    pendingReports: number;
    pendingModerations: number;
    pendingVerifications: number;
  }>;
  getUserGrowthStats(days: number): Promise<Array<{ date: string; newUsers: number; activeUsers: number }>>;
  getContentModerationStats(days: number): Promise<Array<{ date: string; flagged: number; resolved: number }>>;

  // Circle operations
  createCircle(circle: InsertCircle): Promise<Circle>;
  getUserCircles(userId: string): Promise<Circle[]>;
  getCircleById(circleId: number): Promise<Circle | undefined>;
  updateCircle(circleId: number, updates: Partial<InsertCircle>): Promise<Circle>;
  deleteCircle(circleId: number): Promise<void>;
  
  // Circle invitation operations
  createCircleInvitation(invitation: InsertCircleInvitation): Promise<CircleInvitation>;
  getUserCircleInvitations(userId: string, status?: string): Promise<CircleInvitation[]>;
  getCircleInvitation(invitationId: number): Promise<CircleInvitation | undefined>;
  respondToCircleInvitation(invitationId: number, status: string): Promise<CircleInvitation>;
  
  // Circle membership operations
  addCircleMember(membership: InsertCircleMembership): Promise<CircleMembership>;
  getCircleMembers(circleId: number, viewerId?: string): Promise<CircleMembership[]>;
  removeCircleMember(circleId: number, userId: string): Promise<void>;
  getUserCircleMemberships(userId: string): Promise<CircleMembership[]>;
  updateCircleMemberNamePreference(circleId: number, userId: string, showFullName: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserNamePreference(userId: string, showFullName: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        showFullName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileById(profileId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getProfilesForDiscovery(userId: string, filters: any = {}): Promise<Profile[]> {
    // Get profiles that user hasn't swiped on yet
    const swipedProfileIds = await db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));

    const swipedIds = swipedProfileIds.map(s => s.swipedId);

    let query = db
      .select()
      .from(profiles)
      .where(
        and(
          ne(profiles.userId, userId), // Not own profile
          swipedIds.length > 0 ? notInArray(profiles.id, swipedIds) : undefined
        )
      )
      .limit(50); // Increase limit for better selection

    return await query;
  }

  // Swipe operations
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const [newSwipe] = await db.insert(swipes).values(swipe).returning();
    return newSwipe;
  }

  async getSwipe(swiperId: string, swipedId: number): Promise<Swipe | undefined> {
    const [swipe] = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.swiperId, swiperId), eq(swipes.swipedId, swipedId)));
    return swipe;
  }

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.status, "active")
        )
      )
      .orderBy(desc(matches.createdAt));
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMatchMessages(matchId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async getDirectMessageConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
        matchId: messages.matchId,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          isNull(messages.matchId), // Only direct messages (not match messages)
          or(
            and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
            and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(matchId: number, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          ne(messages.senderId, userId)
        )
      );
  }

  // Testimonial operations
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }

  async getProfileTestimonials(profileId: number): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .where(and(eq(testimonials.profileId, profileId), eq(testimonials.approved, true)))
      .orderBy(desc(testimonials.createdAt));
  }

  async approveTestimonial(id: number): Promise<void> {
    await db
      .update(testimonials)
      .set({ approved: true })
      .where(eq(testimonials.id, id));
  }

  async getAllVouchesWithProfiles(relationship?: string, sortBy?: string): Promise<any[]> {
    let whereConditions = [eq(testimonials.approved, true)];
    
    if (relationship && relationship !== 'all') {
      whereConditions.push(eq(testimonials.relationship, relationship));
    }

    let vouches = await db
      .select({
        id: testimonials.id,
        profileId: testimonials.profileId,
        profileName: profiles.name,
        profileAge: profiles.age,
        profilePhotos: profiles.photos,
        authorName: testimonials.authorName,
        relationship: testimonials.relationship,
        content: testimonials.content,
        ratings: testimonials.ratings,
        createdAt: testimonials.createdAt,
      })
      .from(testimonials)
      .innerJoin(profiles, eq(testimonials.profileId, profiles.id))
      .where(and(...whereConditions));

    // Enhance with vouch count and trust score for each profile
    const enhancedVouches = await Promise.all(
      vouches.map(async (vouch) => {
        const profileVouches = await this.getProfileTestimonials(vouch.profileId);
        const acceptedVouches = profileVouches.filter(v => v.approved === true);
        
        // Calculate average rating and trust score
        const ratings = acceptedVouches.flatMap(v => {
          if (!v.ratings) return [];
          const r = v.ratings as any;
          return [r.personality, r.reliability, r.kindness, r.fun, r.recommendation]
            .filter(rating => rating !== null && rating !== undefined);
        });
        
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : null;
        
        const vouchCount = acceptedVouches.length;
        const vouchScore = Math.min(vouchCount * 15, 60);
        const ratingScore = averageRating ? (averageRating / 5) * 30 : 0;
        const completenessScore = 10;
        const trustScore = Math.round(vouchScore + ratingScore + completenessScore);
        
        return {
          ...vouch,
          vouchCount,
          trustScore,
          averageRating,
        };
      })
    );

    // Sort results
    if (sortBy === 'rating') {
      enhancedVouches.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'trust') {
      enhancedVouches.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'recent') {
      enhancedVouches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return enhancedVouches;
  }

  async getPropsGivers(profileId: number): Promise<any[]> {
    // Get all users who gave testimonials/props to this profile
    const propsGivers = await db
      .select({
        id: testimonials.id,
        authorName: testimonials.authorName,
        authorEmail: testimonials.authorEmail,
        relationship: testimonials.relationship,
        rating: sql<number>`CASE 
          WHEN ${testimonials.ratings} IS NOT NULL THEN 
            (CAST(${testimonials.ratings}->>'personality' AS float) + 
             CAST(${testimonials.ratings}->>'reliability' AS float) + 
             CAST(${testimonials.ratings}->>'kindness' AS float) + 
             CAST(${testimonials.ratings}->>'fun' AS float) + 
             CAST(${testimonials.ratings}->>'recommendation' AS float)) / 5.0
          ELSE NULL 
        END`,
        content: testimonials.content,
        createdAt: testimonials.createdAt,
      })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.profileId, profileId),
          eq(testimonials.approved, true)
        )
      )
      .orderBy(desc(testimonials.createdAt));

    return propsGivers.map(giver => ({
      ...giver,
      profileImageUrl: null, // We don't have user profile images for testimonial givers
      initials: giver.authorName ? giver.authorName.split(' ').map(n => n[0]).join('').toUpperCase() : 'A',
    }));
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  // Vouch request operations
  async createVouchRequest(vouchRequest: InsertVouchRequest): Promise<VouchRequest> {
    const [newVouchRequest] = await db
      .insert(vouchRequests)
      .values(vouchRequest)
      .returning();
    return newVouchRequest;
  }

  async getVouchRequest(token: string): Promise<VouchRequest | undefined> {
    const [vouchRequest] = await db
      .select()
      .from(vouchRequests)
      .where(eq(vouchRequests.inviteToken, token));
    return vouchRequest;
  }

  async getVouchRequestsByProfileId(profileId: number): Promise<VouchRequest[]> {
    return await db
      .select()
      .from(vouchRequests)
      .where(eq(vouchRequests.profileId, profileId))
      .orderBy(desc(vouchRequests.createdAt));
  }

  async updateVouchRequestStatus(token: string, status: string): Promise<void> {
    await db
      .update(vouchRequests)
      .set({ 
        status, 
        respondedAt: new Date() 
      })
      .where(eq(vouchRequests.inviteToken, token));
  }

  // Voucher permission operations
  async createVouchPermission(permission: InsertVouchPermission): Promise<VouchPermission> {
    const [result] = await db
      .insert(vouchPermissions)
      .values(permission)
      .returning();
    return result;
  }

  async getVouchPermission(profileId: number, matchId: number): Promise<VouchPermission | undefined> {
    const [permission] = await db
      .select()
      .from(vouchPermissions)
      .where(
        and(
          eq(vouchPermissions.profileId, profileId),
          eq(vouchPermissions.matchId, matchId),
          eq(vouchPermissions.isActive, true)
        )
      );
    return permission;
  }

  async getVouchPermissionsByProfile(profileId: number): Promise<VouchPermission[]> {
    return await db
      .select()
      .from(vouchPermissions)
      .where(
        and(
          eq(vouchPermissions.profileId, profileId),
          eq(vouchPermissions.isActive, true)
        )
      );
  }

  async revokeVouchPermission(permissionId: number): Promise<void> {
    await db
      .update(vouchPermissions)
      .set({ isActive: false })
      .where(eq(vouchPermissions.id, permissionId));
  }

  // Voucher interview operations
  async createVoucherInterview(interview: InsertVoucherInterview): Promise<VoucherInterview> {
    const [result] = await db
      .insert(voucherInterviews)
      .values(interview)
      .returning();
    return result;
  }

  async getVoucherInterview(id: number): Promise<VoucherInterview | undefined> {
    const [interview] = await db
      .select()
      .from(voucherInterviews)
      .where(eq(voucherInterviews.id, id));
    return interview;
  }

  async getVoucherInterviewsByPermission(permissionId: number): Promise<VoucherInterview[]> {
    return await db
      .select()
      .from(voucherInterviews)
      .where(eq(voucherInterviews.permissionId, permissionId));
  }

  async updateVoucherInterviewStatus(id: number, status: string, responses?: string[]): Promise<void> {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    if (responses) {
      updateData.responses = responses;
    }
    
    await db
      .update(voucherInterviews)
      .set(updateData)
      .where(eq(voucherInterviews.id, id));
  }

  // Photo interaction operations for PopRep system
  async createPhotoLike(like: InsertPhotoLike): Promise<PhotoLike> {
    const [newLike] = await db
      .insert(photoLikes)
      .values(like)
      .returning();
    return newLike;
  }

  async removePhotoLike(testimonialId: number, photoIndex: number, userId: string): Promise<void> {
    await db
      .delete(photoLikes)
      .where(
        and(
          eq(photoLikes.testimonialId, testimonialId),
          eq(photoLikes.photoIndex, photoIndex),
          eq(photoLikes.userId, userId)
        )
      );
  }

  async getPhotoLikes(testimonialId: number, photoIndex: number): Promise<PhotoLike[]> {
    return await db
      .select()
      .from(photoLikes)
      .where(
        and(
          eq(photoLikes.testimonialId, testimonialId),
          eq(photoLikes.photoIndex, photoIndex)
        )
      )
      .orderBy(photoLikes.createdAt);
  }

  async getUserPhotoLike(testimonialId: number, photoIndex: number, userId: string): Promise<PhotoLike | undefined> {
    const [like] = await db
      .select()
      .from(photoLikes)
      .where(
        and(
          eq(photoLikes.testimonialId, testimonialId),
          eq(photoLikes.photoIndex, photoIndex),
          eq(photoLikes.userId, userId)
        )
      );
    return like;
  }

  async createPhotoComment(comment: InsertPhotoComment): Promise<PhotoComment> {
    const [newComment] = await db
      .insert(photoComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getPhotoComments(testimonialId: number, photoIndex: number): Promise<PhotoComment[]> {
    return await db
      .select()
      .from(photoComments)
      .where(
        and(
          eq(photoComments.testimonialId, testimonialId),
          eq(photoComments.photoIndex, photoIndex)
        )
      )
      .orderBy(photoComments.createdAt);
  }

  async getProfilePopRep(profileId: number): Promise<{ totalLikes: number; totalComments: number; popRepScore: number }> {
    // Get all testimonials for this profile
    const profileTestimonials = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(eq(testimonials.profileId, profileId));

    if (profileTestimonials.length === 0) {
      return { totalLikes: 0, totalComments: 0, popRepScore: 0 };
    }

    const testimonialIds = profileTestimonials.map(t => t.id);

    // Count total likes across all testimonials
    const likesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photoLikes)
      .where(inArray(photoLikes.testimonialId, testimonialIds));

    // Count total comments across all testimonials
    const commentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photoComments)
      .where(inArray(photoComments.testimonialId, testimonialIds));

    const totalLikes = likesResult[0]?.count || 0;
    const totalComments = commentsResult[0]?.count || 0;

    // Calculate PopRep score (weighted: likes = 1 point, comments = 2 points)
    const popRepScore = totalLikes + (totalComments * 2);

    return { totalLikes, totalComments, popRepScore };
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));
    
    if (unreadOnly) {
      query.where(eq(notifications.isRead, false));
    }
    
    return query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return Number(result[0]?.count || 0);
  }

  // Enhanced match operations
  async createMatchWithMetadata(user1Id: string, user2Id: string, metadata?: Partial<InsertMatchMetadata>): Promise<{ match: Match; metadata: MatchMetadata }> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();

    // Calculate compatibility if not provided
    const compatibility = metadata?.compatibility || await this.getMatchCompatibility(user1Id, user2Id);

    const [matchMeta] = await db
      .insert(matchMetadata)
      .values({
        matchId: match.id,
        compatibility,
        lastInteraction: new Date(),
        interactionCount: 0,
        ...metadata
      })
      .returning();

    // Create notifications for both users
    await Promise.all([
      this.createNotification({
        userId: user1Id,
        type: 'match',
        title: 'New Match!',
        message: 'You have a new match! Start a conversation.',
        data: { matchId: match.id }
      }),
      this.createNotification({
        userId: user2Id,
        type: 'match',
        title: 'New Match!',
        message: 'You have a new match! Start a conversation.',
        data: { matchId: match.id }
      })
    ]);

    return { match, metadata: matchMeta };
  }

  async getEnhancedMatches(userId: string): Promise<Array<Match & { metadata?: MatchMetadata; user1?: User; user2?: User; profile1?: Profile; profile2?: Profile }>> {
    const result = await db
      .select()
      .from(matches)
      .leftJoin(matchMetadata, eq(matches.id, matchMetadata.matchId))
      .leftJoin(users, eq(matches.user1Id, users.id))
      .leftJoin(profiles, eq(matches.user1Id, profiles.userId))
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));

    // Get additional user and profile data for the other user in each match
    const enhancedMatches = await Promise.all(
      result.map(async (row) => {
        const match = row.matches;
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        
        const otherUser = await this.getUser(otherUserId);
        const otherProfile = await this.getProfile(otherUserId);
        
        return {
          ...match,
          metadata: row.match_metadata || undefined,
          user1: match.user1Id === userId ? row.users || undefined : otherUser,
          user2: match.user2Id === userId ? row.users || undefined : otherUser,
          profile1: match.user1Id === userId ? row.profiles || undefined : otherProfile,
          profile2: match.user2Id === userId ? row.profiles || undefined : otherProfile,
        };
      })
    );

    return enhancedMatches;
  }

  async updateMatchMetadata(matchId: number, metadata: Partial<InsertMatchMetadata>): Promise<MatchMetadata> {
    const [updated] = await db
      .update(matchMetadata)
      .set({ ...metadata, updatedAt: new Date() })
      .where(eq(matchMetadata.matchId, matchId))
      .returning();
    return updated;
  }

  async getMatchCompatibility(user1Id: string, user2Id: string): Promise<number> {
    // Get profiles for both users
    const profile1 = await this.getProfile(user1Id);
    const profile2 = await this.getProfile(user2Id);

    if (!profile1 || !profile2) return 0;

    let score = 0;
    let factors = 0;

    // Age compatibility (within 10 years = 0.2 points)
    const ageDiff = Math.abs(profile1.age - profile2.age);
    if (ageDiff <= 10) {
      score += 0.2 * (1 - ageDiff / 10);
      factors++;
    }

    // Interest overlap (0.4 points max)
    if (profile1.interests && profile2.interests) {
      const interests1 = new Set(profile1.interests);
      const interests2 = new Set(profile2.interests);
      const overlap = [...interests1].filter(x => interests2.has(x)).length;
      const total = Math.max(interests1.size, interests2.size);
      if (total > 0) {
        score += 0.4 * (overlap / total);
        factors++;
      }
    }

    // Location compatibility (same location = 0.2 points)
    if (profile1.location && profile2.location && profile1.location === profile2.location) {
      score += 0.2;
      factors++;
    }

    // RealBar compatibility (0.2 points max)
    const testimonials1 = await this.getProfileTestimonials(profile1.id);
    const testimonials2 = await this.getProfileTestimonials(profile2.id);
    const rep1 = testimonials1.length * 10 + (profile1.rating || 0) * 15;
    const rep2 = testimonials2.length * 10 + (profile2.rating || 0) * 15;
    const repDiff = Math.abs(rep1 - rep2);
    score += 0.2 * Math.max(0, 1 - repDiff / 100);
    factors++;

    return factors > 0 ? Math.min(1, score) : 0.5; // Default to 0.5 if no factors
  }

  // Match preferences operations
  async createMatchPreferences(preferences: InsertMatchPreferences): Promise<MatchPreferences> {
    const [newPreferences] = await db
      .insert(matchPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async getMatchPreferences(userId: string): Promise<MatchPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(matchPreferences)
      .where(eq(matchPreferences.userId, userId));
    return preferences;
  }

  async updateMatchPreferences(userId: string, preferences: Partial<InsertMatchPreferences>): Promise<MatchPreferences> {
    const [updated] = await db
      .update(matchPreferences)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(matchPreferences.userId, userId))
      .returning();
    return updated;
  }

  async getRecommendedMatches(userId: string, limit: number = 20): Promise<Profile[]> {
    const userPreferences = await this.getMatchPreferences(userId);
    const userProfile = await this.getProfile(userId);

    if (!userProfile) return [];

    // Get users already swiped on
    const swipedProfiles = await db
      .select({ profileId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
    
    const swipedIds = swipedProfiles.map(s => s.profileId);

    let query = db
      .select()
      .from(profiles)
      .where(and(
        ne(profiles.userId, userId), // Not self
        swipedIds.length > 0 ? not(inArray(profiles.id, swipedIds)) : sql`true` // Not already swiped
      ));

    // Apply preferences if they exist
    if (userPreferences) {
      if (userPreferences.ageRangeMin && userPreferences.ageRangeMax) {
        query = query.where(and(
          gte(profiles.age, userPreferences.ageRangeMin),
          lte(profiles.age, userPreferences.ageRangeMax)
        ));
      }

      if (userPreferences.mustHaveProps) {
        // Only show profiles with testimonials
        const profilesWithTestimonials = db
          .select({ profileId: testimonials.profileId })
          .from(testimonials)
          .where(eq(testimonials.approved, true));
        
        query = query.where(inArray(profiles.id, profilesWithTestimonials));
      }
    }

    const recommendedProfiles = await query
      .limit(limit * 2) // Get more to filter and rank
      .orderBy(sql`RANDOM()`);

    // Calculate compatibility scores and sort
    const scoredProfiles = await Promise.all(
      recommendedProfiles.map(async (profile) => {
        const compatibility = await this.getMatchCompatibility(userId, profile.userId);
        return { profile, compatibility };
      })
    );

    return scoredProfiles
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit)
      .map(item => item.profile);
  }

  // ===== ADMIN AND MODERATION OPERATIONS =====

  // User management
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async updateUserRole(userId: string, role: string, permissions?: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role,
        permissions: permissions || [],
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async suspendUser(userId: string, duration: number, reason: string, suspendedBy: string): Promise<User> {
    const suspendedUntil = new Date();
    suspendedUntil.setHours(suspendedUntil.getHours() + duration);

    const [user] = await db
      .update(users)
      .set({
        isSuspended: true,
        suspendedUntil,
        suspensionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Log the admin action
    await this.logAdminAction({
      adminId: suspendedBy,
      action: 'user_suspend',
      targetType: 'user',
      targetId: userId,
      reason,
      details: { duration, suspendedUntil }
    });

    return user;
  }

  async reactivateUser(userId: string, reactivatedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isSuspended: false,
        suspendedUntil: null,
        suspensionReason: null,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Log the admin action
    await this.logAdminAction({
      adminId: reactivatedBy,
      action: 'user_activate',
      targetType: 'user',
      targetId: userId,
      reason: 'User reactivated by admin'
    });

    return user;
  }

  async getUsersWithFilters(filters: {
    role?: string;
    isActive?: boolean;
    isSuspended?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }
    if (filters.isSuspended !== undefined) {
      conditions.push(eq(users.isSuspended, filters.isSuspended));
    }
    if (filters.search) {
      conditions.push(
        or(
          sql`${users.email} ILIKE ${`%${filters.search}%`}`,
          sql`${users.firstName} ILIKE ${`%${filters.search}%`}`,
          sql`${users.lastName} ILIKE ${`%${filters.search}%`}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [usersResult, totalResult] = await Promise.all([
      db.select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(users)
        .where(whereClause)
    ]);

    return {
      users: usersResult,
      total: totalResult[0].count
    };
  }

  // Admin action logging
  async logAdminAction(action: InsertAdminAction): Promise<AdminAction> {
    const [adminAction] = await db
      .insert(adminActions)
      .values(action)
      .returning();
    return adminAction;
  }

  async getAdminActions(filters?: {
    adminId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ actions: AdminAction[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.adminId) {
      conditions.push(eq(adminActions.adminId, filters.adminId));
    }
    if (filters?.action) {
      conditions.push(eq(adminActions.action, filters.action));
    }
    if (filters?.targetType) {
      conditions.push(eq(adminActions.targetType, filters.targetType));
    }
    if (filters?.targetId) {
      conditions.push(eq(adminActions.targetId, filters.targetId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(adminActions.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(adminActions.createdAt, filters.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [actionsResult, totalResult] = await Promise.all([
      db.select()
        .from(adminActions)
        .where(whereClause)
        .orderBy(desc(adminActions.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(adminActions)
        .where(whereClause)
    ]);

    return {
      actions: actionsResult,
      total: totalResult[0].count
    };
  }

  // Content moderation
  async addToModerationQueue(item: InsertModerationQueue): Promise<ModerationQueue> {
    const [moderationItem] = await db
      .insert(moderationQueue)
      .values(item)
      .returning();
    return moderationItem;
  }

  async getModerationQueue(filters?: {
    status?: string;
    contentType?: string;
    priority?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ModerationQueue[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(moderationQueue.status, filters.status));
    }
    if (filters?.contentType) {
      conditions.push(eq(moderationQueue.contentType, filters.contentType));
    }
    if (filters?.priority) {
      conditions.push(eq(moderationQueue.priority, filters.priority));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(moderationQueue.assignedTo, filters.assignedTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [itemsResult, totalResult] = await Promise.all([
      db.select()
        .from(moderationQueue)
        .where(whereClause)
        .orderBy(desc(moderationQueue.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(moderationQueue)
        .where(whereClause)
    ]);

    return {
      items: itemsResult,
      total: totalResult[0].count
    };
  }

  async assignModerationItem(itemId: number, moderatorId: string): Promise<ModerationQueue> {
    const [item] = await db
      .update(moderationQueue)
      .set({
        assignedTo: moderatorId,
        status: 'in_review',
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, itemId))
      .returning();
    return item;
  }

  async resolveModerationItem(itemId: number, status: string, notes?: string, resolvedBy?: string): Promise<ModerationQueue> {
    const [item] = await db
      .update(moderationQueue)
      .set({
        status,
        moderatorNotes: notes,
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, itemId))
      .returning();

    // Log the resolution action
    if (resolvedBy) {
      await this.logAdminAction({
        adminId: resolvedBy,
        action: 'content_review',
        targetType: item.contentType,
        targetId: item.contentId,
        reason: `Content ${status}: ${notes || 'No additional notes'}`
      });
    }

    return item;
  }

  // Platform settings
  async getPlatformSettings(category?: string): Promise<PlatformSetting[]> {
    const conditions = category ? [eq(platformSettings.category, category)] : [];
    return await db
      .select()
      .from(platformSettings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(platformSettings.category, platformSettings.settingKey);
  }

  async updatePlatformSetting(settingKey: string, settingValue: any, updatedBy: string, description?: string): Promise<PlatformSetting> {
    const [setting] = await db
      .update(platformSettings)
      .set({
        settingValue,
        description,
        lastModifiedBy: updatedBy,
        updatedAt: new Date()
      })
      .where(eq(platformSettings.settingKey, settingKey))
      .returning();

    // Log the setting change
    await this.logAdminAction({
      adminId: updatedBy,
      action: 'setting_update',
      targetType: 'platform_setting',
      targetId: settingKey,
      reason: `Platform setting updated`,
      details: { newValue: settingValue, description }
    });

    return setting;
  }

  async createPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const [newSetting] = await db
      .insert(platformSettings)
      .values(setting)
      .returning();

    // Log the setting creation
    await this.logAdminAction({
      adminId: setting.lastModifiedBy,
      action: 'setting_create',
      targetType: 'platform_setting',
      targetId: setting.settingKey,
      reason: `New platform setting created`,
      details: { value: setting.settingValue, description: setting.description }
    });

    return newSetting;
  }

  // Announcements
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();

    // Log the announcement creation
    await this.logAdminAction({
      adminId: announcement.createdBy,
      action: 'announcement_create',
      targetType: 'announcement',
      targetId: newAnnouncement.id.toString(),
      reason: `New announcement created: ${announcement.title}`
    });

    return newAnnouncement;
  }

  async getAnnouncements(filters?: {
    isActive?: boolean;
    type?: string;
    targetAudience?: string;
    page?: number;
    limit?: number;
  }): Promise<{ announcements: Announcement[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.isActive !== undefined) {
      conditions.push(eq(announcements.isActive, filters.isActive));
    }
    if (filters?.type) {
      conditions.push(eq(announcements.type, filters.type));
    }
    if (filters?.targetAudience) {
      conditions.push(eq(announcements.targetAudience, filters.targetAudience));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [announcementsResult, totalResult] = await Promise.all([
      db.select()
        .from(announcements)
        .where(whereClause)
        .orderBy(desc(announcements.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(announcements)
        .where(whereClause)
    ]);

    return {
      announcements: announcementsResult,
      total: totalResult[0].count
    };
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // User verification
  async createUserVerification(verification: InsertUserVerification): Promise<UserVerification> {
    const [newVerification] = await db
      .insert(userVerifications)
      .values(verification)
      .returning();
    return newVerification;
  }

  async getUserVerifications(userId: string): Promise<UserVerification[]> {
    return await db
      .select()
      .from(userVerifications)
      .where(eq(userVerifications.userId, userId))
      .orderBy(desc(userVerifications.createdAt));
  }

  async updateVerificationStatus(verificationId: number, status: string, verifiedBy?: string, notes?: string): Promise<UserVerification> {
    const [verification] = await db
      .update(userVerifications)
      .set({
        status,
        verifiedBy,
        notes,
        updatedAt: new Date()
      })
      .where(eq(userVerifications.id, verificationId))
      .returning();

    // Log the verification action
    if (verifiedBy) {
      await this.logAdminAction({
        adminId: verifiedBy,
        action: status === 'verified' ? 'user_verify' : 'user_verification_reject',
        targetType: 'user_verification',
        targetId: verificationId.toString(),
        reason: `User verification ${status}: ${notes || 'No additional notes'}`
      });
    }

    return verification;
  }

  async getVerificationQueue(filters?: {
    status?: string;
    verificationType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ verifications: UserVerification[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(userVerifications.status, filters.status));
    }
    if (filters?.verificationType) {
      conditions.push(eq(userVerifications.verificationType, filters.verificationType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [verificationsResult, totalResult] = await Promise.all([
      db.select()
        .from(userVerifications)
        .where(whereClause)
        .orderBy(desc(userVerifications.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(userVerifications)
        .where(whereClause)
    ]);

    return {
      verifications: verificationsResult,
      total: totalResult[0].count
    };
  }

  // Admin analytics and reporting
  async getAdminDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalProfiles: number;
    verifiedProfiles: number;
    pendingReports: number;
    pendingModerations: number;
    pendingVerifications: number;
  }> {
    const [
      totalUsersResult,
      activeUsersResult,
      suspendedUsersResult,
      totalProfilesResult,
      verifiedProfilesResult,
      pendingReportsResult,
      pendingModerationsResult,
      pendingVerificationsResult
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(eq(users.isActive, true)),
      db.select({ count: count() }).from(users).where(eq(users.isSuspended, true)),
      db.select({ count: count() }).from(profiles),
      db.select({ count: count() }).from(profiles).where(eq(profiles.verified, true)),
      db.select({ count: count() }).from(reports).where(eq(reports.status, 'pending')),
      db.select({ count: count() }).from(moderationQueue).where(eq(moderationQueue.status, 'pending')),
      db.select({ count: count() }).from(userVerifications).where(eq(userVerifications.status, 'pending'))
    ]);

    return {
      totalUsers: totalUsersResult[0].count,
      activeUsers: activeUsersResult[0].count,
      suspendedUsers: suspendedUsersResult[0].count,
      totalProfiles: totalProfilesResult[0].count,
      verifiedProfiles: verifiedProfilesResult[0].count,
      pendingReports: pendingReportsResult[0].count,
      pendingModerations: pendingModerationsResult[0].count,
      pendingVerifications: pendingVerificationsResult[0].count
    };
  }

  async getUserGrowthStats(days: number): Promise<Array<{ date: string; newUsers: number; activeUsers: number }>> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const results = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        newUsers: count(users.id),
      })
      .from(users)
      .where(gte(users.createdAt, dateFrom))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // For now, return new users only (active users would require session tracking)
    return results.map(row => ({
      date: row.date,
      newUsers: row.newUsers,
      activeUsers: 0 // Would need session/activity tracking to implement
    }));
  }

  async getContentModerationStats(days: number): Promise<Array<{ date: string; flagged: number; resolved: number }>> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const [flaggedResults, resolvedResults] = await Promise.all([
      db
        .select({
          date: sql<string>`DATE(${moderationQueue.createdAt})`,
          count: count(moderationQueue.id),
        })
        .from(moderationQueue)
        .where(gte(moderationQueue.createdAt, dateFrom))
        .groupBy(sql`DATE(${moderationQueue.createdAt})`)
        .orderBy(sql`DATE(${moderationQueue.createdAt})`),
      db
        .select({
          date: sql<string>`DATE(${moderationQueue.resolvedAt})`,
          count: count(moderationQueue.id),
        })
        .from(moderationQueue)
        .where(
          and(
            gte(moderationQueue.resolvedAt, dateFrom),
            not(isNull(moderationQueue.resolvedAt))
          )
        )
        .groupBy(sql`DATE(${moderationQueue.resolvedAt})`)
        .orderBy(sql`DATE(${moderationQueue.resolvedAt})`)
    ]);

    // Combine results by date
    const dateMap = new Map<string, { flagged: number; resolved: number }>();
    
    flaggedResults.forEach(row => {
      dateMap.set(row.date, { flagged: row.count, resolved: 0 });
    });
    
    resolvedResults.forEach(row => {
      const existing = dateMap.get(row.date) || { flagged: 0, resolved: 0 };
      existing.resolved = row.count;
      dateMap.set(row.date, existing);
    });

    return Array.from(dateMap.entries()).map(([date, stats]) => ({
      date,
      flagged: stats.flagged,
      resolved: stats.resolved
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Circle operations
  async createCircle(circle: InsertCircle): Promise<Circle> {
    const [newCircle] = await db.insert(circles).values(circle).returning();
    return newCircle;
  }

  async getUserCircles(userId: string): Promise<Circle[]> {
    // Get circles owned by user
    const ownedCircles = await db
      .select()
      .from(circles)
      .where(eq(circles.ownerId, userId))
      .orderBy(desc(circles.createdAt));

    // Get circles where user is a member
    const joinedCircles = await db
      .select({
        id: circles.id,
        name: circles.name,
        description: circles.description,
        category: circles.category,
        isPrivate: circles.isPrivate,
        showMembers: circles.showMembers,
        ownerId: circles.ownerId,
        memberCount: circles.memberCount,
        createdAt: circles.createdAt,
        updatedAt: circles.updatedAt,
      })
      .from(circles)
      .innerJoin(circleMemberships, eq(circles.id, circleMemberships.circleId))
      .where(
        and(
          eq(circleMemberships.userId, userId),
          eq(circleMemberships.status, 'active'),
          ne(circles.ownerId, userId) // Don't include circles they own (already in ownedCircles)
        )
      )
      .orderBy(desc(circles.createdAt));

    // Combine and deduplicate
    const allCircles = [...ownedCircles, ...joinedCircles];
    return allCircles;
  }

  async getCircleById(circleId: number): Promise<Circle | undefined> {
    const [circle] = await db
      .select()
      .from(circles)
      .where(eq(circles.id, circleId));
    return circle;
  }

  async updateCircle(circleId: number, updates: Partial<InsertCircle>): Promise<Circle> {
    const [updatedCircle] = await db
      .update(circles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(circles.id, circleId))
      .returning();
    return updatedCircle;
  }

  async deleteCircle(circleId: number): Promise<void> {
    // Delete in correct order to avoid foreign key constraint violations
    // First delete all circle invitations
    await db.delete(circleInvitations).where(eq(circleInvitations.circleId, circleId));
    
    // Then delete all circle memberships
    await db.delete(circleMemberships).where(eq(circleMemberships.circleId, circleId));
    
    // Finally delete the circle itself
    await db.delete(circles).where(eq(circles.id, circleId));
  }

  // Circle invitation operations
  async createCircleInvitation(invitation: InsertCircleInvitation): Promise<CircleInvitation> {
    const [newInvitation] = await db
      .insert(circleInvitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }

  async getUserCircleInvitations(userId: string, status?: string): Promise<CircleInvitation[]> {
    let query = db
      .select({
        id: circleInvitations.id,
        circleId: circleInvitations.circleId,
        inviterId: circleInvitations.inviterId,
        inviteeId: circleInvitations.inviteeId,
        status: circleInvitations.status,
        message: circleInvitations.message,
        createdAt: circleInvitations.createdAt,
        respondedAt: circleInvitations.respondedAt,
        circle: {
          id: circles.id,
          name: circles.name,
          description: circles.description,
          category: circles.category,
          isPrivate: circles.isPrivate,
        },
        inviter: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleInvitations)
      .leftJoin(circles, eq(circleInvitations.circleId, circles.id))
      .leftJoin(users, eq(circleInvitations.inviterId, users.id))
      .where(eq(circleInvitations.inviteeId, userId));

    if (status) {
      query = query.where(eq(circleInvitations.status, status));
    }

    return await query.orderBy(desc(circleInvitations.createdAt));
  }

  async getCircleInvitation(invitationId: number): Promise<CircleInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(circleInvitations)
      .where(eq(circleInvitations.id, invitationId));
    return invitation;
  }

  async respondToCircleInvitation(invitationId: number, status: string): Promise<CircleInvitation> {
    const [updatedInvitation] = await db
      .update(circleInvitations)
      .set({ 
        status, 
        respondedAt: new Date() 
      })
      .where(eq(circleInvitations.id, invitationId))
      .returning();
    return updatedInvitation;
  }

  // Circle membership operations
  async addCircleMember(membership: InsertCircleMembership): Promise<CircleMembership> {
    const [newMembership] = await db
      .insert(circleMemberships)
      .values({ ...membership, joinedAt: new Date() })
      .returning();

    // Update circle member count
    await db
      .update(circles)
      .set({ 
        memberCount: sql`${circles.memberCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(circles.id, membership.circleId));

    return newMembership;
  }

  async getCircleMembers(circleId: number, viewerId?: string): Promise<CircleMembership[]> {
    // First check if members should be visible
    const [circle] = await db
      .select({ ownerId: circles.ownerId, showMembers: circles.showMembers })
      .from(circles)
      .where(eq(circles.id, circleId));
    
    if (!circle) {
      return [];
    }

    // If viewer is the owner or members are set to be visible, show members
    const canViewMembers = circle.showMembers || (viewerId && circle.ownerId === viewerId);
    
    if (!canViewMembers) {
      return [];
    }

    return await db
      .select({
        id: circleMemberships.id,
        circleId: circleMemberships.circleId,
        userId: circleMemberships.userId,
        invitedBy: circleMemberships.invitedBy,
        status: circleMemberships.status,
        showFullName: circleMemberships.showFullName,
        createdAt: circleMemberships.createdAt,
        joinedAt: circleMemberships.joinedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleMemberships)
      .leftJoin(users, eq(circleMemberships.userId, users.id))
      .where(eq(circleMemberships.circleId, circleId))
      .orderBy(desc(circleMemberships.joinedAt));
  }

  async removeCircleMember(circleId: number, userId: string): Promise<void> {
    await db
      .delete(circleMemberships)
      .where(
        and(
          eq(circleMemberships.circleId, circleId),
          eq(circleMemberships.userId, userId)
        )
      );

    // Update circle member count
    await db
      .update(circles)
      .set({ 
        memberCount: sql`${circles.memberCount} - 1`,
        updatedAt: new Date()
      })
      .where(eq(circles.id, circleId));
  }

  async getUserCircleMemberships(userId: string): Promise<CircleMembership[]> {
    return await db
      .select({
        id: circleMemberships.id,
        circleId: circleMemberships.circleId,
        userId: circleMemberships.userId,
        invitedBy: circleMemberships.invitedBy,
        status: circleMemberships.status,
        createdAt: circleMemberships.createdAt,
        joinedAt: circleMemberships.joinedAt,
        circle: {
          id: circles.id,
          name: circles.name,
          description: circles.description,
          category: circles.category,
          isPrivate: circles.isPrivate,
          memberCount: circles.memberCount,
        }
      })
      .from(circleMemberships)
      .leftJoin(circles, eq(circleMemberships.circleId, circles.id))
      .where(eq(circleMemberships.userId, userId))
      .orderBy(desc(circleMemberships.joinedAt));
  }

  async updateCircleMemberNamePreference(circleId: number, userId: string, showFullName: boolean): Promise<void> {
    await db
      .update(circleMemberships)
      .set({ showFullName })
      .where(
        and(
          eq(circleMemberships.circleId, circleId),
          eq(circleMemberships.userId, userId),
          eq(circleMemberships.status, 'accepted')
        )
      );
  }

  // Circle message operations
  async createCircleMessage(message: InsertCircleMessage): Promise<CircleMessage> {
    const [newMessage] = await db
      .insert(circleMessages)
      .values(message)
      .returning();

    // Create activity for the message
    await this.createCircleActivity({
      circleId: message.circleId,
      userId: message.senderId,
      activityType: 'message',
      description: `Sent a message: "${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}"`
    });

    return newMessage;
  }

  async getCircleMessages(circleId: number, limit: number = 50): Promise<CircleMessage[]> {
    return await db
      .select({
        id: circleMessages.id,
        circleId: circleMessages.circleId,
        senderId: circleMessages.senderId,
        message: circleMessages.message,
        messageType: circleMessages.messageType,
        attachments: circleMessages.attachments,
        isAnnouncement: circleMessages.isAnnouncement,
        createdAt: circleMessages.createdAt,
        updatedAt: circleMessages.updatedAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleMessages)
      .leftJoin(users, eq(circleMessages.senderId, users.id))
      .where(eq(circleMessages.circleId, circleId))
      .orderBy(desc(circleMessages.createdAt))
      .limit(limit);
  }

  async deleteCircleMessage(messageId: number): Promise<void> {
    await db.delete(circleMessages).where(eq(circleMessages.id, messageId));
  }

  // Circle activity operations
  async createCircleActivity(activity: InsertCircleActivity): Promise<CircleActivity> {
    const [newActivity] = await db
      .insert(circleActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getCircleActivities(circleId: number, limit: number = 20): Promise<CircleActivity[]> {
    return await db
      .select({
        id: circleActivities.id,
        circleId: circleActivities.circleId,
        userId: circleActivities.userId,
        activityType: circleActivities.activityType,
        activityData: circleActivities.activityData,
        description: circleActivities.description,
        createdAt: circleActivities.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleActivities)
      .leftJoin(users, eq(circleActivities.userId, users.id))
      .where(eq(circleActivities.circleId, circleId))
      .orderBy(desc(circleActivities.createdAt))
      .limit(limit);
  }

  // Circle event operations
  async createCircleEvent(event: InsertCircleEvent): Promise<CircleEvent> {
    const [newEvent] = await db
      .insert(circleEvents)
      .values(event)
      .returning();

    // Create activity for the event
    await this.createCircleActivity({
      circleId: event.circleId,
      userId: event.creatorId,
      activityType: 'created_event',
      description: `Created event: ${event.title}`
    });

    return newEvent;
  }

  async getCircleEvents(circleId: number): Promise<CircleEvent[]> {
    return await db
      .select({
        id: circleEvents.id,
        circleId: circleEvents.circleId,
        creatorId: circleEvents.creatorId,
        title: circleEvents.title,
        description: circleEvents.description,
        eventDate: circleEvents.eventDate,
        location: circleEvents.location,
        maxAttendees: circleEvents.maxAttendees,
        isVirtual: circleEvents.isVirtual,
        meetingLink: circleEvents.meetingLink,
        status: circleEvents.status,
        createdAt: circleEvents.createdAt,
        updatedAt: circleEvents.updatedAt,
        creator: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleEvents)
      .leftJoin(users, eq(circleEvents.creatorId, users.id))
      .where(eq(circleEvents.circleId, circleId))
      .orderBy(asc(circleEvents.eventDate));
  }

  async updateCircleEvent(eventId: number, updates: Partial<InsertCircleEvent>): Promise<CircleEvent> {
    const [updatedEvent] = await db
      .update(circleEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(circleEvents.id, eventId))
      .returning();
    return updatedEvent;
  }

  async deleteCircleEvent(eventId: number): Promise<void> {
    // Delete attendees first
    await db.delete(circleEventAttendees).where(eq(circleEventAttendees.eventId, eventId));
    // Delete event
    await db.delete(circleEvents).where(eq(circleEvents.id, eventId));
  }

  // Circle event attendee operations
  async addEventAttendee(attendee: InsertCircleEventAttendee): Promise<CircleEventAttendee> {
    const [newAttendee] = await db
      .insert(circleEventAttendees)
      .values(attendee)
      .returning();
    return newAttendee;
  }

  async getEventAttendees(eventId: number): Promise<CircleEventAttendee[]> {
    return await db
      .select({
        id: circleEventAttendees.id,
        eventId: circleEventAttendees.eventId,
        userId: circleEventAttendees.userId,
        status: circleEventAttendees.status,
        createdAt: circleEventAttendees.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(circleEventAttendees)
      .leftJoin(users, eq(circleEventAttendees.userId, users.id))
      .where(eq(circleEventAttendees.eventId, eventId))
      .orderBy(desc(circleEventAttendees.createdAt));
  }

  async updateEventAttendeeStatus(eventId: number, userId: string, status: string): Promise<CircleEventAttendee> {
    const [updatedAttendee] = await db
      .update(circleEventAttendees)
      .set({ status })
      .where(
        and(
          eq(circleEventAttendees.eventId, eventId),
          eq(circleEventAttendees.userId, userId)
        )
      )
      .returning();
    return updatedAttendee;
  }

  async removeEventAttendee(eventId: number, userId: string): Promise<void> {
    await db
      .delete(circleEventAttendees)
      .where(
        and(
          eq(circleEventAttendees.eventId, eventId),
          eq(circleEventAttendees.userId, userId)
        )
      );
  }

  // Helper method to check if user is circle member
  async isCircleMember(circleId: number, userId: string): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(circleMemberships)
      .where(
        and(
          eq(circleMemberships.circleId, circleId),
          eq(circleMemberships.userId, userId),
          eq(circleMemberships.status, 'accepted')
        )
      );
    return !!membership;
  }

  // Get circle with member information
  async getCircleWithMembers(circleId: number): Promise<any> {
    const circle = await this.getCircleById(circleId);
    if (!circle) return null;

    const members = await this.getCircleMembers(circleId);
    const recentActivities = await this.getCircleActivities(circleId, 10);
    const upcomingEvents = await this.getCircleEvents(circleId);

    return {
      ...circle,
      members,
      recentActivities,
      upcomingEvents: upcomingEvents.filter(event => 
        new Date(event.eventDate) > new Date() && event.status === 'active'
      )
    };
  }
}

export const storage = new DatabaseStorage();
