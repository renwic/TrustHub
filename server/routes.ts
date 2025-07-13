import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertProfileSchema,
  insertSwipeSchema,
  insertMessageSchema,
  insertTestimonialSchema,
  insertReportSchema,
  vouchRequestInviteSchema,
  vouchSubmissionSchema,
  type VouchRequestInviteData,
  type VouchSubmissionData,
} from "@shared/schema";
import { randomBytes } from "crypto";

// Utility function to extract user ID from different session structures
function getUserId(user: any): string {
  if (user.claims && user.claims.sub) {
    // Replit auth structure
    return user.claims.sub;
  } else if (user.user && user.user.id) {
    // Email/password auth structure: { user: userData, provider: "email" }
    return user.user.id;
  } else if (user.id) {
    // Direct user object (token-based auth)
    return user.id;
  } else {
    console.error("Unknown session structure:", user);
    throw new Error("No user ID found in session");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Debug route for authentication troubleshooting
  app.get('/api/auth/debug', async (req: any, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      session: req.session ? {
        id: req.session.id,
        passport: req.session.passport
      } : null,
      user: req.user ? {
        hasUser: true,
        hasClaims: !!req.user.claims,
        hasId: !!req.user.id,
        expiresAt: req.user.expires_at
      } : null,
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        userAgent: req.get('user-agent')
      }
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Auth user route - req.user:", req.user);
      const userId = getUserId(req.user);
      console.log("Extracted userId:", userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user profile if it exists
      const profile = await storage.getProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Development route to populate comprehensive profiles
  app.post('/api/dev/populate-profiles', async (req, res) => {
    try {
      const { populateComprehensiveProfiles } = await import('./populateProfiles');
      await populateComprehensiveProfiles();
      res.json({ message: "Comprehensive profiles populated successfully" });
    } catch (error) {
      console.error("Error populating profiles:", error);
      res.status(500).json({ message: "Failed to populate profiles" });
    }
  });

  // Development route to seed notifications
  app.post('/api/dev/seed-notifications', async (req, res) => {
    try {
      const { seedNotifications } = await import('./seedNotifications');
      await seedNotifications();
      res.json({ message: "Notifications seeded successfully" });
    } catch (error) {
      console.error("Error seeding notifications:", error);
      res.status(500).json({ message: "Failed to seed notifications" });
    }
  });

  // Development route to test notifications (bypasses auth)
  app.get('/api/dev/notifications', async (req, res) => {
    try {
      const userId = req.query.userId || '1';
      const notifications = await storage.getUserNotifications(userId as string);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching test notifications:", error);
      res.status(500).json({ message: "Failed to fetch test notifications" });
    }
  });

  // Development route to test profiles data
  app.get('/api/dev/profiles', async (req, res) => {
    try {
      const filters = req.query;
      const profiles = await storage.getProfilesForDiscovery("test_user", filters);
      
      // Enhance profiles with vouch data and ratings
      const enhancedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          const vouches = await storage.getProfileTestimonials(profile.id);
          const acceptedVouches = vouches.filter(v => v.approved === true);
          
          // Calculate average rating from vouches using JSON ratings
          const ratings = acceptedVouches.flatMap(v => {
            if (!v.ratings) return [];
            const r = v.ratings as any;
            return [
              r.personality,
              r.reliability, 
              r.kindness,
              r.fun,
              r.recommendation
            ].filter(rating => rating !== null && rating !== undefined);
          });
          
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : null;
          
          // Calculate trust score
          const vouchCount = acceptedVouches.length;
          const vouchScore = Math.min(vouchCount * 15, 60);
          const ratingScore = averageRating ? (averageRating / 5) * 30 : 0;
          const completenessScore = 10;
          const trustScore = Math.round(vouchScore + ratingScore + completenessScore);
          
          return {
            ...profile,
            vouchCount: acceptedVouches.length,
            rating: averageRating,
            trustScore,
            isVerified: acceptedVouches.length >= 2,
            lastActive: new Date().toISOString(),
          };
        })
      );
      
      res.json(enhancedProfiles);
    } catch (error) {
      console.error("Error fetching dev profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Profile routes
  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Profile creation request:", { userId, body: req.body });
      
      // Validate required fields
      if (!req.body.name || !req.body.age) {
        return res.status(400).json({ message: "Name and age are required" });
      }
      
      const profileData = {
        userId,
        name: req.body.name,
        age: parseInt(req.body.age),
        bio: req.body.bio || "",
        photos: req.body.photos || [],
        interests: req.body.interests || [],
        location: req.body.location || "",
        relationshipStatus: req.body.relationshipStatus || "Solo",
        height: req.body.height ? parseInt(req.body.height) : null,
        education: req.body.education || "",
        occupation: req.body.occupation || "",
        religion: req.body.religion || "",
        drinking: req.body.drinking || "",
        smoking: req.body.smoking || "",
        lookingFor: req.body.lookingFor || "",
      };
      
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      console.error("Profile creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const userId = getUserId(req.user);
      
      // Verify profile belongs to user
      const existingProfile = await storage.getProfile(userId);
      if (!existingProfile || existingProfile.id !== profileId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const profileData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(profileId, profileData);
      res.json(profile);
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const userId = getUserId(req.user);
      
      console.log("PATCH Profile Update Request:", {
        profileId,
        userId,
        bodyKeys: Object.keys(req.body),
        photosCount: req.body.photos?.length || 0,
        bodySize: JSON.stringify(req.body).length
      });
      
      // Verify profile belongs to user
      const existingProfile = await storage.getProfile(userId);
      if (!existingProfile || existingProfile.id !== profileId) {
        console.log("Profile ownership verification failed:", { existingProfile, profileId });
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const profileData = insertProfileSchema.partial().parse(req.body);
      console.log("Parsed profile data:", {
        ...profileData,
        photos: profileData.photos ? `${profileData.photos.length} photos` : 'no photos'
      });
      
      const profile = await storage.updateProfile(profileId, profileData);
      console.log("Profile updated successfully:", { profileId, photosCount: profile.photos?.length });
      
      res.json(profile);
    } catch (error: any) {
      console.error("Profile patch error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/profiles/discover', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const filters = req.query;
      const profiles = await storage.getProfilesForDiscovery(userId, filters);
      
      // Enhance profiles with vouch data and ratings
      const enhancedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          const vouches = await storage.getProfileTestimonials(profile.id);
          const acceptedVouches = vouches.filter(v => v.approved === true);
          
          // Calculate average rating from vouches using JSON ratings
          const ratings = acceptedVouches.flatMap(v => {
            if (!v.ratings) return [];
            const r = v.ratings as any;
            return [
              r.personality,
              r.reliability, 
              r.kindness,
              r.fun,
              r.recommendation
            ].filter(rating => rating !== null && rating !== undefined);
          });
          
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : null;
          
          return {
            ...profile,
            vouchCount: acceptedVouches.length,
            rating: averageRating,
            isVerified: acceptedVouches.length >= 2,
            lastActive: new Date().toISOString(), // Placeholder
          };
        })
      );
      
      res.json(enhancedProfiles);
    } catch (error) {
      console.error("Error fetching discovery profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getProfileById(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get current viewer's ID
      const viewerId = getUserId(req.user);
      
      // Include vouches with profile data
      const testimonials = await storage.getProfileTestimonials(profileId);
      
      // Get user's circles (both owned and joined)
      const userCircles = await storage.getUserCircles(profile.userId);
      
      // Filter circles based on privacy settings - only show circles where:
      // 1. The viewer is the circle owner, OR
      // 2. The circle has showMembers set to true
      const visibleCircles = await Promise.all(
        userCircles.map(async (circle) => {
          const isOwner = circle.ownerId === viewerId;
          const showMembers = circle.showMembers ?? true; // Default to true for backward compatibility
          
          // Always show the circle itself, but control member visibility
          return {
            ...circle,
            canViewMembers: isOwner || showMembers
          };
        })
      );
      
      res.json({
        ...profile,
        testimonials,
        circles: visibleCircles
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Get profile testimonials
  app.get('/api/profiles/:id/testimonials', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const vouches = await storage.getProfileTestimonials(profileId);
      res.json(vouches);
    } catch (error) {
      console.error("Error fetching vouches:", error);
      res.status(500).json({ message: "Failed to fetch vouches" });
    }
  });

  // Browse all vouches/testimonials
  app.get('/api/vouches/browse', isAuthenticated, async (req: any, res) => {
    try {
      const { relationship, sortBy } = req.query;
      
      // Get all approved testimonials with profile information
      const vouches = await storage.getAllVouchesWithProfiles(relationship, sortBy);
      
      res.json(vouches);
    } catch (error) {
      console.error("Error fetching vouches for browsing:", error);
      res.status(500).json({ message: "Failed to fetch vouches" });
    }
  });

  // Browse all props/testimonials (alias for vouches)
  app.get('/api/props/browse', isAuthenticated, async (req: any, res) => {
    try {
      const { relationship, sortBy } = req.query;
      
      // Get all approved testimonials with profile information
      const props = await storage.getAllVouchesWithProfiles(relationship, sortBy);
      
      res.json(props);
    } catch (error) {
      console.error("Error fetching props for browsing:", error);
      res.status(500).json({ message: "Failed to fetch props" });
    }
  });

  // Get users who gave props to a specific profile
  app.get('/api/profiles/:id/props-givers', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      
      // Get all users who gave testimonials/props to this profile
      const propsGivers = await storage.getPropsGivers(profileId);
      
      res.json(propsGivers);
    } catch (error) {
      console.error("Error fetching props givers:", error);
      res.status(500).json({ message: "Failed to fetch props givers" });
    }
  });

  // Update user's name preference for a specific circle
  app.patch('/api/circles/:id/name-preference', isAuthenticated, async (req: any, res) => {
    try {
      const circleId = parseInt(req.params.id);
      const userId = getUserId(req.user);
      const { showFullName } = req.body;
      
      // Update the user's name preference for this circle
      await storage.updateCircleMemberNamePreference(circleId, userId, showFullName);
      
      res.json({ message: "Name preference updated successfully" });
    } catch (error) {
      console.error("Error updating name preference:", error);
      res.status(500).json({ message: "Failed to update name preference" });
    }
  });

  // Update user's global name preference
  app.patch('/api/user/name-preference', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const { showFullName } = req.body;

      if (typeof showFullName !== 'boolean') {
        return res.status(400).json({ message: "showFullName must be a boolean" });
      }

      const updatedUser = await storage.updateUserNamePreference(userId, showFullName);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating global name preference:", error);
      res.status(500).json({ message: "Failed to update global name preference" });
    }
  });

  // Swipe routes
  app.post('/api/swipes', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      const swipeData = insertSwipeSchema.parse({ ...req.body, swiperId: userId });
      
      // Check if already swiped
      const existingSwipe = await storage.getSwipe(userId, swipeData.swipedId);
      if (existingSwipe) {
        return res.status(400).json({ message: "Already swiped on this profile" });
      }
      
      const swipe = await storage.createSwipe(swipeData);
      
      // Check for match if it's a like
      let match = null;
      if (swipeData.action === 'like') {
        // Get the swiped profile to find the owner
        const swipedProfile = await storage.getProfileById(swipeData.swipedId);
        if (swipedProfile) {
          // Check if they liked us back
          const userProfile = await storage.getProfile(userId);
          if (userProfile) {
            const reciprocalSwipe = await storage.getSwipe(swipedProfile.userId, userProfile.id);
            if (reciprocalSwipe && reciprocalSwipe.action === 'like') {
              // Create match with metadata
              const compatibility = await storage.getMatchCompatibility(userId, swipedProfile.userId);
              const commonInterests = userProfile.interests && swipedProfile.interests 
                ? userProfile.interests.filter(interest => swipedProfile.interests?.includes(interest))
                : [];
              
              const { match: newMatch, metadata } = await storage.createMatchWithMetadata(
                userId, 
                swipedProfile.userId,
                {
                  compatibility,
                  commonInterests,
                  mutualConnections: 0,
                  lastInteraction: new Date(),
                  interactionCount: 0,
                }
              );
              
              match = { ...newMatch, metadata };
              
              // Create match notifications for both users
              await storage.createNotification({
                userId: userId,
                type: 'match',
                title: 'New Connection! 🎉',
                message: `You connected with ${swipedProfile.name}! Start a conversation.`,
                data: { matchId: newMatch.id, profileId: swipedProfile.id },
                isRead: false,
              });
              
              await storage.createNotification({
                userId: swipedProfile.userId,
                type: 'match',
                title: 'New Connection! 🎉',
                message: `You connected with ${userProfile.name}! Start a conversation.`,
                data: { matchId: newMatch.id, profileId: userProfile.id },
                isRead: false,
              });
            }
          }
        }
      }
      
      res.json({ swipe, match });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Message routes
  app.get('/api/matches/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const matchId = parseInt(req.params.id);
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      // Verify user is part of this match
      const match = await storage.getMatch(matchId);
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const messages = await storage.getMatchMessages(matchId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(matchId, userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/matches/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const matchId = parseInt(req.params.id);
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      // Verify user is part of this match
      const match = await storage.getMatch(matchId);
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        matchId,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message,
            matchId,
          }));
        }
      });
      
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Vouch request routes
  app.post("/api/vouch-requests", isAuthenticated, async (req: any, res) => {
    try {
      const data = vouchRequestInviteSchema.parse(req.body);
      const userId = req.user?.claims?.sub || req.user?.id;
      
      // Get user's profile
      let profile = await storage.getProfile(userId);
      
      // If user doesn't have a profile, create one automatically
      if (!profile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        profile = await storage.createProfile({
          userId: userId,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Anonymous',
          age: 25,
          bio: "New user exploring connections on Heartlink",
          location: "San Francisco, CA",
          photos: [],
          interests: ["music", "travel", "food"],
          relationshipStatus: "single",
          height: "5'8\"",
          education: "University Graduate",
          occupation: "Professional",
        });
      }

      // Generate unique invite token
      const inviteToken = randomBytes(32).toString('hex');
      
      // Set expiration to 30 days from now
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const vouchRequest = await storage.createVouchRequest({
        profileId: profile.id,
        requesterId: userId,
        inviteToken,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        relationship: data.relationship,
        personalMessage: data.personalMessage,
        expiresAt,
      });

      res.json({ 
        vouchRequest,
        shareUrl: `${req.protocol}://${req.get('host')}/vouch/${inviteToken}`
      });
    } catch (error) {
      console.error("Error creating vouch request:", error);
      res.status(500).json({ message: "Failed to create vouch request" });
    }
  });

  app.get("/api/vouch-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      let profile = await storage.getProfile(userId);
      
      // If user doesn't have a profile, create one automatically
      if (!profile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        profile = await storage.createProfile({
          userId: userId,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Anonymous',
          age: 25,
          bio: "New user exploring connections on Heartlink",
          location: "San Francisco, CA",
          photos: [],
          interests: ["music", "travel", "food"],
          relationshipStatus: "single",
          height: "5'8\"",
          education: "University Graduate",
          occupation: "Professional",
        });
      }

      const vouchRequests = await storage.getVouchRequestsByProfileId(profile.id);
      res.json(vouchRequests);
    } catch (error) {
      console.error("Error fetching vouch requests:", error);
      res.status(500).json({ message: "Failed to fetch vouch requests" });
    }
  });

  app.get("/api/vouch-invite/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const vouchRequest = await storage.getVouchRequest(token);
      
      if (!vouchRequest || vouchRequest.status !== 'pending' || new Date() > vouchRequest.expiresAt) {
        return res.status(404).json({ message: "Invalid or expired invite" });
      }

      const profile = await storage.getProfileById(vouchRequest.profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json({
        vouchRequest: {
          recipientName: vouchRequest.recipientName,
          relationship: vouchRequest.relationship,
          personalMessage: vouchRequest.personalMessage,
        },
        profile: {
          name: profile.name,
          photos: profile.photos || [],
        }
      });
    } catch (error) {
      console.error("Error fetching vouch invite:", error);
      res.status(500).json({ message: "Failed to fetch vouch invite" });
    }
  });

  app.post("/api/vouch-submit", async (req, res) => {
    try {
      const data = vouchSubmissionSchema.parse(req.body);
      const vouchRequest = await storage.getVouchRequest(data.inviteToken);
      
      if (!vouchRequest || vouchRequest.status !== 'pending' || new Date() > vouchRequest.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired invite" });
      }

      // Create the testimonial with photo sharing support
      await storage.createTestimonial({
        profileId: vouchRequest.profileId,
        authorName: vouchRequest.recipientName,
        authorEmail: vouchRequest.recipientEmail,
        relationship: vouchRequest.relationship,
        content: data.content,
        ratings: data.ratings,
        approved: true, // Auto-approve vouches from invite system
        allowPhotoSharing: data.allowPhotoSharing || false,
        sharedPhotos: data.sharedPhotos || [],
        photoDescriptions: data.photoDescriptions || [],
      });

      // Update vouch request status
      await storage.updateVouchRequestStatus(data.inviteToken, 'accepted');

      res.json({ message: "Vouch submitted successfully" });
    } catch (error) {
      console.error("Error submitting vouch:", error);
      res.status(500).json({ message: "Failed to submit vouch" });
    }
  });

  // Vouch routes (testimonials)
  app.post('/api/testimonials', async (req, res) => {
    try {
      const vouchData = insertTestimonialSchema.parse(req.body);
      const vouch = await storage.createTestimonial(vouchData);
      res.json(vouch);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/testimonials/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const vouchId = parseInt(req.params.id);
      await storage.approveTestimonial(vouchId);
      res.json({ message: "Vouch approved" });
    } catch (error) {
      console.error("Error approving vouch:", error);
      res.status(500).json({ message: "Failed to approve vouch" });
    }
  });

  // Voucher permission routes
  app.post('/api/vouch-permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { matchId } = req.body;
      
      // Get user's profile
      let profile = await storage.getProfile(userId);
      if (!profile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        profile = await storage.createProfile({
          userId: userId,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Anonymous',
          age: 25,
          bio: "New user exploring connections on Heartlink",
          location: "San Francisco, CA",
          photos: [],
          interests: ["music", "travel", "food"],
          relationshipStatus: "single",
          height: "5'8\"",
          education: "University Graduate",
          occupation: "Professional",
        });
      }

      // Check if permission already exists
      const existingPermission = await storage.getVouchPermission(profile.id, matchId);
      if (existingPermission) {
        return res.json(existingPermission);
      }

      // Create new permission
      const permission = await storage.createVouchPermission({
        profileId: profile.id,
        matchId,
        isActive: true,
      });

      res.json(permission);
    } catch (error) {
      console.error("Error creating vouch permission:", error);
      res.status(500).json({ message: "Failed to create vouch permission" });
    }
  });

  app.get('/api/vouch-permissions/:profileId', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const permissions = await storage.getVouchPermissionsByProfile(profileId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching vouch permissions:", error);
      res.status(500).json({ message: "Failed to fetch vouch permissions" });
    }
  });

  app.delete('/api/vouch-permissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const permissionId = parseInt(req.params.id);
      await storage.revokeVouchPermission(permissionId);
      res.json({ message: "Vouch permission revoked" });
    } catch (error) {
      console.error("Error revoking vouch permission:", error);
      res.status(500).json({ message: "Failed to revoke vouch permission" });
    }
  });

  // Voucher interview routes
  app.post('/api/voucher-interviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const { matchId, voucherId, questions } = req.body;
      
      // Verify user has permission for this match
      let profile = await storage.getProfile(userId);
      if (!profile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        profile = await storage.createProfile({
          userId: userId,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Anonymous',
          age: 25,
          bio: "New user exploring connections on Heartlink",
          location: "San Francisco, CA",
          photos: [],
          interests: ["music", "travel", "food"],
          relationshipStatus: "single",
          height: "5'8\"",
          education: "University Graduate",
          occupation: "Professional",
        });
      }

      // Get the other user's profile from the match
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const otherProfile = await storage.getProfile(otherUserId);
      if (!otherProfile) {
        return res.status(404).json({ message: "Other user profile not found" });
      }

      // Check if permission exists
      const permission = await storage.getVouchPermission(otherProfile.id, matchId);
      if (!permission) {
        return res.status(403).json({ message: "No permission to interview vouchers for this match" });
      }

      // Create voucher interview
      const interview = await storage.createVoucherInterview({
        permissionId: permission.id,
        voucherId,
        requesterUserId: userId,
        questions,
        responses: [],
        status: "pending",
      });

      res.json(interview);
    } catch (error) {
      console.error("Error creating voucher interview:", error);
      res.status(500).json({ message: "Failed to create voucher interview" });
    }
  });

  app.get('/api/voucher-interviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      
      // Get all interviews where user is the requester
      // Note: This is a simplified version - in a full implementation,
      // you'd need to join tables to get interviews by requester
      const interviews = []; // Placeholder for now
      
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching voucher interviews:", error);
      res.status(500).json({ message: "Failed to fetch voucher interviews" });
    }
  });

  app.put('/api/voucher-interviews/:id/respond', async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const { responses } = req.body;
      
      await storage.updateVoucherInterviewStatus(interviewId, 'completed', responses);
      
      res.json({ message: "Interview response submitted successfully" });
    } catch (error) {
      console.error("Error submitting interview response:", error);
      res.status(500).json({ message: "Failed to submit interview response" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reportData = insertReportSchema.parse({ ...req.body, reporterId: userId });
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Encourage props route
  app.post('/api/encourage-props', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const { profileId } = req.body;
      
      // Get the target profile by ID
      const targetProfile = await storage.getProfileById(profileId);
      
      if (!targetProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Prevent users from encouraging props for their own profile
      if (targetProfile.userId === userId) {
        return res.status(400).json({ message: "You cannot encourage props for your own profile" });
      }
      
      // Get the encouraging user's profile for the notification
      let encouragingProfile = await storage.getProfile(userId);
      if (!encouragingProfile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // Create a basic profile for new users
        encouragingProfile = await storage.createProfile({
          userId: userId,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Someone',
          age: 25,
          bio: "New user exploring connections on Heartlink",
          location: "San Francisco, CA",
          photos: [],
          interests: ["music", "travel", "food"],
          relationshipStatus: "single",
          height: "5'8\"",
          education: "University Graduate",
          occupation: "Professional",
        });
      }
      
      // Create notification for the target user
      const notification = await storage.createNotification({
        userId: targetProfile.userId,
        type: 'props_encouragement',
        title: 'Someone Thinks You Should Get Props!',
        message: `${encouragingProfile.name} suggests you ask friends and family to give you props. Props help build trust and show your authentic character to potential matches.`,
        data: { 
          encouragingUserId: userId,
          encouragingProfileId: encouragingProfile.id,
          encouragingUserName: encouragingProfile.name
        },
        isRead: false
      });
      
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Error creating encourage props notification:", error);
      res.status(500).json({ message: "Failed to send encouragement" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getUserNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/count', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Enhanced match routes
  app.get('/api/matches/enhanced', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const matches = await storage.getEnhancedMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching enhanced matches:", error);
      res.status(500).json({ message: "Failed to fetch enhanced matches" });
    }
  });

  app.post('/api/matches/:id/metadata', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const metadata = req.body;
      const updated = await storage.updateMatchMetadata(parseInt(id), metadata);
      res.json(updated);
    } catch (error) {
      console.error("Error updating match metadata:", error);
      res.status(500).json({ message: "Failed to update match metadata" });
    }
  });

  // Recommended matches based on preferences
  app.get('/api/matches/recommended', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const limit = parseInt(req.query.limit as string) || 20;
      const recommendedProfiles = await storage.getRecommendedMatches(userId, limit);
      
      // Enhance profiles with additional data
      const enhancedProfiles = await Promise.all(
        recommendedProfiles.map(async (profile) => {
          const vouches = await storage.getProfileTestimonials(profile.id);
          const acceptedVouches = vouches.filter(v => v.approved === true);
          
          // Calculate average rating
          const ratings = acceptedVouches.flatMap(v => {
            if (!v.ratings) return [];
            const r = v.ratings as any;
            return [r.personality, r.reliability, r.kindness, r.fun, r.recommendation]
              .filter(rating => rating !== null && rating !== undefined);
          });
          
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : null;
          
          // Calculate compatibility with current user
          const compatibility = await storage.getMatchCompatibility(userId, profile.userId);
          
          return {
            ...profile,
            vouchCount: acceptedVouches.length,
            rating: averageRating,
            compatibility,
            isVerified: acceptedVouches.length >= 2,
            lastActive: new Date().toISOString(),
          };
        })
      );
      
      res.json(enhancedProfiles);
    } catch (error) {
      console.error("Error fetching recommended matches:", error);
      res.status(500).json({ message: "Failed to fetch recommended matches" });
    }
  });

  // Match preferences routes
  app.get('/api/preferences/match', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const preferences = await storage.getMatchPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching match preferences:", error);
      res.status(500).json({ message: "Failed to fetch match preferences" });
    }
  });

  app.post('/api/preferences/match', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const preferences = { ...req.body, userId };
      
      const existing = await storage.getMatchPreferences(userId);
      if (existing) {
        const updated = await storage.updateMatchPreferences(userId, req.body);
        res.json(updated);
      } else {
        const created = await storage.createMatchPreferences(preferences);
        res.json(created);
      }
    } catch (error) {
      console.error("Error saving match preferences:", error);
      res.status(500).json({ message: "Failed to save match preferences" });
    }
  });

  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        // Replit auth structure
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        // Email/password auth structure
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      const limit = parseInt(req.query.limit as string) || 20;
      const recommendations = await storage.getRecommendedMatches(userId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  
  // Photo interaction routes for PopRep system
  app.post('/api/photos/:testimonialId/:photoIndex/like', isAuthenticated, async (req: any, res) => {
    try {
      const { testimonialId, photoIndex } = req.params;
      const userId = req.user.claims?.sub || req.user.id;

      // Check if user already liked this photo
      const existingLike = await storage.getUserPhotoLike(
        parseInt(testimonialId),
        parseInt(photoIndex),
        userId
      );

      if (existingLike) {
        // Unlike
        await storage.removePhotoLike(parseInt(testimonialId), parseInt(photoIndex), userId);
        res.json({ liked: false });
      } else {
        // Like
        await storage.createPhotoLike({
          testimonialId: parseInt(testimonialId),
          photoIndex: parseInt(photoIndex),
          userId,
        });
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling photo like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get('/api/photos/:testimonialId/:photoIndex/likes', async (req, res) => {
    try {
      const { testimonialId, photoIndex } = req.params;
      const likes = await storage.getPhotoLikes(parseInt(testimonialId), parseInt(photoIndex));
      res.json(likes);
    } catch (error) {
      console.error("Error fetching photo likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.post('/api/photos/:testimonialId/:photoIndex/comment', isAuthenticated, async (req: any, res) => {
    try {
      const { testimonialId, photoIndex } = req.params;
      const { content } = req.body;
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      const comment = await storage.createPhotoComment({
        testimonialId: parseInt(testimonialId),
        photoIndex: parseInt(photoIndex),
        userId,
        authorName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
        content: content.trim(),
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating photo comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/photos/:testimonialId/:photoIndex/comments', async (req, res) => {
    try {
      const { testimonialId, photoIndex } = req.params;
      const comments = await storage.getPhotoComments(parseInt(testimonialId), parseInt(photoIndex));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching photo comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // PopRep score route
  app.get('/api/profiles/:id/poprep', async (req, res) => {
    try {
      const { id } = req.params;
      const popRep = await storage.getProfilePopRep(parseInt(id));
      res.json(popRep);
    } catch (error) {
      console.error("Error fetching PopRep:", error);
      res.status(500).json({ message: "Failed to fetch PopRep" });
    }
  });

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Handle different message types if needed
        console.log('Received WebSocket message:', message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Relationship stage management routes
  app.get('/api/relationship-stages', isAuthenticated, async (req: any, res) => {
    try {
      const stages = [
        { 
          stage: "Solo", 
          description: "Single, not actively dating anyone",
          level: 1,
          icon: "👤"
        },
        { 
          stage: "Explorers", 
          description: "Casually exploring connections, open to meeting new people",
          level: 2,
          icon: "🔍"
        },
        { 
          stage: "Potentials", 
          description: "Interested in specific people, getting to know them better",
          level: 3,
          icon: "💭"
        },
        { 
          stage: "Warm Sparks", 
          description: "Strong mutual interest, regular communication and connection",
          level: 4,
          icon: "⚡"
        },
        { 
          stage: "On Deck", 
          description: "Serious consideration, exploring deeper commitment",
          level: 5,
          icon: "🎯"
        },
        { 
          stage: "Committed", 
          description: "Exclusive relationship, committed partnership",
          level: 6,
          icon: "💍"
        },
        { 
          stage: "Archived", 
          description: "Past connections, no longer active",
          level: 7,
          icon: "📁"
        }
      ];
      res.json(stages);
    } catch (error) {
      console.error("Error fetching relationship stages:", error);
      res.status(500).json({ message: "Failed to fetch relationship stages" });
    }
  });

  app.patch('/api/profiles/:id/relationship-stage', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const { relationshipStatus } = req.body;
      
      // Handle different session structures
      let userId: string;
      if (req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      } else if (req.user.id) {
        userId = req.user.id;
      } else {
        throw new Error("No user ID found in session");
      }
      
      // Verify profile belongs to user
      const profile = await storage.getProfile(userId);
      if (!profile || profile.id !== profileId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Validate relationship status
      const validStages = ["Solo", "Explorers", "Potentials", "Warm Sparks", "On Deck", "Committed", "Archived"];
      if (!validStages.includes(relationshipStatus)) {
        return res.status(400).json({ message: "Invalid relationship status" });
      }
      
      const updatedProfile = await storage.updateProfile(profileId, { relationshipStatus });
      
      // Create notification for stage change (optional)
      if (profile.relationshipStatus !== relationshipStatus) {
        await storage.createNotification({
          userId: userId,
          type: 'profile_update',
          title: 'Relationship Status Updated',
          message: `Your relationship status changed to ${relationshipStatus}`,
          data: { previousStage: profile.relationshipStatus, newStage: relationshipStatus },
          isRead: false,
        });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating relationship stage:", error);
      res.status(500).json({ message: "Failed to update relationship stage" });
    }
  });

  // ===== ADMIN AND MODERATION API ROUTES =====

  // Middleware to check admin/moderator permissions
  const requireAdminRole = (requiredRole: 'moderator' | 'administrator') => {
    return async (req: any, res: any, next: any) => {
      try {
        const userId = req.user?.claims?.sub || req.user?.id;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const userRole = user.role;
        if (requiredRole === 'moderator' && !['moderator', 'administrator'].includes(userRole)) {
          return res.status(403).json({ message: "Moderator access required" });
        }
        
        if (requiredRole === 'administrator' && userRole !== 'administrator') {
          return res.status(403).json({ message: "Administrator access required" });
        }

        req.adminUser = user;
        next();
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        res.status(500).json({ message: "Failed to verify permissions" });
      }
    };
  };

  // Admin dashboard and analytics
  app.get('/api/admin/dashboard', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/admin/analytics/users', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const userGrowth = await storage.getUserGrowthStats(days);
      res.json(userGrowth);
    } catch (error) {
      console.error("Error fetching user growth analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get('/api/admin/analytics/moderation', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const moderationStats = await storage.getContentModerationStats(days);
      res.json(moderationStats);
    } catch (error) {
      console.error("Error fetching moderation analytics:", error);
      res.status(500).json({ message: "Failed to fetch moderation analytics" });
    }
  });

  // User management routes
  app.get('/api/admin/users', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const filters = {
        role: req.query.role as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        isSuspended: req.query.isSuspended ? req.query.isSuspended === 'true' : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };
      
      const result = await storage.getUsersWithFilters(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:userId/role', isAuthenticated, requireAdminRole('administrator'), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role, permissions } = req.body;
      const adminId = req.adminUser.id;

      const updatedUser = await storage.updateUserRole(userId, role, permissions);
      
      // Log the action
      await storage.logAdminAction({
        adminId,
        action: 'user_role_change',
        targetType: 'user',
        targetId: userId,
        reason: `Role changed to ${role}`,
        details: { previousRole: updatedUser.role, newRole: role, permissions }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/admin/users/:userId/suspend', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { duration, reason } = req.body;
      const adminId = req.adminUser.id;

      if (!duration || !reason) {
        return res.status(400).json({ message: "Duration and reason are required" });
      }

      const suspendedUser = await storage.suspendUser(userId, duration, reason, adminId);
      res.json(suspendedUser);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.post('/api/admin/users/:userId/reactivate', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const adminId = req.adminUser.id;

      const reactivatedUser = await storage.reactivateUser(userId, adminId);
      res.json(reactivatedUser);
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(500).json({ message: "Failed to reactivate user" });
    }
  });

  // Admin action logging
  app.get('/api/admin/actions', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const filters = {
        adminId: req.query.adminId as string,
        action: req.query.action as string,
        targetType: req.query.targetType as string,
        targetId: req.query.targetId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await storage.getAdminActions(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
      res.status(500).json({ message: "Failed to fetch admin actions" });
    }
  });

  // Content moderation routes
  app.get('/api/admin/moderation/queue', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        contentType: req.query.contentType as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await storage.getModerationQueue(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.post('/api/admin/moderation/queue', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const moderationItem = req.body;
      const adminId = req.adminUser.id;

      const item = await storage.addToModerationQueue({
        ...moderationItem,
        flaggedBy: adminId
      });

      res.json(item);
    } catch (error) {
      console.error("Error adding to moderation queue:", error);
      res.status(500).json({ message: "Failed to add to moderation queue" });
    }
  });

  app.patch('/api/admin/moderation/:itemId/assign', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const { moderatorId } = req.body;
      const adminId = req.adminUser.id;

      const assignedItem = await storage.assignModerationItem(parseInt(itemId), moderatorId || adminId);
      res.json(assignedItem);
    } catch (error) {
      console.error("Error assigning moderation item:", error);
      res.status(500).json({ message: "Failed to assign moderation item" });
    }
  });

  app.patch('/api/admin/moderation/:itemId/resolve', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const { status, notes } = req.body;
      const adminId = req.adminUser.id;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const resolvedItem = await storage.resolveModerationItem(parseInt(itemId), status, notes, adminId);
      res.json(resolvedItem);
    } catch (error) {
      console.error("Error resolving moderation item:", error);
      res.status(500).json({ message: "Failed to resolve moderation item" });
    }
  });

  // Platform settings routes
  app.get('/api/admin/settings', isAuthenticated, requireAdminRole('administrator'), async (req: any, res) => {
    try {
      const category = req.query.category as string;
      const settings = await storage.getPlatformSettings(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, requireAdminRole('administrator'), async (req: any, res) => {
    try {
      const setting = req.body;
      const adminId = req.adminUser.id;

      const newSetting = await storage.createPlatformSetting({
        ...setting,
        lastModifiedBy: adminId
      });

      res.json(newSetting);
    } catch (error) {
      console.error("Error creating platform setting:", error);
      res.status(500).json({ message: "Failed to create platform setting" });
    }
  });

  app.patch('/api/admin/settings/:settingKey', isAuthenticated, requireAdminRole('administrator'), async (req: any, res) => {
    try {
      const { settingKey } = req.params;
      const { settingValue, description } = req.body;
      const adminId = req.adminUser.id;

      const updatedSetting = await storage.updatePlatformSetting(settingKey, settingValue, adminId, description);
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating platform setting:", error);
      res.status(500).json({ message: "Failed to update platform setting" });
    }
  });

  // Announcements routes
  app.get('/api/admin/announcements', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const filters = {
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        type: req.query.type as string,
        targetAudience: req.query.targetAudience as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await storage.getAnnouncements(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/admin/announcements', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const announcement = req.body;
      const adminId = req.adminUser.id;

      const newAnnouncement = await storage.createAnnouncement({
        ...announcement,
        createdBy: adminId
      });

      res.json(newAnnouncement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/admin/announcements/:id', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedAnnouncement = await storage.updateAnnouncement(parseInt(id), updates);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/admin/announcements/:id', isAuthenticated, requireAdminRole('administrator'), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnnouncement(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // User verification routes
  app.get('/api/admin/verifications', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        verificationType: req.query.verificationType as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await storage.getVerificationQueue(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching verification queue:", error);
      res.status(500).json({ message: "Failed to fetch verification queue" });
    }
  });

  app.post('/api/admin/verifications', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const verification = req.body;
      const newVerification = await storage.createUserVerification(verification);
      res.json(newVerification);
    } catch (error) {
      console.error("Error creating user verification:", error);
      res.status(500).json({ message: "Failed to create user verification" });
    }
  });

  app.patch('/api/admin/verifications/:id/status', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminId = req.adminUser.id;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedVerification = await storage.updateVerificationStatus(parseInt(id), status, adminId, notes);
      res.json(updatedVerification);
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  app.get('/api/admin/users/:userId/verifications', isAuthenticated, requireAdminRole('moderator'), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const verifications = await storage.getUserVerifications(userId);
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching user verifications:", error);
      res.status(500).json({ message: "Failed to fetch user verifications" });
    }
  });

  // Circle management routes
  app.post('/api/circles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const { name, description, category, isPrivate } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Circle name is required" });
      }

      const circle = await storage.createCircle({
        name,
        description,
        category: category || 'general',
        isPrivate: isPrivate || false,
        ownerId: userId,
        memberCount: 0 // No members initially, owner is separate
      });

      res.json(circle);
    } catch (error) {
      console.error("Error creating circle:", error);
      res.status(500).json({ message: "Failed to create circle" });
    }
  });

  app.get('/api/circles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const circles = await storage.getUserCircles(userId);
      res.json(circles);
    } catch (error) {
      console.error("Error fetching circles:", error);
      res.status(500).json({ message: "Failed to fetch circles" });
    }
  });

  app.get('/api/circles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const circle = await storage.getCircleById(parseInt(id));
      
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      res.json(circle);
    } catch (error) {
      console.error("Error fetching circle:", error);
      res.status(500).json({ message: "Failed to fetch circle" });
    }
  });

  app.patch('/api/circles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const updates = req.body;

      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only the circle creator can update this circle" });
      }

      const updatedCircle = await storage.updateCircle(parseInt(id), updates);
      res.json(updatedCircle);
    } catch (error) {
      console.error("Error updating circle:", error);
      res.status(500).json({ message: "Failed to update circle" });
    }
  });

  app.delete('/api/circles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);

      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only the circle creator can delete this circle" });
      }

      await storage.deleteCircle(parseInt(id));
      res.json({ message: "Circle deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle:", error);
      res.status(500).json({ message: "Failed to delete circle" });
    }
  });

  // Public circle access routes (for viewing circles from profiles)
  app.get('/api/circles/:id/public', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const circle = await storage.getCircleById(parseInt(id));
      
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // Only allow access to public circles that show members
      if (circle.isPrivate || circle.showMembers === false) {
        return res.status(403).json({ message: "Circle is not publicly accessible" });
      }

      // Return circle with privacy information
      res.json({
        ...circle,
        canViewMembers: circle.showMembers !== false
      });
    } catch (error) {
      console.error("Error fetching public circle:", error);
      res.status(500).json({ message: "Failed to fetch public circle" });
    }
  });

  // Circle invitation routes
  app.post('/api/circles/:id/invitations', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const { inviteeId, message } = req.body;

      if (!inviteeId) {
        return res.status(400).json({ message: "Invitee ID is required" });
      }

      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only the circle creator can send invitations" });
      }

      const invitation = await storage.createCircleInvitation({
        circleId: parseInt(id),
        inviterId: userId,
        inviteeId,
        message: message || `You've been invited to join the circle "${circle.name}"`,
        status: 'pending'
      });

      // Create notification for the invitee
      await storage.createNotification({
        userId: inviteeId,
        type: 'circle_invitation',
        title: 'Circle Invitation',
        message: `You've been invited to join "${circle.name}"`,
        isRead: false,
        metadata: JSON.stringify({ 
          circleId: circle.id, 
          circleName: circle.name,
          inviterId: userId,
          invitationId: invitation.id
        })
      });

      res.json(invitation);
    } catch (error) {
      console.error("Error creating circle invitation:", error);
      res.status(500).json({ message: "Failed to create circle invitation" });
    }
  });

  app.get('/api/circle-invitations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const status = req.query.status as string;
      const invitations = await storage.getUserCircleInvitations(userId, status);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching circle invitations:", error);
      res.status(500).json({ message: "Failed to fetch circle invitations" });
    }
  });

  app.patch('/api/circle-invitations/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const { status } = req.body; // 'accepted' or 'rejected'

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
      }

      const invitation = await storage.getCircleInvitation(parseInt(id));
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      if (invitation.inviteeId !== userId) {
        return res.status(403).json({ message: "You can only respond to your own invitations" });
      }

      if (invitation.status !== 'pending') {
        return res.status(400).json({ message: "This invitation has already been responded to" });
      }

      const updatedInvitation = await storage.respondToCircleInvitation(parseInt(id), status);

      // If accepted, add user to circle
      if (status === 'accepted') {
        await storage.addCircleMember({
          circleId: invitation.circleId,
          userId,
          invitedBy: invitation.inviterId,
          status: 'accepted'
        });

        // Notify circle creator
        await storage.createNotification({
          userId: invitation.inviterId,
          type: 'circle_invitation_accepted',
          title: 'Circle Invitation Accepted',
          message: `Your circle invitation was accepted`,
          isRead: false,
          metadata: JSON.stringify({ 
            circleId: invitation.circleId,
            acceptedBy: userId
          })
        });
      }

      res.json(updatedInvitation);
    } catch (error) {
      console.error("Error responding to circle invitation:", error);
      res.status(500).json({ message: "Failed to respond to circle invitation" });
    }
  });

  // Circle membership routes
  app.get('/api/circles/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getCircleMembers(parseInt(id));
      res.json(members);
    } catch (error) {
      console.error("Error fetching circle members:", error);
      res.status(500).json({ message: "Failed to fetch circle members" });
    }
  });

  app.delete('/api/circles/:id/members/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { id, userId: targetUserId } = req.params;
      const userId = getUserId(req.user);

      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // Only circle creator can remove members, or users can remove themselves
      if (circle.ownerId !== userId && targetUserId !== userId) {
        return res.status(403).json({ message: "You don't have permission to remove this member" });
      }

      await storage.removeCircleMember(parseInt(id), targetUserId);
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing circle member:", error);
      res.status(500).json({ message: "Failed to remove circle member" });
    }
  });

  app.get('/api/my-circles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      
      // Get all circles where user is a member (including owned circles since owners are now members)
      const memberships = await storage.getUserCircleMemberships(userId);
      res.json(memberships);
    } catch (error) {
      console.error("Error fetching user circle memberships:", error);
      res.status(500).json({ message: "Failed to fetch user circle memberships" });
    }
  });

  // Get profile by user ID
  app.get('/api/profiles/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile by user ID:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Circle messages routes
  app.get('/api/circles/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const limit = parseInt(req.query.limit as string) || 50;

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to view messages" });
        }
      }

      const messages = await storage.getCircleMessages(parseInt(id), limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching circle messages:", error);
      res.status(500).json({ message: "Failed to fetch circle messages" });
    }
  });

  app.post('/api/circles/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const { message, messageType = 'text', attachments, isAnnouncement = false } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to send messages" });
        }
      }

      const newMessage = await storage.createCircleMessage({
        circleId: parseInt(id),
        senderId: userId,
        message,
        messageType,
        attachments,
        isAnnouncement
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error creating circle message:", error);
      res.status(500).json({ message: "Failed to create circle message" });
    }
  });

  app.delete('/api/circles/:id/messages/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const { id, messageId } = req.params;
      const userId = getUserId(req.user);

      // Check if user is circle owner or message sender
      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // For now, only circle owners can delete messages (could expand to message senders)
      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only circle owners can delete messages" });
      }

      await storage.deleteCircleMessage(parseInt(messageId));
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle message:", error);
      res.status(500).json({ message: "Failed to delete circle message" });
    }
  });

  // Circle activities routes
  app.get('/api/circles/:id/activities', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const limit = parseInt(req.query.limit as string) || 20;

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to view activities" });
        }
      }

      const activities = await storage.getCircleActivities(parseInt(id), limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching circle activities:", error);
      res.status(500).json({ message: "Failed to fetch circle activities" });
    }
  });

  // Circle events routes
  app.get('/api/circles/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to view events" });
        }
      }

      const events = await storage.getCircleEvents(parseInt(id));
      res.json(events);
    } catch (error) {
      console.error("Error fetching circle events:", error);
      res.status(500).json({ message: "Failed to fetch circle events" });
    }
  });

  app.post('/api/circles/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);
      const { title, description, eventDate, location, maxAttendees, isVirtual, meetingLink } = req.body;

      if (!title || !eventDate) {
        return res.status(400).json({ message: "Title and event date are required" });
      }

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to create events" });
        }
      }

      const event = await storage.createCircleEvent({
        circleId: parseInt(id),
        creatorId: userId,
        title,
        description,
        eventDate: new Date(eventDate),
        location,
        maxAttendees,
        isVirtual,
        meetingLink
      });

      res.json(event);
    } catch (error) {
      console.error("Error creating circle event:", error);
      res.status(500).json({ message: "Failed to create circle event" });
    }
  });

  app.patch('/api/circles/:id/events/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { id, eventId } = req.params;
      const userId = getUserId(req.user);
      const updates = req.body;

      // Check if user is circle owner or event creator
      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // For now, only circle owners can edit events (could expand to event creators)
      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only circle owners can edit events" });
      }

      const updatedEvent = await storage.updateCircleEvent(parseInt(eventId), updates);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating circle event:", error);
      res.status(500).json({ message: "Failed to update circle event" });
    }
  });

  app.delete('/api/circles/:id/events/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const { id, eventId } = req.params;
      const userId = getUserId(req.user);

      // Check if user is circle owner or event creator
      const circle = await storage.getCircleById(parseInt(id));
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // For now, only circle owners can delete events
      if (circle.ownerId !== userId) {
        return res.status(403).json({ message: "Only circle owners can delete events" });
      }

      await storage.deleteCircleEvent(parseInt(eventId));
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle event:", error);
      res.status(500).json({ message: "Failed to delete circle event" });
    }
  });

  // Event attendee routes
  app.get('/api/events/:eventId/attendees', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const attendees = await storage.getEventAttendees(parseInt(eventId));
      res.json(attendees);
    } catch (error) {
      console.error("Error fetching event attendees:", error);
      res.status(500).json({ message: "Failed to fetch event attendees" });
    }
  });

  app.post('/api/events/:eventId/attend', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = getUserId(req.user);
      const { status = 'attending' } = req.body;

      const attendee = await storage.addEventAttendee({
        eventId: parseInt(eventId),
        userId,
        status
      });

      res.json(attendee);
    } catch (error) {
      console.error("Error adding event attendee:", error);
      res.status(500).json({ message: "Failed to add event attendee" });
    }
  });

  app.patch('/api/events/:eventId/attend', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = getUserId(req.user);
      const { status } = req.body;

      if (!['attending', 'maybe', 'not_attending'].includes(status)) {
        return res.status(400).json({ message: "Invalid attendance status" });
      }

      const updatedAttendee = await storage.updateEventAttendeeStatus(parseInt(eventId), userId, status);
      res.json(updatedAttendee);
    } catch (error) {
      console.error("Error updating event attendance:", error);
      res.status(500).json({ message: "Failed to update event attendance" });
    }
  });

  app.delete('/api/events/:eventId/attend', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = getUserId(req.user);

      await storage.removeEventAttendee(parseInt(eventId), userId);
      res.json({ message: "Removed from event attendees" });
    } catch (error) {
      console.error("Error removing event attendee:", error);
      res.status(500).json({ message: "Failed to remove event attendee" });
    }
  });

  // Get circle with full member interaction data
  app.get('/api/circles/:id/full', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req.user);

      // Check if user is member of circle
      const isMember = await storage.isCircleMember(parseInt(id), userId);
      if (!isMember) {
        // Also check if user is the circle owner
        const circle = await storage.getCircleById(parseInt(id));
        if (!circle || circle.ownerId !== userId) {
          return res.status(403).json({ message: "You must be a member of this circle to view its details" });
        }
      }

      const fullCircle = await storage.getCircleWithMembers(parseInt(id));
      res.json(fullCircle);
    } catch (error) {
      console.error("Error fetching full circle data:", error);
      res.status(500).json({ message: "Failed to fetch full circle data" });
    }
  });

  // Get direct message conversation between two users
  app.get('/api/direct-messages/:recipientId', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req.user);
      const { recipientId } = req.params;

      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required' });
      }

      // Get conversation history between the two users
      const messages = await storage.getDirectMessageConversation(userId, recipientId);
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      res.status(500).json({ error: 'Failed to fetch direct messages' });
    }
  });

  // Direct messages API route
  app.post('/api/direct-messages', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req.user);
      const { recipientId, message } = req.body;

      if (!recipientId || !message || !message.trim()) {
        return res.status(400).json({ error: 'Recipient ID and message are required' });
      }

      // Create a direct message by using the existing messages table
      // We'll use matchId as null to indicate it's a direct message
      const directMessage = await storage.createMessage({
        senderId: userId,
        recipientId: recipientId,
        content: message.trim(),
        matchId: null // Use null for direct messages
      });

      res.json(directMessage);
    } catch (error) {
      console.error('Error sending direct message:', error);
      res.status(500).json({ error: 'Failed to send direct message' });
    }
  });

  return httpServer;
}
