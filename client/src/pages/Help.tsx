import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { 
  Search, 
  Heart, 
  Shield, 
  Users, 
  MessageCircle, 
  User, 
  Star,
  Camera,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  Play,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Settings,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Video,
  Phone,
  Calendar,
  Map,
  Filter,
  BarChart3,
  Bell,
  Eye,
  Lock,
  Flag,
  Award,
  Compass
} from "lucide-react";

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Play,
    description: "Learn the basics of Heartlink",
    articles: [
      {
        id: "welcome",
        title: "Welcome to Heartlink",
        content: "Your journey to meaningful connections starts here! Heartlink revolutionizes online dating by prioritizing authentic relationships built on trust and social verification. Unlike traditional swipe-based apps, we use a comprehensive trust system where friends, family, and colleagues can vouch for your character.",
        steps: [
          "Complete your profile with authentic information and recent photos",
          "Invite your RealOnes (friends, family, colleagues) to give you props",
          "Build your RealBar score through verified testimonials and interactions",
          "Connect with people based on trust, shared values, and authentic connections",
          "Use our Trust Hub to discover profiles categorized by verification level"
        ]
      },
      {
        id: "profile-setup",
        title: "Setting Up Your Profile",
        content: "A complete, authentic profile is the foundation of successful connections on Heartlink. Your profile completion directly impacts your RealBar score and visibility to potential matches.",
        steps: [
          "Upload 3-5 high-quality, recent photos that showcase your personality and interests",
          "Write an authentic bio that reflects your values, interests, and what you're looking for",
          "Fill in your interests, education, and lifestyle preferences",
          "Set your relationship goals and what you're looking for",
          "Complete all profile sections to maximize your RealBar score"
        ]
      },
      {
        id: "account-creation",
        title: "Creating Your Account",
        content: "Getting started with Heartlink is simple and secure. We offer multiple authentication options to make signing up convenient while keeping your data protected.",
        steps: [
          "Choose your preferred sign-up method: email, Google, or Facebook",
          "Verify your email address to activate your account",
          "Set up your basic profile information and preferences",
          "Upload your first profile photo to get started",
          "Begin exploring the platform and learning about our unique features"
        ]
      },
      {
        id: "navigation-guide",
        title: "Navigating the App",
        content: "Heartlink's interface is designed to prioritize meaningful connections through trust-based discovery rather than superficial swiping.",
        steps: [
          "Trust Hub: Main discovery page organized by verification levels",
          "My Props: Manage testimonials from your RealOnes",
          "Matches: View and message your connections",
          "Profile: Edit your information and view your RealBar score",
          "Settings: Customize preferences and privacy controls"
        ]
      }
    ]
  },
  {
    id: "trust-system",
    title: "RealBar & Trust",
    icon: Shield,
    description: "Understanding our verification system",
    articles: [
      {
        id: "realbar-explained",
        title: "What is RealBar?",
        content: "RealBar is your trust score based on verified testimonials from people who know you personally. It's calculated from three key components that reflect your authenticity and social connections.",
        steps: [
          "Props given by RealOnes: Up to 60 points based on number of testimonials",
          "Rating Quality: Up to 30 points from average ratings across all props",
          "Profile Completeness: Up to 10 points for filling out your profile",
          "Total possible: 100 points for maximum trustworthiness"
        ]
      },
      {
        id: "trust-categories",
        title: "Trust Categories",
        content: "Profiles are categorized based on their RealBar scores to help you find verified connections that match your comfort level with trust verification.",
        steps: [
          "Verified (85%+): Highly trusted with extensive props given by RealOnes",
          "Trusted (70%+): Well-established profiles with solid testimonials",
          "Emerging (50%+): Growing trust with some verification",
          "New (<50%): New profiles still building their RealBar"
        ]
      },
      {
        id: "props-explained",
        title: "Understanding Props",
        content: "Props are testimonials from your RealOnes that verify your character and personality. They're the foundation of trust on Heartlink.",
        steps: [
          "RealOnes rate you on trustworthiness, kindness, fun, and recommendation",
          "They can share photos and stories about your experiences together",
          "Props include relationship context (friend, colleague, family, etc.)",
          "All props require your approval before being displayed publicly",
          "More diverse props given by different relationship types strengthen your profile"
        ]
      },
      {
        id: "verification-process",
        title: "Profile Verification",
        content: "Our verification process ensures authentic profiles and builds trust within the community through multiple verification methods.",
        steps: [
          "Email verification: Confirm your email address during registration",
          "Phone verification: Optional SMS verification for enhanced trust",
          "Social verification: Props from RealOnes who know you personally",
          "Photo verification: Ensure photos are recent and authentic",
          "Identity verification: Advanced verification for premium users"
        ]
      }
    ]
  },
  {
    id: "connecting",
    title: "Matching & Connections",
    icon: Heart,
    description: "How to discover and connect with people",
    articles: [
      {
        id: "trust-hub",
        title: "Using Trust Hub",
        content: "Trust Hub is your main discovery interface, organized by trust levels rather than random swiping. It helps you find connections based on verified authenticity.",
        steps: [
          "Browse profiles organized by trust categories",
          "Use 'Connect' buttons for intentional relationship building",
          "View RealBar scores and props before connecting",
          "Filter by interests, location, and relationship goals",
          "Read props to understand someone's character before matching"
        ]
      },
      {
        id: "making-connections",
        title: "Making Meaningful Connections",
        content: "Our connection system is designed to foster genuine relationships based on compatibility and shared values rather than superficial attraction.",
        steps: [
          "Review profiles thoroughly including props and photos",
          "Look for shared interests and compatible life goals",
          "Consider their RealBar score and verification level",
          "Use the 'Connect' button to express genuine interest",
          "Start conversations based on their props and profile details"
        ]
      },
      {
        id: "match-preferences",
        title: "Setting Match Preferences",
        content: "Customize your discovery experience by setting detailed preferences that help our algorithm find the most compatible matches for you.",
        steps: [
          "Set age range preferences for optimal compatibility",
          "Define maximum distance for potential matches",
          "Choose interested gender and relationship type",
          "Set minimum RealBar score requirements",
          "Require props for enhanced trust verification",
          "Filter by education, lifestyle, and interests"
        ]
      },
      {
        id: "relationship-stages",
        title: "Seven Relationship Stages",
        content: "Navigate your connections through our progressive relationship stages, from initial exploration to committed relationships.",
        steps: [
          "Solo: Exploring the platform and building your profile",
          "Explorers: Initial conversations and getting to know each other",
          "Potentials: Deeper connections with promising matches",
          "Warm Sparks: Regular communication and growing interest",
          "On Deck: Serious consideration for relationship potential",
          "Committed: Mutual agreement to pursue exclusive relationship",
          "Archived: Respectfully concluded connections"
        ]
      }
    ]
  },
  {
    id: "messaging",
    title: "RealOne Interviews",
    icon: MessageCircle,
    description: "Deep character insights through testimonials",
    articles: [
      {
        id: "realone-interviews",
        title: "How RealOne Interviews Work",
        content: "RealOne interviews allow you to ask questions directly to your match's RealOnes, providing deeper insights into their character and compatibility.",
        steps: [
          "Request permission from your match to interview their RealOnes",
          "Choose specific RealOnes you'd like to ask questions to",
          "Submit thoughtful questions about character, values, and compatibility",
          "Receive responses from RealOnes who choose to participate",
          "Use insights to better understand your match's personality"
        ]
      },
      {
        id: "interview-permissions",
        title: "Granting Interview Permissions",
        content: "Control who can ask questions to your RealOnes by carefully managing interview permissions for your matches.",
        steps: [
          "Review match requests for RealOne interviews",
          "Grant permissions selectively to serious connections",
          "Choose which RealOnes to make available for interviews",
          "Set guidelines for the types of questions allowed",
          "Revoke permissions if needed for privacy or comfort"
        ]
      },
      {
        id: "interview-requests",
        title: "Managing Interview Requests",
        content: "Efficiently handle interview requests and responses to maintain meaningful connections while respecting everyone's time and privacy.",
        steps: [
          "Review incoming interview requests promptly",
          "Prepare thoughtful questions that provide genuine insights",
          "Respect RealOnes' time and privacy when asking questions",
          "Follow up appropriately on interview responses",
          "Use interview insights to deepen your connection"
        ]
      },
      {
        id: "interview-questions",
        title: "Asking Great Interview Questions",
        content: "Craft meaningful questions that provide valuable insights into your match's character, values, and compatibility.",
        steps: [
          "Focus on character traits and values rather than superficial topics",
          "Ask about communication style and conflict resolution",
          "Inquire about loyalty, reliability, and relationship patterns",
          "Request specific examples of personality traits",
          "Avoid inappropriate personal or sensitive questions"
        ]
      }
    ]
  },
  {
    id: "safety",
    title: "Safety & Privacy",
    icon: Shield,
    description: "Staying safe while dating",
    articles: [
      {
        id: "safety-tips",
        title: "Dating Safety Guidelines",
        content: "Your safety is our top priority. Follow these essential guidelines to ensure secure and positive dating experiences.",
        steps: [
          "Meet in public places for first dates",
          "Tell friends or family about your plans",
          "Trust your instincts if something feels wrong",
          "Use video chat before meeting in person",
          "Report any suspicious or inappropriate behavior"
        ]
      },
      {
        id: "privacy-controls",
        title: "Privacy Settings",
        content: "Take control of your privacy with comprehensive settings that let you manage what information you share and with whom.",
        steps: [
          "Review and approve all props before they go live",
          "Control who can see your profile and contact information",
          "Manage RealOne interview permissions carefully",
          "Block or report users who violate community guidelines",
          "Review privacy settings regularly to ensure comfort level"
        ]
      },
      {
        id: "reporting",
        title: "Blocking and Reporting Users",
        content: "Keep the community safe by reporting inappropriate behavior and using blocking features when necessary.",
        steps: [
          "Use the report function for harassment, fake profiles, or inappropriate content",
          "Block users who make you uncomfortable",
          "Provide detailed information when reporting issues",
          "Our team reviews all reports within 24 hours",
          "Serious violations result in immediate account suspension"
        ]
      },
      {
        id: "data-protection",
        title: "How We Protect Your Data",
        content: "Learn about our comprehensive data protection measures and your rights regarding your personal information.",
        steps: [
          "All data is encrypted in transit and at rest",
          "We never sell personal information to third parties",
          "Regular security audits and vulnerability assessments",
          "GDPR compliance for data protection and privacy rights",
          "You can download or delete your data at any time"
        ]
      }
    ]
  },
  {
    id: "technical",
    title: "Technical & Account",
    icon: Settings,
    description: "Managing your account and troubleshooting",
    articles: [
      {
        id: "account-management",
        title: "Managing Your Account",
        content: "Learn how to manage your account settings, update personal information, and control your Heartlink experience.",
        steps: [
          "Update your email address and password securely",
          "Manage notification preferences and frequency",
          "Review your privacy and visibility settings",
          "Download your data or delete your account if needed",
          "Contact support for account-related issues"
        ]
      },
      {
        id: "notifications",
        title: "Notification Preferences",
        content: "Customize your notification settings to stay informed about important activities while maintaining your preferred level of engagement.",
        steps: [
          "Choose which activities trigger notifications",
          "Set quiet hours for uninterrupted time",
          "Select between immediate alerts or daily digests",
          "Customize notification sounds and vibrations",
          "Manage email notification frequency and content"
        ]
      },
      {
        id: "troubleshooting",
        title: "Common Issues and Solutions",
        content: "Resolve common technical issues quickly with these troubleshooting steps and solutions.",
        steps: [
          "App crashes: Force close and restart the app, check for updates",
          "Login issues: Reset password, clear cache, or try a different login method",
          "Photos not uploading: Check internet connection, file size, and format",
          "Messages not sending: Verify connection and check if user blocked you",
          "Profile not updating: Refresh the app and check all required fields are complete",
          "RealOne invites not working: Verify email addresses and check spam folders"
        ]
      },
      {
        id: "premium-features",
        title: "Premium Features and Billing",
        content: "Learn about Heartlink Premium features and manage your subscription settings for enhanced dating experiences.",
        steps: [
          "Advanced filters: Search by specific criteria like education, religion, interests",
          "Priority visibility: Appear higher in browse results and get more profile views",
          "Unlimited props: Invite as many RealOnes as you want without restrictions",
          "Enhanced privacy: Complete control over who sees your profile and information",
          "Premium support: Priority customer service and faster response times",
          "Manage billing through your account settings or app store subscriptions"
        ]
      }
    ]
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    icon: Zap,
    description: "Maximize your Heartlink experience",
    articles: [
      {
        id: "relationship-stages",
        title: "Seven-Stage Relationship System",
        content: "Navigate meaningful connections through our progressive relationship stages from Solo to Committed.",
        steps: [
          "Solo: Exploring the platform, building your profile and RealBar",
          "Explorers: Initial connections and conversations with matches",
          "Potentials: Deeper conversations with promising connections",
          "Warm Sparks: Regular communication and growing interest",
          "On Deck: Serious consideration for relationship potential",
          "Committed: Mutual agreement to pursue exclusive relationship",
          "Archived: Respectfully concluded connections for future reference"
        ]
      },
      {
        id: "smart-matching",
        title: "Smart Matching Algorithm",
        content: "Understand how our intelligent matching system works to find compatible connections based on multiple factors.",
        steps: [
          "Age Compatibility: Matches within your preferred age range",
          "Location Proximity: Considers distance preferences and location",
          "Interest Overlap: Analyzes shared hobbies, values, and lifestyle",
          "RealBar Compatibility: Matches similar trust score levels",
          "Relationship Goals: Aligns what you're looking for",
          "Prop Insights: Uses character traits from testimonials",
          "Activity Patterns: Considers when you're active on the platform"
        ]
      },
      {
        id: "match-preferences",
        title: "Advanced Match Preferences",
        content: "Fine-tune your discovery experience with detailed preference settings.",
        steps: [
          "Set specific age ranges for optimal compatibility",
          "Define maximum distance for potential matches",
          "Choose interested gender and relationship type",
          "Set minimum RealBar score requirements",
          "Require props for enhanced trust verification",
          "Filter by education level, career, and lifestyle choices",
          "Save multiple preference profiles for different scenarios"
        ]
      },
      {
        id: "messaging-features",
        title: "Advanced Messaging Features",
        content: "Utilize advanced messaging capabilities for deeper connections and better communication.",
        steps: [
          "Send voice messages for more personal communication",
          "Share photos and videos securely within conversations",
          "Use message reactions and emojis for quick responses",
          "Schedule messages for optimal timing",
          "Create conversation templates for efficient communication",
          "Access message history and search past conversations",
          "Set up automatic responses for common questions"
        ]
      },
      {
        id: "photo-features",
        title: "Photo and Media Features",
        content: "Make the most of Heartlink's photo and media features to showcase your authentic self.",
        steps: [
          "Upload multiple photos showing different aspects of your life",
          "Use photo captions to provide context and stories",
          "Share temporary photos that disappear after 24 hours",
          "Create photo albums organized by themes or activities",
          "Use photo verification to confirm authenticity",
          "Share photos in props to provide authentic testimonials",
          "Control photo visibility and privacy settings"
        ]
      },
      {
        id: "social-features",
        title: "Social and Community Features",
        content: "Engage with the broader Heartlink community through social features and group activities.",
        steps: [
          "Join interest-based groups and communities",
          "Participate in virtual events and meetups",
          "Share success stories and relationship milestones",
          "Refer friends and earn rewards for successful matches",
          "Participate in community challenges and activities",
          "Access dating advice and relationship resources",
          "Connect with dating coaches and relationship experts"
        ]
      },
      {
        id: "notification-center",
        title: "Notification Management",
        content: "Stay informed about matches, messages, and props with smart notifications.",
        steps: [
          "New match alerts with compatibility insights",
          "Message notifications with conversation context",
          "Props received from RealOnes with approval options",
          "RealOne interview requests and responses",
          "Profile views and connection attempts",
          "Relationship stage progression notifications",
          "Weekly activity summaries and engagement tips"
        ]
      }
    ]
  },
  {
    id: "profile-optimization",
    title: "Profile Optimization",
    icon: TrendingUp,
    description: "Maximize your profile's effectiveness",
    articles: [
      {
        id: "photo-strategy",
        title: "Photo Selection Strategy",
        content: "Choose photos that authentically represent your personality and lifestyle.",
        steps: [
          "Primary photo: Clear, smiling headshot showing your face",
          "Lifestyle photos: Activities, hobbies, and interests",
          "Social photos: With friends or family (faces blurred for privacy)",
          "Professional photos: Career or achievement-related images",
          "Travel photos: Adventures and experiences that define you",
          "Avoid: Group photos where you're hard to identify, overly filtered images",
          "Quality check: Ensure good lighting, clear resolution, and recent photos"
        ]
      },
      {
        id: "bio-writing",
        title: "Crafting Your Bio",
        content: "Write a compelling bio that showcases your authentic personality.",
        steps: [
          "Start with your core values and what matters most to you",
          "Mention 2-3 key interests or hobbies with specific details",
          "Share what you're looking for in a relationship",
          "Include a conversation starter or interesting fact",
          "Keep it authentic - avoid clichés and generic phrases",
          "Use humor if it reflects your personality",
          "Update regularly to reflect your current interests and goals"
        ]
      },
      {
        id: "realbar-optimization",
        title: "Maximizing Your RealBar Score",
        content: "Strategic approach to building the highest possible trust score.",
        steps: [
          "Invite 8-12 RealOnes from diverse relationship contexts",
          "Choose people who can speak to different aspects of your character",
          "Follow up with invitees to ensure prop completion",
          "Complete 100% of your profile sections",
          "Regularly update your interests and lifestyle information",
          "Ask RealOnes to include specific examples and stories",
          "Monitor your score and identify areas for improvement"
        ]
      },
      {
        id: "strategic-realones",
        title: "Strategic RealOne Selection",
        content: "Choose the right people to give you props for maximum impact.",
        steps: [
          "Close friend: Someone who knows your social personality",
          "Family member: Sibling, parent, or cousin who can vouch for your character",
          "Colleague or classmate: Professional or academic reference",
          "Romantic reference: Ex-partner who can speak positively (if appropriate)",
          "Activity partner: Gym buddy, hobby partner, or teammate",
          "Mentor or mentee: Someone who knows your growth and aspirations",
          "Community member: Neighbor, volunteer coordinator, or group member"
        ]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: AlertTriangle,
    description: "Common issues and solutions",
    articles: [
      {
        id: "login-issues",
        title: "Login and Authentication Problems",
        content: "Resolve common login difficulties and account access issues.",
        steps: [
          "Clear your browser cache and cookies",
          "Try logging in with a different browser or incognito mode",
          "Check that your email and password are entered correctly",
          "Reset your password if you've forgotten it",
          "Disable browser extensions that might interfere",
          "Contact support if you're still unable to access your account"
        ]
      },
      {
        id: "notification-problems",
        title: "Notification Issues",
        content: "Fix problems with receiving notifications and alerts.",
        steps: [
          "Check your notification settings in your profile",
          "Ensure push notifications are enabled in your browser",
          "Verify your email address is confirmed and current",
          "Check spam/junk folder for email notifications",
          "Update your notification preferences if too many or too few",
          "Test notifications by having a friend send you a message"
        ]
      },
      {
        id: "profile-visibility",
        title: "Profile Visibility Problems",
        content: "Address issues with your profile not appearing in search results.",
        steps: [
          "Complete all required profile sections",
          "Add at least 3 high-quality photos",
          "Verify your email address and phone number",
          "Check that your profile is set to 'Active' status",
          "Ensure your age and location are within searchable ranges",
          "Review privacy settings that might limit visibility",
          "Wait 24 hours for profile updates to take effect"
        ]
      },
      {
        id: "matching-problems",
        title: "Matching and Discovery Issues",
        content: "Troubleshoot problems with finding matches or connecting with people.",
        steps: [
          "Broaden your search criteria (age range, distance, preferences)",
          "Update your match preferences to include more options",
          "Ensure your RealBar score is competitive in your area",
          "Be more active on the platform - check daily for new profiles",
          "Review and improve your profile photos and bio",
          "Consider expanding your geographic search area",
          "Engage more with the community through props and comments"
        ]
      },
      {
        id: "realone-issues",
        title: "RealOne and Props Problems",
        content: "Solve issues related to inviting RealOnes and managing props.",
        steps: [
          "Double-check email addresses when sending invitations",
          "Follow up with invitees via text or call if they haven't responded",
          "Resend invitations if the original links have expired",
          "Provide clear instructions to RealOnes about the process",
          "Check your spam folder for prop submissions awaiting approval",
          "Contact support if props aren't appearing after approval",
          "Review props for appropriate content before approving"
        ]
      }
    ]
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    icon: Flag,
    description: "Standards for respectful interaction",
    articles: [
      {
        id: "respectful-communication",
        title: "Respectful Communication Standards",
        content: "Guidelines for positive and respectful interactions with all community members.",
        steps: [
          "Use kind and respectful language in all communications",
          "Respect others' boundaries and comfort levels",
          "Avoid discriminatory language based on race, gender, religion, or orientation",
          "No harassment, bullying, or persistent unwanted contact",
          "Respect 'no' as a complete answer - don't pressure for responses",
          "Report inappropriate behavior to help maintain community standards",
          "Treat RealOne interviews with professionalism and respect"
        ]
      },
      {
        id: "authentic-profiles",
        title: "Profile Authenticity Standards",
        content: "Requirements for honest and genuine profile representation.",
        steps: [
          "Use only your own photos - no stock images or other people's pictures",
          "Provide accurate age, location, and relationship status",
          "Write genuine bios that reflect your real personality",
          "Only invite people who actually know you as RealOnes",
          "Ensure props are written by the actual invited person",
          "Don't create multiple accounts or fake profiles",
          "Update your information when significant life changes occur"
        ]
      },
      {
        id: "content-standards",
        title: "Content and Photo Guidelines",
        content: "Standards for appropriate content sharing on the platform.",
        steps: [
          "No nudity, sexually explicit, or inappropriate content",
          "Avoid posting identifying information like addresses or phone numbers",
          "Don't share screenshots of private conversations",
          "Respect copyright - only use photos you have rights to",
          "Keep props professional and appropriate for public viewing",
          "No promotional content, spam, or commercial solicitation",
          "Report inappropriate content when you encounter it"
        ]
      },
      {
        id: "meeting-safety",
        title: "Safe Meeting Practices",
        content: "Essential safety guidelines for meeting matches in person.",
        steps: [
          "Always meet in public places for initial meetings",
          "Tell someone you trust about your plans and location",
          "Arrange your own transportation to and from dates",
          "Trust your instincts - leave if you feel uncomfortable",
          "Don't share personal details like home address too quickly",
          "Consider video chatting before meeting in person",
          "Report any safety concerns to our support team immediately"
        ]
      }
    ]
  }
];

const quickActions = [
  { title: "Browse Profiles", icon: Search, description: "Discover potential matches by trust level", action: "/" },
  { title: "Complete Profile", icon: User, description: "Enhance your profile for better matches", action: "/profile" },
  { title: "Invite RealOnes", icon: Users, description: "Get testimonials from people who know you", action: "/vouches" },
  { title: "View Messages", icon: MessageCircle, description: "Check your conversations", action: "/matches" }
];

const faqs = [
  // Getting Started FAQs
  {
    category: "Getting Started",
    question: "What makes Heartlink different from other dating apps?",
    answer: "Heartlink focuses on trust and authenticity through our RealBar system. Instead of just swiping on photos, you get verified testimonials from real people who know potential matches personally. This creates deeper, more meaningful connections based on character verification."
  },
  {
    category: "Getting Started",
    question: "How long does it take to set up my profile?",
    answer: "A basic profile takes 10-15 minutes, but we recommend spending 30-45 minutes to complete all sections thoroughly. This includes adding photos, writing your bio, filling out interests, and sending initial RealOne invitations for maximum effectiveness."
  },
  {
    category: "Getting Started",
    question: "Do I need to invite RealOnes right away?",
    answer: "While not required immediately, inviting RealOnes within your first week significantly improves your profile visibility and trust score. You can start connecting with others while your RealOnes complete their testimonials."
  },
  {
    category: "Getting Started",
    question: "Is Heartlink free to use?",
    answer: "Yes, Heartlink offers a comprehensive free tier with all basic features. Premium subscriptions unlock advanced filters, priority visibility, unlimited RealOne invitations, and enhanced privacy controls."
  },

  // RealBar & Trust System FAQs
  {
    category: "RealBar & Trust",
    question: "How do I improve my RealBar score?",
    answer: "Invite more RealOnes to give you props (up to 60 points), complete all sections of your profile (up to 10 points), and ensure your testimonials are high-quality with good ratings (up to 30 points). Quality matters more than quantity."
  },
  {
    category: "RealBar & Trust",
    question: "Who should I invite as RealOnes?",
    answer: "Choose people who know you well in different contexts - close friends, family members, colleagues, classmates, or activity partners. Diverse perspectives create a more complete picture. Aim for 8-12 RealOnes from various relationship types."
  },
  {
    category: "RealBar & Trust",
    question: "What if my RealOnes don't respond to invitations?",
    answer: "Follow up personally via text or call, explaining how their testimonial helps build trust for meaningful connections. Resend invitations if needed, and consider reaching out to additional people. Most RealOnes complete props when they understand the importance."
  },
  {
    category: "RealBar & Trust",
    question: "Can I see other people's RealBar calculation details?",
    answer: "You can see overall RealBar scores and read their props, but detailed scoring breakdowns are private. This encourages authentic prop creation rather than gaming the system."
  },
  {
    category: "RealBar & Trust",
    question: "How often does my RealBar score update?",
    answer: "RealBar scores update in real-time as new props are approved, profile sections are completed, or existing props are modified. You'll receive notifications when your score changes significantly."
  },
  {
    category: "RealBar & Trust",
    question: "What happens if I reject a prop?",
    answer: "Rejected props are permanently deleted and don't affect your score. Your RealOne will be notified that you declined to display their testimonial, but they won't see your reason for rejection."
  },

  // Matching & Connections FAQs
  {
    category: "Matching & Connections",
    question: "How does the Trust Hub categorization work?",
    answer: "Profiles are automatically sorted into Verified (85-100), Trusted (70-84), Emerging (50-69), and New (0-49) categories based on RealBar scores. This helps you find connections that match your comfort level with verification."
  },
  {
    category: "Matching & Connections",
    question: "What happens when I click 'Connect' with someone?",
    answer: "Clicking 'Connect' shows your interest. If they also connect with you, it creates a match and opens messaging capabilities. You'll both receive notifications about the new connection."
  },
  {
    category: "Matching & Connections",
    question: "How do I know if someone is interested in me?",
    answer: "You'll receive notifications when someone connects with you, views your profile, or requests RealOne interviews. Mutual connections appear in your Matches section where you can start conversations."
  },
  {
    category: "Matching & Connections",
    question: "Can I undo a connection request?",
    answer: "Currently, connection requests cannot be undone, but you can unmatch with someone after connecting if you change your mind. This removes the match and prevents further communication."
  },
  {
    category: "Matching & Connections",
    question: "What are the seven relationship stages?",
    answer: "The stages are: Solo (exploring), Explorers (casual getting to know), Potentials (considering deeper connection), Warm Sparks (building romance), On Deck (exclusive dating), Committed (official relationship), and Archived (respectfully ended)."
  },
  {
    category: "Matching & Connections",
    question: "How does the matching algorithm work?",
    answer: "Our smart algorithm considers age compatibility, location proximity, interest overlap, RealBar compatibility, relationship goals, prop insights, and activity patterns to suggest the most compatible matches."
  },

  // RealOne Interviews FAQs
  {
    category: "RealOne Interviews",
    question: "How do RealOne interviews work?",
    answer: "When you grant permission, matches can ask questions to your RealOnes about your character. Your RealOnes receive these questions and can choose to respond. Their answers are shared privately with the requesting match."
  },
  {
    category: "RealOne Interviews",
    question: "Who can I grant interview permissions to?",
    answer: "You can grant permissions to any of your matches. We recommend being selective and only sharing access with people you're seriously considering for deeper connections."
  },
  {
    category: "RealOne Interviews",
    question: "What kind of questions should I ask in interviews?",
    answer: "Focus on character, values, and relationship patterns. Good questions include communication style, conflict resolution, loyalty, and specific examples of their personality traits. Avoid superficial or inappropriate topics."
  },
  {
    category: "RealOne Interviews",
    question: "Can I revoke interview permissions?",
    answer: "Yes, you can revoke permissions at any time. This stops future questions from being sent, but previously answered questions remain accessible to the match."
  },
  {
    category: "RealOne Interviews",
    question: "Do my RealOnes have to participate in interviews?",
    answer: "No, participation is completely optional. RealOnes can decline to answer any questions or choose not to participate in interviews at all."
  },
  {
    category: "RealOne Interviews",
    question: "How many questions can I ask per interview?",
    answer: "You can ask up to 5 questions per RealOne to respect their time. Choose your questions thoughtfully to get the most valuable insights about your match."
  },

  // Safety & Privacy FAQs
  {
    category: "Safety & Privacy",
    question: "How do I report inappropriate behavior?",
    answer: "Use the report button on any profile or message. Choose the appropriate category (harassment, fake profile, inappropriate content) and provide details. Our moderation team reviews all reports within 24 hours."
  },
  {
    category: "Safety & Privacy",
    question: "What information is visible to other users?",
    answer: "Basic profile information, approved props, and photos are visible. Personal contact information, exact location, and RealOne contact details are never shared. You control what's visible through privacy settings."
  },
  {
    category: "Safety & Privacy",
    question: "How do I block someone?",
    answer: "Click the three dots menu on their profile or conversation and select 'Block User.' Blocked users cannot contact you, see your profile, or find you in search results."
  },
  {
    category: "Safety & Privacy",
    question: "Is my data secure?",
    answer: "Yes, all data is encrypted in transit and at rest. We never sell personal information to third parties. You can download or delete your data at any time through account settings."
  },
  {
    category: "Safety & Privacy",
    question: "What should I do if I feel unsafe meeting someone?",
    answer: "Always meet in public places, tell someone your plans, trust your instincts, and arrange your own transportation. If you feel uncomfortable, leave immediately and report any concerning behavior."
  },
  {
    category: "Safety & Privacy",
    question: "Can I control who sees my profile?",
    answer: "Yes, you can set your profile to visible to everyone, only people with props, or only people within certain RealBar score ranges. Premium users have additional privacy controls."
  },

  // Technical & Account FAQs
  {
    category: "Technical & Account",
    question: "How do I change my email or password?",
    answer: "Go to Settings > Account to update your email address or password. You'll need to verify new email addresses. For password changes, you'll need to enter your current password."
  },
  {
    category: "Technical & Account",
    question: "Why am I not receiving notifications?",
    answer: "Check your notification settings in Settings > Notifications. Ensure push notifications are enabled in your browser and email notifications aren't going to spam. Test with a friend sending you a message."
  },
  {
    category: "Technical & Account",
    question: "Can I delete my account permanently?",
    answer: "Yes, go to Settings > Account > Delete Account. This permanently removes all your data, including props, messages, and profile information. This action cannot be undone."
  },
  {
    category: "Technical & Account",
    question: "How do I download my data?",
    answer: "Go to Settings > Privacy > Download Data. We'll compile all your information and email you a secure link to download your complete data package within 48 hours."
  },
  {
    category: "Technical & Account",
    question: "What browsers are supported?",
    answer: "Heartlink works best on Chrome, Firefox, Safari, and Edge (latest versions). For optimal experience, use an updated browser with JavaScript enabled and clear your cache if experiencing issues."
  },
  {
    category: "Technical & Account",
    question: "How do I contact customer support?",
    answer: "Go to Settings > Help & Support to submit a support ticket. Premium users receive priority support with faster response times. You can also email support directly for urgent issues."
  },

  // Advanced Features FAQs
  {
    category: "Advanced Features",
    question: "What are premium features?",
    answer: "Premium includes advanced search filters, priority visibility in browse results, unlimited RealOne invitations, enhanced privacy controls, and priority customer support. Manage your subscription in Settings."
  },
  {
    category: "Advanced Features",
    question: "How do I use advanced search filters?",
    answer: "Premium users can filter by education, occupation, religion, lifestyle preferences, and specific RealBar score ranges. Access these filters through the Browse page filter options."
  },
  {
    category: "Advanced Features",
    question: "What is priority visibility?",
    answer: "Premium users appear higher in browse results and get more profile views. Your profile is also shown to more compatible matches in their discovery feeds."
  },
  {
    category: "Advanced Features",
    question: "How do notification preferences work?",
    answer: "Customize which activities trigger notifications, set quiet hours, choose between immediate alerts or daily digests, and control notification sounds. Access these in Settings > Notifications."
  },
  {
    category: "Advanced Features",
    question: "Can I see who viewed my profile?",
    answer: "Yes, profile views are tracked and shown in your activity feed. Premium users get more detailed analytics about profile views and interaction patterns."
  },
  {
    category: "Advanced Features",
    question: "How do I manage multiple conversations?",
    answer: "Use the Matches section to view all your conversations. You can mark messages as unread, pin important conversations, and use search to find specific messages or matches."
  },

  // Relationship Stages FAQs
  {
    category: "Relationship Stages",
    question: "How do I progress through relationship stages?",
    answer: "Both people must agree to move to the next stage. You can suggest stage progression in your conversation, and if both agree, you can update your relationship status in your match settings."
  },
  {
    category: "Relationship Stages",
    question: "What happens when I archive a connection?",
    answer: "Archived connections are moved to a separate section and you can no longer message each other. However, the connection history is preserved for your reference and can be helpful for future dating insights."
  },
  {
    category: "Relationship Stages",
    question: "Can I go back to previous relationship stages?",
    answer: "Yes, if both people agree, you can move back to previous stages. This might happen if you want to slow down the pace of your relationship or reassess your connection."
  },
  {
    category: "Relationship Stages",
    question: "Do I have to follow the relationship stages?",
    answer: "The stages are optional guidance to help you navigate relationships mindfully. You can progress at your own pace or skip stages entirely if both people agree."
  }
];

const tutorials = [
  {
    id: "profile-completion",
    title: "Complete Your Profile",
    description: "Set up a comprehensive profile that attracts quality matches",
    estimatedTime: "10-15 minutes",
    steps: [
      "Upload your best photos",
      "Write an engaging bio", 
      "Add your interests and preferences",
      "Set your relationship goals"
    ],
    route: "/profile"
  },
  {
    id: "invite-realones",
    title: "Invite Your RealOnes",
    description: "Get testimonials from people who know you best",
    estimatedTime: "15-20 minutes", 
    steps: [
      "Navigate to My Props section",
      "Select diverse relationship types",
      "Send personalized invitations",
      "Follow up for completion"
    ],
    route: "/vouches"
  }
];

export default function Help() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dynamicPadding, setDynamicPadding] = useState(200);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamic spacing calculation
  useEffect(() => {
    const calculateSpacing = () => {
      const windowHeight = window.innerHeight;
      const bottomNavHeight = 128; // Bottom nav + secondary strip
      const spacingBuffer = 8;
      
      const finalPadding = Math.max(
        bottomNavHeight + spacingBuffer,
        Math.min(300, bottomNavHeight * 1.5)
      );
      
      setDynamicPadding(finalPadding);

      if (contentRef.current) {
        const contentBottom = contentRef.current.getBoundingClientRect().bottom;
        const navTop = windowHeight - bottomNavHeight;
        
        console.log("Help page spacing calculation:", {
          windowHeight,
          bottomNavHeight,
          spacingBuffer,
          finalPadding,
          contentBottom,
          navTop
        });
      }
    };

    calculateSpacing();
    window.addEventListener('resize', calculateSpacing);
    return () => window.removeEventListener('resize', calculateSpacing);
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const faqCategories = ["all", ...Array.from(new Set(faqs.map(faq => faq.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="hidden lg:block">
        <DesktopNav />
      </div>
      
      <div className="lg:hidden">
        <Header title="Help & Support" />
      </div>

      <main 
        ref={contentRef}
        className="container mx-auto px-4 py-6 max-w-4xl"
        style={{ paddingBottom: `${dynamicPadding}px` }}
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to master Heartlink and find meaningful connections through our trust-based dating platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              onClick={() => setLocation(action.action)}
            >
              <CardContent className="p-4 text-center">
                <action.icon className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ Center</TabsTrigger>
          </TabsList>

          {/* Guides & Tutorials Tab */}
          <TabsContent value="guides" className="space-y-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.articles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 bg-white/40 dark:bg-gray-700/40">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{article.content}</p>
                      <div className="space-y-2">
                        {article.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Interactive Tutorials Tab */}
          <TabsContent value="interactive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{tutorial.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{tutorial.estimatedTime}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setLocation(tutorial.route)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 mb-4"
                      >
                        Start Tutorial
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tutorial.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Center Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {faqCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 whitespace-nowrap" 
                      : "whitespace-nowrap bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0"
                    }
                  >
                    {category === "all" ? "All" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {faq.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No FAQs found matching your search.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}