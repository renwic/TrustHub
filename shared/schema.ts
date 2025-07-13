import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports multiple auth providers)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").notNull().default("replit"), // 'replit', 'google', 'facebook', 'apple', 'email'
  providerUserId: varchar("provider_user_id"), // ID from the auth provider
  passwordHash: varchar("password_hash"), // For email/password auth
  emailVerified: boolean("email_verified").default(false),
  phoneNumber: varchar("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  // Admin and moderation roles
  role: varchar("role").default("user"), // 'user', 'moderator', 'admin', 'super_admin'
  permissions: text("permissions").array(), // Array of specific permissions
  isActive: boolean("is_active").default(true),
  isSuspended: boolean("is_suspended").default(false),
  suspendedUntil: timestamp("suspended_until"),
  suspensionReason: text("suspension_reason"),
  lastLoginAt: timestamp("last_login_at"),
  showFullName: boolean("show_full_name").default(false), // Global preference for showing full name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dating profiles
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  bio: text("bio"),
  photos: text("photos").array(),
  interests: text("interests").array(),
  location: varchar("location"),
  relationshipStatus: varchar("relationship_status").default("Solo"),
  verified: boolean("verified").default(false),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  height: integer("height"), // in cm
  heightUnit: varchar("height_unit").default("cm"), // 'cm' or 'ft'
  weight: integer("weight"), // in kg
  weightUnit: varchar("weight_unit").default("kg"), // 'kg' or 'lbs'
  measurementSystem: varchar("measurement_system").default("metric"), // 'metric' or 'imperial'
  education: varchar("education"),
  occupation: varchar("occupation"),
  religion: varchar("religion"),
  drinking: varchar("drinking"), // never, occasionally, socially, regularly
  smoking: varchar("smoking"), // never, occasionally, socially, regularly
  lookingFor: varchar("looking_for"), // relationship, casual, friends, not sure
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Swipe actions (likes/passes)
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: varchar("swiper_id").notNull().references(() => users.id),
  swipedId: integer("swiped_id").notNull().references(() => profiles.id),
  action: varchar("action").notNull(), // 'like', 'pass', 'super_like'
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches when two users like each other
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  status: varchar("status").default("active"), // 'active', 'blocked', 'unmatched'
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between matched users and direct messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id), // Optional - null for direct messages
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id), // For direct messages
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Testimonials from friends/family
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  authorName: varchar("author_name").notNull(),
  authorEmail: varchar("author_email"),
  relationship: varchar("relationship").notNull(), // 'friend', 'family', 'colleague', etc.
  content: text("content").notNull(),
  ratings: jsonb("ratings"), // { kindness: 5, loyalty: 4, communication: 5 }
  approved: boolean("approved").default(false),
  // New photo sharing features
  sharedPhotos: text("shared_photos").array(), // URLs to photos voucher wants to share
  photoDescriptions: text("photo_descriptions").array(), // Brief descriptions for each photo
  allowPhotoSharing: boolean("allow_photo_sharing").default(false), // Voucher permission to share photos
  createdAt: timestamp("created_at").defaultNow(),
});

// User reports and blocks
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedId: integer("reported_id").notNull().references(() => profiles.id),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // 'pending', 'reviewed', 'resolved'
  createdAt: timestamp("created_at").defaultNow(),
});

