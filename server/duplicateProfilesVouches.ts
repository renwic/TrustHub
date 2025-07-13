import { storage } from "./storage";

// Add vouches for the duplicate profiles (IDs 50-57) that are currently being displayed
export const duplicateProfileVouches = [
  // Alex Chen (Profile ID 50, duplicate of 2)
  {
    profileId: 50,
    authorName: "Maya Patel",
    authorEmail: "maya.p@email.com",
    relationship: "Workout Partner",
    content: "Alex is incredibly disciplined and motivating. They never miss our 6 AM gym sessions and always push me to reach new goals. Their dedication to fitness is matched by their genuine care for others - they helped me through a tough injury recovery with endless patience.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 50,
    authorName: "David Kim",
    authorEmail: "d.kim@techcorp.com",
    relationship: "Former Colleague",
    content: "Working with Alex was a masterclass in leadership. They have this rare ability to break down complex problems and guide the team to solutions without making anyone feel inadequate. Their positive energy is infectious and they throw the best team celebration parties.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Jordan Martinez (Profile ID 51, duplicate of 3)
  {
    profileId: 51,
    authorName: "Sofia Rodriguez",
    authorEmail: "sofia.r@email.com",
    relationship: "Best Friend",
    content: "Jordan has been my anchor for over a decade. They're the person I call when I need honest advice or just someone to listen. Their sense of humor can turn any bad day around, and their loyalty is unmatched. Plus they make incredible tacos from scratch.",
    ratings: { trustworthy: 5, fun: 5, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 51,
    authorName: "Carlos Martinez",
    authorEmail: "carlos.m@email.com",
    relationship: "Brother",
    content: "My sibling Jordan is one of those rare people who genuinely cares about everyone they meet. They've always been the peacemaker in our family and have this gift for seeing the best in people. Their empathy and emotional intelligence are remarkable.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },

  // Taylor Johnson (Profile ID 52, duplicate of 4)
  {
    profileId: 52,
    authorName: "Emma Thompson",
    authorEmail: "emma.t@email.com",
    relationship: "College Roommate",
    content: "Taylor was the most organized person in our entire dorm. They helped me pass calculus, organized amazing study groups, and somehow always had snacks for everyone. Their attention to detail and genuine care for others' success made college so much better.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 52,
    authorName: "Michael Chen",
    authorEmail: "m.chen@startup.com",
    relationship: "Business Partner",
    content: "Taylor's strategic thinking and execution skills are phenomenal. They can see three steps ahead while still paying attention to every detail. Working with them has taught me so much about building sustainable business practices and treating people right.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Casey Williams (Profile ID 53, duplicate of 5)
  {
    profileId: 53,
    authorName: "Zoe Anderson",
    authorEmail: "zoe.a@email.com",
    relationship: "Art Class Partner",
    content: "Casey sees the world through such a unique lens. Their creativity is boundless and they have this amazing ability to find beauty in everyday moments. They're also incredibly encouraging - they helped me find confidence in my own artistic voice.",
    ratings: { trustworthy: 4, fun: 5, caring: 5, ambitious: 4, reliable: 4 },
    approved: true
  },
  {
    profileId: 53,
    authorName: "Ryan Williams",
    authorEmail: "ryan.w@email.com",
    relationship: "Cousin",
    content: "Casey has always been the creative soul of our family. They're endlessly curious about the world and have this wonderful way of making ordinary moments feel special. Their passion for art and life is truly inspiring to be around.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 4, reliable: 4 },
    approved: true
  },

  // Riley Brown (Profile ID 54, duplicate of 6)
  {
    profileId: 54,
    authorName: "Jordan Davis",
    authorEmail: "j.davis@email.com",
    relationship: "Hiking Buddy",
    content: "Riley knows every trail in the state and always picks the most breathtaking routes. They're incredibly safety-conscious but never let that stop the adventure. They've taught me so much about respecting nature and pushing my own limits.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 54,
    authorName: "Dr. Sarah Mitchell",
    authorEmail: "s.mitchell@university.edu",
    relationship: "Professor",
    content: "Riley consistently demonstrates exceptional analytical thinking in environmental science. Their research on local ecosystems shows both scientific rigor and genuine passion for conservation. They're going to make a real difference in the field.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Sam Davis (Profile ID 55, duplicate of 7)
  {
    profileId: 55,
    authorName: "Alex Rivera",
    authorEmail: "alex.r@email.com",
    relationship: "Volunteer Coordinator",
    content: "Sam brings incredible energy to our community service projects. They can rally volunteers, organize complex logistics, and keep everyone motivated even during the most challenging days. Their commitment to helping others is genuinely inspiring.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 55,
    authorName: "Maria Santos",
    authorEmail: "m.santos@email.com",
    relationship: "Neighbor",
    content: "Sam is the kind of neighbor everyone wishes they had. They're always willing to help, whether it's watching pets, lending tools, or just being there when you need someone to talk to. Their kindness and reliability make our whole community better.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 3, reliable: 5 },
    approved: true
  },

  // Morgan Wilson (Profile ID 56, duplicate of 8)
  {
    profileId: 56,
    authorName: "Jessica Park",
    authorEmail: "j.park@email.com",
    relationship: "Travel Companion",
    content: "Morgan is the perfect travel partner - adventurous but responsible, always up for trying new things but never reckless. They've shown me some of the most amazing hidden gems and have this wonderful way of connecting with locals wherever we go.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 4, reliable: 4 },
    approved: true
  },
  {
    profileId: 56,
    authorName: "Dr. James Wilson",
    authorEmail: "j.wilson@email.com",
    relationship: "Father",
    content: "Morgan has always been curious and independent. They approach life with such enthusiasm and have this remarkable ability to find joy in simple moments. I'm incredibly proud of the compassionate, adventurous person they've become.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 4 },
    approved: true
  },

  // Avery Garcia (Profile ID 57, duplicate of 9)
  {
    profileId: 57,
    authorName: "Nina Rodriguez",
    authorEmail: "nina.r@email.com",
    relationship: "Book Club Member",
    content: "Avery brings such thoughtful perspectives to our discussions. They read everything from literary fiction to science journals and somehow connect ideas in ways that blow my mind. Their curiosity and depth of thinking make every conversation richer.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 57,
    authorName: "Dr. Robert Chen",
    authorEmail: "r.chen@library.org",
    relationship: "Research Mentor",
    content: "Avery's research skills and intellectual curiosity are exceptional. They approach every project with thoroughness and creativity, and their ability to synthesize complex information is remarkable. They're destined for great things in academia.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  }
];

export async function seedDuplicateProfileVouches() {
  console.log("🌟 Seeding vouches for duplicate profiles (50-57)...");
  
  try {
    for (const vouch of duplicateProfileVouches) {
      await storage.createTestimonial({
        profileId: vouch.profileId,
        authorName: vouch.authorName,
        authorEmail: vouch.authorEmail,
        relationship: vouch.relationship,
        content: vouch.content,
        ratings: vouch.ratings,
        approved: vouch.approved
      });
    }
    
    console.log(`✅ Successfully seeded ${duplicateProfileVouches.length} vouches for duplicate profiles`);
  } catch (error) {
    console.error("❌ Error seeding duplicate profile vouches:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDuplicateProfileVouches()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to seed duplicate profile vouches:", error);
      process.exit(1);
    });
}