// Vouch requests system for sharing unique links
export const vouchRequests = pgTable("vouch_requests", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  inviteToken: varchar("invite_token").unique().notNull(),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  relationship: varchar("relationship"),
  personalMessage: text("personal_message"),
  status: varchar("status").default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Voucher permission system for matches to interview vouchers
export const vouchPermissions = pgTable("vouch_permissions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Voucher interviews - questions from matches to vouchers
export const voucherInterviews = pgTable("voucher_interviews", {
  id: serial("id").primaryKey(),
  permissionId: integer("permission_id").notNull().references(() => vouchPermissions.id),
  voucherId: integer("voucher_id").notNull().references(() => testimonials.id),
  requesterUserId: varchar("requester_user_id").notNull().references(() => users.id),
  questions: text("questions").array(),
  responses: text("responses").array(),
  status: varchar("status").default("pending"), // pending, completed, declined
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  swipes: many(swipes),
  sentMessages: many(messages),
  matches1: many(matches, { relationName: "user1Matches" }),
  matches2: many(matches, { relationName: "user2Matches" }),
  reports: many(reports),
  vouchRequests: many(vouchRequests),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  swipesReceived: many(swipes),
  testimonials: many(testimonials),
  reportsReceived: many(reports),
  vouchRequestsReceived: many(vouchRequests),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, {
    fields: [swipes.swiperId],
    references: [users.id],
  }),
  swiped: one(profiles, {
    fields: [swipes.swipedId],
    references: [profiles.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1Matches",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2Matches",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [testimonials.profileId],
    references: [profiles.id],
  }),
  photoLikes: many(photoLikes),
  photoComments: many(photoComments),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reported: one(profiles, {
    fields: [reports.reportedId],
    references: [profiles.id],
  }),
}));

export const vouchRequestsRelations = relations(vouchRequests, ({ one }) => ({
  profile: one(profiles, {
    fields: [vouchRequests.profileId],
    references: [profiles.id],
  }),
  requester: one(users, {
    fields: [vouchRequests.requesterId],
    references: [users.id],
  }),
}));

export const vouchPermissionsRelations = relations(vouchPermissions, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [vouchPermissions.profileId],
    references: [profiles.id],
  }),
  match: one(matches, {
    fields: [vouchPermissions.matchId],
    references: [matches.id],
  }),
  interviews: many(voucherInterviews),
}));

export const voucherInterviewsRelations = relations(voucherInterviews, ({ one }) => ({
  permission: one(vouchPermissions, {
    fields: [voucherInterviews.permissionId],
    references: [vouchPermissions.id],
  }),
  voucher: one(testimonials, {
    fields: [voucherInterviews.voucherId],
    references: [testimonials.id],
  }),
  requester: one(users, {
    fields: [voucherInterviews.requesterUserId],
    references: [users.id],
  }),
}));

// Photo interactions tables for PopRep system
export const photoLikes = pgTable("photo_likes", {
  id: serial("id").primaryKey(),
  testimonialId: integer("testimonial_id").references(() => testimonials.id, { onDelete: "cascade" }).notNull(),
  photoIndex: integer("photo_index").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photoComments = pgTable("photo_comments", {
  id: serial("id").primaryKey(),
  testimonialId: integer("testimonial_id").references(() => testimonials.id, { onDelete: "cascade" }).notNull(),
  photoIndex: integer("photo_index").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  authorName: varchar("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photoLikesRelations = relations(photoLikes, ({ one }) => ({
  testimonial: one(testimonials, {
    fields: [photoLikes.testimonialId],
    references: [testimonials.id],
  }),
  user: one(users, {
    fields: [photoLikes.userId],
    references: [users.id],
  }),
}));

export const photoCommentsRelations = relations(photoComments, ({ one }) => ({
  testimonial: one(testimonials, {
    fields: [photoComments.testimonialId],
    references: [testimonials.id],
  }),
  user: one(users, {
    fields: [photoComments.userId],
    references: [users.id],
  }),
}));

// Notification system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'match', 'message', 'like', 'super_like', 'prop_received', 'interview_request'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional data like matchId, messageId, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced matches with more metadata
export const matchMetadata = pgTable("match_metadata", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  compatibility: real("compatibility"), // 0-1 compatibility score
  commonInterests: text("common_interests").array(),
  mutualConnections: integer("mutual_connections").default(0),
  lastInteraction: timestamp("last_interaction"),
  interactionCount: integer("interaction_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Match preferences and filters
export const matchPreferences = pgTable("match_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(99),
  maxDistance: integer("max_distance").default(50), // in km
  interestedIn: varchar("interested_in"), // 'men', 'women', 'everyone'
  preferredRelationshipType: varchar("preferred_relationship_type"), // 'serious', 'casual', 'friends', 'any'
  minimumRealRep: integer("minimum_real_rep").default(0), // 0-100
  mustHaveProps: boolean("must_have_props").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin action logs for tracking all admin/moderator activities
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'user_suspend', 'user_ban', 'content_remove', 'profile_verify', etc.
  targetType: varchar("target_type").notNull(), // 'user', 'profile', 'testimonial', 'message', 'report'
  targetId: varchar("target_id").notNull(), // ID of the affected resource
  details: jsonb("details"), // Additional context about the action
  reason: text("reason"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content moderation queue for flagged content
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type").notNull(), // 'profile', 'testimonial', 'message', 'photo'
  contentId: varchar("content_id").notNull(),
  reportedBy: varchar("reported_by").references(() => users.id),
  autoFlagged: boolean("auto_flagged").default(false), // AI/automated detection
  flagReason: varchar("flag_reason").notNull(), // 'inappropriate_content', 'spam', 'fake_profile', etc.
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").default("pending"), // 'pending', 'in_review', 'approved', 'rejected', 'escalated'
  assignedTo: varchar("assigned_to").references(() => users.id), // Moderator assigned
  moderatorNotes: text("moderator_notes"),
  contentSnapshot: jsonb("content_snapshot"), // Original content before any changes
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform settings and configurations managed by admins
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  category: varchar("category").notNull(), // 'safety', 'features', 'limits', 'notifications'
  settingKey: varchar("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  description: text("description"),
  lastModifiedBy: varchar("last_modified_by").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false), // Whether setting is visible to users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin announcements and system messages
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").default("info"), // 'info', 'warning', 'maintenance', 'feature'
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high'
  targetAudience: varchar("target_audience").default("all"), // 'all', 'verified', 'new_users', 'specific'
  targetUserIds: text("target_user_ids").array(), // Specific users if target_audience is 'specific'
  isActive: boolean("is_active").default(true),
  showUntil: timestamp("show_until"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User verification status and verification badges
export const userVerifications = pgTable("user_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationType: varchar("verification_type").notNull(), // 'identity', 'phone', 'email', 'photo', 'background'
  status: varchar("status").default("pending"), // 'pending', 'verified', 'rejected', 'expired'
  verificationData: jsonb("verification_data"), // Documents, photos, etc.
  verifiedBy: varchar("verified_by").references(() => users.id), // Admin who verified
  verificationMethod: varchar("verification_method"), // 'manual', 'automated', 'third_party'
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Circles - Special categories that daters can create and invite others to join
export const circles = pgTable("circles", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'close_friends', 'family', 'work_colleagues', 'hobby_group', 'custom'
  isPrivate: boolean("is_private").default(true),
  showMembers: boolean("show_members").default(true), // Privacy control for member visibility
  maxMembers: integer("max_members").default(50),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Circle memberships - Tracks who belongs to which circles
export const circleMemberships = pgTable("circle_memberships", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'declined'
  showFullName: boolean("show_full_name").default(false), // User preference for showing full last name in this circle
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Circle invitations - Invites to join circles
export const circleInvitations = pgTable("circle_invitations", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => circles.id),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  inviteeId: varchar("invitee_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'declined', 'expired'
  expiresAt: timestamp("expires_at"), // Invitations can expire
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Circle messages - Messages within circles for member communication
export const circleMessages = pgTable("circle_messages", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => circles.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // 'text', 'image', 'announcement'
  attachments: text("attachments").array(),
  isAnnouncement: boolean("is_announcement").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Circle activities - Track member activities and interactions within circles
export const circleActivities = pgTable("circle_activities", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => circles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type").notNull(), // 'joined', 'message', 'shared_profile', 'created_event'
  activityData: jsonb("activity_data"), // Additional data for the activity
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Circle events - Events that circle members can create and attend
export const circleEvents = pgTable("circle_events", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => circles.id),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location"),
  maxAttendees: integer("max_attendees"),
  isVirtual: boolean("is_virtual").default(false),
  meetingLink: varchar("meeting_link"),
  status: varchar("status").default("active"), // 'active', 'cancelled', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Circle event attendees - Track who's attending circle events
export const circleEventAttendees = pgTable("circle_event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => circleEvents.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("attending"), // 'attending', 'maybe', 'not_attending'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const matchMetadataRelations = relations(matchMetadata, ({ one }) => ({
  match: one(matches, {
    fields: [matchMetadata.matchId],
    references: [matches.id],
  }),
}));

export const matchPreferencesRelations = relations(matchPreferences, ({ one }) => ({
  user: one(users, {
    fields: [matchPreferences.userId],
    references: [users.id],
  }),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(users, {
    fields: [adminActions.adminId],
    references: [users.id],
  }),
}));

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  reporter: one(users, {
    fields: [moderationQueue.reportedBy],
    references: [users.id],
  }),
  assignedModerator: one(users, {
    fields: [moderationQueue.assignedTo],
    references: [users.id],
  }),
}));

export const platformSettingsRelations = relations(platformSettings, ({ one }) => ({
  lastModifier: one(users, {
    fields: [platformSettings.lastModifiedBy],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const userVerificationsRelations = relations(userVerifications, ({ one }) => ({
  user: one(users, {
    fields: [userVerifications.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [userVerifications.verifiedBy],
    references: [users.id],
  }),
}));

export const circlesRelations = relations(circles, ({ one, many }) => ({
  owner: one(users, {
    fields: [circles.ownerId],
    references: [users.id],
  }),
  memberships: many(circleMemberships),
  invitations: many(circleInvitations),
  messages: many(circleMessages),
  activities: many(circleActivities),
  events: many(circleEvents),
}));

export const circleMembershipsRelations = relations(circleMemberships, ({ one }) => ({
  circle: one(circles, {
    fields: [circleMemberships.circleId],
    references: [circles.id],
  }),
  user: one(users, {
    fields: [circleMemberships.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [circleMemberships.invitedBy],
    references: [users.id],
  }),
}));

export const circleInvitationsRelations = relations(circleInvitations, ({ one }) => ({
  circle: one(circles, {
    fields: [circleInvitations.circleId],
    references: [circles.id],
  }),
  inviter: one(users, {
    fields: [circleInvitations.inviterId],
    references: [users.id],
  }),
  invitee: one(users, {
    fields: [circleInvitations.inviteeId],
    references: [users.id],
  }),
}));

export const circleMessagesRelations = relations(circleMessages, ({ one }) => ({
  circle: one(circles, {
    fields: [circleMessages.circleId],
    references: [circles.id],
  }),
  sender: one(users, {
    fields: [circleMessages.senderId],
    references: [users.id],
  }),
}));

export const circleActivitiesRelations = relations(circleActivities, ({ one }) => ({
  circle: one(circles, {
    fields: [circleActivities.circleId],
    references: [circles.id],
  }),
  user: one(users, {
    fields: [circleActivities.userId],
    references: [users.id],
  }),
}));

export const circleEventsRelations = relations(circleEvents, ({ one, many }) => ({
  circle: one(circles, {
    fields: [circleEvents.circleId],
    references: [circles.id],
  }),
  creator: one(users, {
    fields: [circleEvents.creatorId],
    references: [users.id],
  }),
  attendees: many(circleEventAttendees),
}));

export const circleEventAttendeesRelations = relations(circleEventAttendees, ({ one }) => ({
  event: one(circleEvents, {
    fields: [circleEventAttendees.eventId],
    references: [circleEvents.id],
  }),
  user: one(users, {
    fields: [circleEventAttendees.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  approved: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const phoneVerifySchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const insertVouchRequestSchema = createInsertSchema(vouchRequests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const vouchRequestInviteSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  relationship: z.string().min(1),
  personalMessage: z.string().optional(),
});

export const vouchSubmissionSchema = z.object({
  inviteToken: z.string(),
  content: z.string().min(10),
  ratings: z.object({
    trustworthy: z.number().min(1).max(5),
    fun: z.number().min(1).max(5),
    caring: z.number().min(1).max(5),
    ambitious: z.number().min(1).max(5),
    reliable: z.number().min(1).max(5),
  }),
  // New photo sharing fields
  allowPhotoSharing: z.boolean().default(false),
  sharedPhotos: z.array(z.string().url()).optional(),
  photoDescriptions: z.array(z.string()).optional(),
});

export const insertVouchPermissionSchema = createInsertSchema(vouchPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertVoucherInterviewSchema = createInsertSchema(voucherInterviews).omit({
  id: true,
  requestedAt: true,
  completedAt: true,
});

export const voucherInterviewRequestSchema = z.object({
  matchId: z.number(),
  voucherId: z.number(),
  questions: z.array(z.string()).min(1, "At least one question is required"),
});

// Admin and moderation schemas
export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});

export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserVerificationSchema = createInsertSchema(userVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Circle schemas
export const insertCircleSchema = createInsertSchema(circles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});

export const insertCircleMembershipSchema = createInsertSchema(circleMemberships).omit({
  id: true,
  createdAt: true,
  joinedAt: true,
});

export const insertCircleInvitationSchema = createInsertSchema(circleInvitations).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertCircleMessageSchema = createInsertSchema(circleMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCircleActivitySchema = createInsertSchema(circleActivities).omit({
  id: true,
  createdAt: true,
});

export const insertCircleEventSchema = createInsertSchema(circleEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCircleEventAttendeeSchema = createInsertSchema(circleEventAttendees).omit({
  id: true,
  createdAt: true,
});

// Admin action validation schemas
export const adminActionSchema = z.object({
  action: z.enum(['user_suspend', 'user_ban', 'user_activate', 'profile_verify', 'profile_unverify', 'content_remove', 'content_restore', 'report_resolve']),
  targetType: z.enum(['user', 'profile', 'testimonial', 'message', 'report']),
  targetId: z.string(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  details: z.record(z.any()).optional(),
});

export const moderationReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'escalated']),
  moderatorNotes: z.string().optional(),
  actions: z.array(adminActionSchema).optional(),
});

export const userSuspensionSchema = z.object({
  userId: z.string(),
  duration: z.number().min(1, "Suspension duration must be at least 1 hour"), // hours
  reason: z.string().min(10, "Suspension reason must be detailed"),
  notifyUser: z.boolean().default(true),
});

export const platformSettingSchema = z.object({
  category: z.enum(['safety', 'features', 'limits', 'notifications', 'verification']),
  settingKey: z.string().min(1),
  settingValue: z.any(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: z.enum(['info', 'warning', 'maintenance', 'feature']).default('info'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  targetAudience: z.enum(['all', 'verified', 'new_users', 'specific']).default('all'),
  targetUserIds: z.array(z.string()).optional(),
  showUntil: z.string().datetime().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type PhoneVerifyData = z.infer<typeof phoneVerifySchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

// Admin and moderation types
export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type UserVerification = typeof userVerifications.$inferSelect;
export type InsertUserVerification = z.infer<typeof insertUserVerificationSchema>;

// Circle types
export type Circle = typeof circles.$inferSelect;
export type InsertCircle = z.infer<typeof insertCircleSchema>;
export type CircleMembership = typeof circleMemberships.$inferSelect;
export type InsertCircleMembership = z.infer<typeof insertCircleMembershipSchema>;
export type CircleInvitation = typeof circleInvitations.$inferSelect;
export type InsertCircleInvitation = z.infer<typeof insertCircleInvitationSchema>;
export type CircleMessage = typeof circleMessages.$inferSelect;
export type InsertCircleMessage = z.infer<typeof insertCircleMessageSchema>;
export type CircleActivity = typeof circleActivities.$inferSelect;
export type InsertCircleActivity = z.infer<typeof insertCircleActivitySchema>;
export type CircleEvent = typeof circleEvents.$inferSelect;
export type InsertCircleEvent = z.infer<typeof insertCircleEventSchema>;
export type CircleEventAttendee = typeof circleEventAttendees.$inferSelect;
export type InsertCircleEventAttendee = z.infer<typeof insertCircleEventAttendeeSchema>;

// Validation types
export type AdminActionData = z.infer<typeof adminActionSchema>;
export type ModerationReviewData = z.infer<typeof moderationReviewSchema>;
export type UserSuspensionData = z.infer<typeof userSuspensionSchema>;
export type PlatformSettingData = z.infer<typeof platformSettingSchema>;
export type AnnouncementData = z.infer<typeof announcementSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type VouchRequest = typeof vouchRequests.$inferSelect;
export type InsertVouchRequest = z.infer<typeof insertVouchRequestSchema>;
export type VouchRequestInviteData = z.infer<typeof vouchRequestInviteSchema>;
export type VouchSubmissionData = z.infer<typeof vouchSubmissionSchema>;
export type VouchPermission = typeof vouchPermissions.$inferSelect;
export type InsertVouchPermission = z.infer<typeof insertVouchPermissionSchema>;
export type VoucherInterview = typeof voucherInterviews.$inferSelect;
export type InsertVoucherInterview = z.infer<typeof insertVoucherInterviewSchema>;
export type VoucherInterviewRequestData = z.infer<typeof voucherInterviewRequestSchema>;
export const insertPhotoLikeSchema = createInsertSchema(photoLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoCommentSchema = createInsertSchema(photoComments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertMatchMetadataSchema = createInsertSchema(matchMetadata).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchPreferencesSchema = createInsertSchema(matchPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PhotoLike = typeof photoLikes.$inferSelect;
export type InsertPhotoLike = z.infer<typeof insertPhotoLikeSchema>;
export type PhotoComment = typeof photoComments.$inferSelect;
export type InsertPhotoComment = z.infer<typeof insertPhotoCommentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MatchMetadata = typeof matchMetadata.$inferSelect;
export type InsertMatchMetadata = z.infer<typeof insertMatchMetadataSchema>;
export type MatchPreferences = typeof matchPreferences.$inferSelect;
export type InsertMatchPreferences = z.infer<typeof insertMatchPreferencesSchema>;
