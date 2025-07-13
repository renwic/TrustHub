import { storage } from "./storage";

export const allVouches = [
  // Alex Chen (Profile ID 2)
  {
    profileId: 2,
    authorName: "Maya Patel",
    authorEmail: "maya.p@email.com",
    relationship: "Workout Partner",
    content: "Alex is incredibly disciplined and motivating. They never miss our 6 AM gym sessions and always push me to reach new goals. Their dedication to fitness is matched by their genuine care for others - they helped me through a tough injury recovery with endless patience.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 2,
    authorName: "David Kim",
    authorEmail: "d.kim@techcorp.com",
    relationship: "Former Colleague",
    content: "Working with Alex was a masterclass in leadership. They have this rare ability to break down complex problems and guide the team to solutions without making anyone feel inadequate. Their positive energy is infectious and they throw the best team celebration parties.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Jordan Martinez (Profile ID 3)
  {
    profileId: 3,
    authorName: "Sofia Rodriguez",
    authorEmail: "sofia.r@email.com",
    relationship: "Best Friend",
    content: "Jordan has been my anchor for over a decade. They're the person I call when I need honest advice or just someone to listen. Their sense of humor can turn any bad day around, and their loyalty is unmatched. Plus they make incredible tacos from scratch.",
    ratings: { trustworthy: 5, fun: 5, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 3,
    authorName: "Carlos Martinez",
    authorEmail: "carlos.m@email.com",
    relationship: "Brother",
    content: "My sibling Jordan is one of those rare people who genuinely cares about everyone they meet. They've always been the peacemaker in our family and have this gift for seeing the best in people. Their empathy and emotional intelligence are remarkable.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },

  // Taylor Johnson (Profile ID 4)
  {
    profileId: 4,
    authorName: "Emma Thompson",
    authorEmail: "emma.t@email.com",
    relationship: "College Roommate",
    content: "Taylor was the most organized person in our entire dorm. They helped me pass calculus, organized amazing study groups, and somehow always had snacks for everyone. Their attention to detail and genuine care for others' success made college so much better.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 4,
    authorName: "Michael Chen",
    authorEmail: "m.chen@startup.com",
    relationship: "Business Partner",
    content: "Taylor's strategic thinking and execution skills are phenomenal. They can see three steps ahead while still paying attention to every detail. Working with them has taught me so much about building sustainable business practices and treating people right.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Casey Williams (Profile ID 5)
  {
    profileId: 5,
    authorName: "Zoe Anderson",
    authorEmail: "zoe.a@email.com",
    relationship: "Art Class Partner",
    content: "Casey sees the world through such a unique lens. Their creativity is boundless and they have this amazing ability to find beauty in everyday moments. They're also incredibly encouraging - they helped me find confidence in my own artistic voice.",
    ratings: { trustworthy: 4, fun: 5, caring: 5, ambitious: 4, reliable: 4 },
    approved: true
  },
  {
    profileId: 5,
    authorName: "Ryan Williams",
    authorEmail: "ryan.w@email.com",
    relationship: "Cousin",
    content: "Casey has always been the creative soul of our family. They're endlessly curious about the world and have this wonderful way of making ordinary moments feel special. Their passion for art and life is truly inspiring to be around.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 4, reliable: 4 },
    approved: true
  },

  // Riley Brown (Profile ID 6)
  {
    profileId: 6,
    authorName: "Jordan Davis",
    authorEmail: "j.davis@email.com",
    relationship: "Hiking Buddy",
    content: "Riley knows every trail in the state and always picks the most breathtaking routes. They're incredibly safety-conscious but never let that stop the adventure. They've taught me so much about respecting nature and pushing my own limits.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 6,
    authorName: "Dr. Sarah Mitchell",
    authorEmail: "s.mitchell@university.edu",
    relationship: "Professor",
    content: "Riley consistently demonstrates exceptional analytical thinking in environmental science. Their research on local ecosystems shows both scientific rigor and genuine passion for conservation. They're going to make a real difference in the field.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Sam Davis (Profile ID 7)
  {
    profileId: 7,
    authorName: "Alex Rivera",
    authorEmail: "alex.r@email.com",
    relationship: "Volunteer Coordinator",
    content: "Sam brings incredible energy to our community service projects. They can rally volunteers, organize complex logistics, and keep everyone motivated even during the most challenging days. Their commitment to helping others is genuinely inspiring.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 7,
    authorName: "Maria Santos",
    authorEmail: "m.santos@email.com",
    relationship: "Neighbor",
    content: "Sam is the kind of neighbor everyone wishes they had. They're always willing to help, whether it's watching pets, lending tools, or just being there when you need someone to talk to. Their kindness and reliability make our whole community better.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 3, reliable: 5 },
    approved: true
  },

  // Morgan Wilson (Profile ID 8)
  {
    profileId: 8,
    authorName: "Jessica Park",
    authorEmail: "j.park@email.com",
    relationship: "Travel Companion",
    content: "Morgan is the perfect travel partner - adventurous but responsible, always up for trying new things but never reckless. They've shown me some of the most amazing hidden gems and have this wonderful way of connecting with locals wherever we go.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 4, reliable: 4 },
    approved: true
  },
  {
    profileId: 8,
    authorName: "Dr. James Wilson",
    authorEmail: "j.wilson@email.com",
    relationship: "Father",
    content: "Morgan has always been curious and independent. They approach life with such enthusiasm and have this remarkable ability to find joy in simple moments. I'm incredibly proud of the compassionate, adventurous person they've become.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 4 },
    approved: true
  },

  // Avery Garcia (Profile ID 9)
  {
    profileId: 9,
    authorName: "Nina Rodriguez",
    authorEmail: "nina.r@email.com",
    relationship: "Book Club Member",
    content: "Avery brings such thoughtful perspectives to our discussions. They read everything from literary fiction to science journals and somehow connect ideas in ways that blow my mind. Their curiosity and depth of thinking make every conversation richer.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 9,
    authorName: "Dr. Robert Chen",
    authorEmail: "r.chen@library.org",
    relationship: "Research Mentor",
    content: "Avery's research skills and intellectual curiosity are exceptional. They approach every project with thoroughness and creativity, and their ability to synthesize complex information is remarkable. They're destined for great things in academia.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Nova Kim (Profile ID 10)
  {
    profileId: 10,
    authorName: "Jamie Lee",
    authorEmail: "jamie.l@email.com",
    relationship: "Dance Partner",
    content: "Nova brings such grace and power to every performance. They have this incredible ability to tell stories through movement and inspire everyone around them. Their dedication to their craft is matched only by their kindness to fellow dancers.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 10,
    authorName: "Luna Kim",
    authorEmail: "luna.k@email.com",
    relationship: "Sister",
    content: "Nova has always been the star of our family - literally and figuratively. They light up every room they enter and have this amazing gift for making people feel special. Their passion for dance is infectious and inspiring.",
    ratings: { trustworthy: 4, fun: 5, caring: 5, ambitious: 5, reliable: 4 },
    approved: true
  },

  // Phoenix Thompson (Profile ID 11)
  {
    profileId: 11,
    authorName: "Casey Morgan",
    authorEmail: "casey.m@email.com",
    relationship: "Writing Partner",
    content: "Phoenix has the most vivid imagination I've ever encountered. Their storytelling abilities are extraordinary, and they have this wonderful way of seeing magic in everyday moments. Collaborating with them has made me a better writer.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 11,
    authorName: "River Thompson",
    authorEmail: "river.t@family.com",
    relationship: "Sibling",
    content: "Phoenix is the dreamer in our family, always crafting stories and creating worlds. They're incredibly creative and have this beautiful way of expressing themselves. Their imagination knows no bounds.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 4, reliable: 3 },
    approved: true
  },

  // Sage Rodriguez (Profile ID 12)
  {
    profileId: 12,
    authorName: "Maya Patel",
    authorEmail: "maya.p@wellness.com",
    relationship: "Yoga Instructor",
    content: "Sage brings such mindfulness and peace to our practice. They have a natural gift for helping others find balance and inner calm. Their approach to wellness is holistic and genuinely transformative.",
    ratings: { trustworthy: 5, fun: 3, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 12,
    authorName: "Diego Rodriguez",
    authorEmail: "diego.r@email.com",
    relationship: "Brother",
    content: "Sage has always been the zen master of our family. They have this incredible ability to stay calm in any storm and help others find their center. Their wisdom and patience are truly remarkable.",
    ratings: { trustworthy: 5, fun: 3, caring: 5, ambitious: 3, reliable: 5 },
    approved: true
  },

  // River Patel (Profile ID 13)
  {
    profileId: 13,
    authorName: "Aspen Davis",
    authorEmail: "aspen.d@email.com",
    relationship: "Climbing Partner",
    content: "River is fearless but never reckless. They push boundaries safely and have taught me so much about outdoor skills and personal limits. Their love for adventure is matched by their respect for nature.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 13,
    authorName: "Dr. Priya Patel",
    authorEmail: "p.patel@email.com",
    relationship: "Mother",
    content: "River has always been our little adventurer. They approach life with such courage and curiosity. Their independence and strength make me proud every day, and their kind heart makes them truly special.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 4, reliable: 4 },
    approved: true
  },

  // Storm Nguyen (Profile ID 14)
  {
    profileId: 14,
    authorName: "Ocean Martinez",
    authorEmail: "ocean.m@email.com",
    relationship: "Band Member",
    content: "Storm's musical talent is absolutely phenomenal. They can pick up any instrument and make it sing. Their creativity and passion for music is infectious, and they're an incredible collaborator and friend.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 14,
    authorName: "Lily Nguyen",
    authorEmail: "lily.n@email.com",
    relationship: "Sister",
    content: "Storm has always marched to the beat of their own drum - literally! Their passion for music and creativity has inspired our whole family. They're incredibly talented and have this beautiful free spirit.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 4, reliable: 3 },
    approved: true
  },

  // Aurora Jackson (Profile ID 15)
  {
    profileId: 15,
    authorName: "Marcus Thompson",
    authorEmail: "marcus.t@email.com",
    relationship: "Best Friend",
    content: "Aurora is one of the most genuine people I know. She brings so much positive energy to everything she does and has this amazing ability to make everyone feel included. Her passion for environmental causes is inspiring and she walks the walk.",
    ratings: { trustworthy: 5, fun: 5, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 15,
    authorName: "Sarah Chen",
    authorEmail: "s.chen@company.com",
    relationship: "Coworker",
    content: "Working with Aurora has been incredible. She's creative, collaborative, and always brings fresh perspectives to our sustainability projects. She's also incredibly thoughtful - she organized a surprise birthday celebration for our teammate last month.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 4 },
    approved: true
  },

  // Kai Sanders (Profile ID 16)
  {
    profileId: 16,
    authorName: "Elena Rodriguez",
    authorEmail: "elena.r@email.com",
    relationship: "Sister",
    content: "Kai has always been the adventurous one in our family. He's constantly planning these amazing trips and somehow manages to capture the most beautiful moments. He's also incredibly patient - taught me how to use a camera when I was completely hopeless at it!",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 16,
    authorName: "David Park",
    authorEmail: "d.park@studio.com",
    relationship: "Photography Partner",
    content: "Kai's eye for composition is absolutely phenomenal. We've collaborated on several projects and he always brings this calm, focused energy that makes even the most chaotic shoots feel manageable. Plus he makes the best coffee on set.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Luna Cooper (Profile ID 17)
  {
    profileId: 17,
    authorName: "Isabella Martinez",
    authorEmail: "bella.m@email.com",
    relationship: "College Roommate",
    content: "Luna was the heart of our dorm floor. She organized study groups, movie nights, and somehow always knew when someone needed chocolate or a good laugh. Her empathy and emotional intelligence are off the charts - she's going to make an amazing therapist.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 17,
    authorName: "Dr. Rebecca Foster",
    authorEmail: "r.foster@university.edu",
    relationship: "Professor",
    content: "Luna consistently demonstrates exceptional insight in her psychology coursework. She has a natural ability to understand complex human dynamics and approaches every case study with both analytical rigor and genuine compassion.",
    ratings: { trustworthy: 5, fun: 3, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Phoenix Lee (Profile ID 18)
  {
    profileId: 18,
    authorName: "Alex Kim",
    authorEmail: "alex.k@techcorp.com",
    relationship: "Former Colleague",
    content: "Phoenix is a coding wizard but also one of the most down-to-earth people you'll meet. He mentored me through my first major project and always made time to explain complex concepts. He's also surprisingly funny - his developer memes are legendary.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 18,
    authorName: "Jamie Wu",
    authorEmail: "jamie.wu@email.com",
    relationship: "Gym Buddy",
    content: "Phoenix is incredibly dedicated and disciplined. He never misses our 6 AM workouts and always pushes me to be better. Despite being a tech genius, he's also great at explaining fitness form and keeping workouts fun with his playlist choices.",
    ratings: { trustworthy: 4, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Cedar Wright (Profile ID 19)
  {
    profileId: 19,
    authorName: "River Thompson",
    authorEmail: "river.t@email.com",
    relationship: "Hiking Partner",
    content: "Cedar knows every trail within 100 miles and always picks the most beautiful routes. They're incredibly knowledgeable about local wildlife and plants, and they've saved me from many questionable mushroom encounters. Safety-conscious but never takes the fun out of adventure.",
    ratings: { trustworthy: 5, fun: 5, caring: 4, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 19,
    authorName: "Morgan Davis",
    authorEmail: "m.davis@conservancy.org",
    relationship: "Conservation Team Lead",
    content: "Cedar brings such passion and expertise to our conservation efforts. They can identify bird calls from incredible distances and have this amazing ability to engage people of all ages in environmental education. Their dedication to protecting our local ecosystems is truly admirable.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 4, reliable: 5 },
    approved: true
  },

  // Ocean Rivera (Profile ID 20) 
  {
    profileId: 20,
    authorName: "Coral Martinez",
    authorEmail: "coral.m@email.com",
    relationship: "Swimming Coach",
    content: "Ocean is a natural in the water with incredible technique and endurance. They're also one of the most encouraging people I know - always helping newer swimmers build confidence. Their dedication to the sport is truly inspiring.",
    ratings: { trustworthy: 5, fun: 4, caring: 5, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 20,
    authorName: "Marina Rivera",
    authorEmail: "marina.r@email.com",
    relationship: "Sister",
    content: "Ocean has always been our water baby. They're incredibly disciplined with their training but also know how to have fun. Their determination and positive attitude make them amazing to be around.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Aspen Clark (Profile ID 21)
  {
    profileId: 21,
    authorName: "Willow Chen",
    authorEmail: "willow.c@email.com",
    relationship: "Hiking Buddy",
    content: "Aspen knows the wilderness like the back of their hand. They're incredibly knowledgeable about local flora and fauna, and their respect for nature is profound. They've taught me so much about outdoor survival and conservation.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 4, reliable: 5 },
    approved: true
  },
  {
    profileId: 21,
    authorName: "Forest Clark",
    authorEmail: "forest.c@email.com",
    relationship: "Father",
    content: "Aspen has always had this deep connection with nature. They're thoughtful, responsible, and have this wonderful way of finding peace in the outdoors. Their environmental consciousness makes me proud.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 4, reliable: 5 },
    approved: true
  },

  // Dakota Flores (Profile ID 22)
  {
    profileId: 22,
    authorName: "Sierra Kim",
    authorEmail: "sierra.k@email.com",
    relationship: "Art Class Partner",
    content: "Dakota has this incredible eye for color and composition. Their artistic vision is unique and powerful, and they're always willing to experiment with new techniques. Working with them has expanded my own creative horizons.",
    ratings: { trustworthy: 4, fun: 5, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 22,
    authorName: "Rosa Flores",
    authorEmail: "rosa.f@email.com",
    relationship: "Mother",
    content: "Dakota has always seen the world through an artist's eyes. They're incredibly creative and passionate about their work. Their dedication to their craft and their unique perspective make them truly special.",
    ratings: { trustworthy: 4, fun: 4, caring: 4, ambitious: 5, reliable: 4 },
    approved: true
  },

  // Rowan Mitchell (Profile ID 23)
  {
    profileId: 23,
    authorName: "Cedar Thompson",
    authorEmail: "cedar.t@email.com",
    relationship: "Study Partner",
    content: "Rowan has an incredible analytical mind and can break down the most complex problems. They're patient, methodical, and always willing to help others understand difficult concepts. Their academic dedication is inspiring.",
    ratings: { trustworthy: 5, fun: 3, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 23,
    authorName: "Dr. Alex Mitchell",
    authorEmail: "a.mitchell@university.edu",
    relationship: "Professor",
    content: "Rowan consistently demonstrates exceptional analytical thinking and academic rigor. Their research methodology is thorough and their insights are always well-reasoned. They're destined for great things in academia.",
    ratings: { trustworthy: 5, fun: 2, caring: 3, ambitious: 5, reliable: 5 },
    approved: true
  },

  // Sage Turner (Profile ID 24)
  {
    profileId: 24,
    authorName: "River Davis",
    authorEmail: "river.d@email.com",
    relationship: "Meditation Partner",
    content: "Sage brings such peace and wisdom to our practice. They have this natural ability to guide others toward inner calm and clarity. Their spiritual insights and gentle nature make them a wonderful teacher.",
    ratings: { trustworthy: 5, fun: 3, caring: 5, ambitious: 3, reliable: 5 },
    approved: true
  },
  {
    profileId: 24,
    authorName: "Phoenix Turner",
    authorEmail: "phoenix.t@email.com",
    relationship: "Sibling",
    content: "Sage has always been the wise one in our family. They have this incredible ability to stay centered and help others find their path. Their compassion and insight are truly remarkable.",
    ratings: { trustworthy: 5, fun: 3, caring: 5, ambitious: 3, reliable: 5 },
    approved: true
  },

  // Blake Morris (Profile ID 25)
  {
    profileId: 25,
    authorName: "Jordan Lee",
    authorEmail: "jordan.l@email.com",
    relationship: "Workout Partner",
    content: "Blake's fitness knowledge and motivation are incredible. They push me to be my best while always ensuring proper form and safety. Their positive energy and dedication make every workout session amazing.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  },
  {
    profileId: 25,
    authorName: "Taylor Morris",
    authorEmail: "taylor.m@email.com",
    relationship: "Cousin",
    content: "Blake has always been the most disciplined person in our family. Their commitment to health and fitness is inspiring, and they're always encouraging others to reach their goals. Their positive attitude is contagious.",
    ratings: { trustworthy: 5, fun: 4, caring: 4, ambitious: 5, reliable: 5 },
    approved: true
  }
];

// Remove the old Zara content since we're updating the profile names
/*
  // Zara Okafor (Profile ID 20)
  {
    profileId: 20,
    authorName: "Amara Johnson",
    authorEmail: "amara.j@email.com",
    relationship: "Dance Partner",
    content: "Zara is absolutely magnetic on the dance floor and in life. She has this incredible ability to make everyone around her feel confident and beautiful. She's taught me so much about self-expression and embracing joy. Plus she gives the best pep talks before big performances.",
    ratings: { trustworthy: 4, fun: 5, caring: 5, ambitious: 5, reliable: 4 },
    approved: true
  },
  {
    profileId: 20,
    authorName: "Marcus Williams",
    authorEmail: "m.williams@email.com",
    relationship: "Brother",
    content: "My sister Zara has always been a force of nature. She's incredibly driven and has worked so hard to build her dance career. She's also the most supportive person I know - she flew across the country just to be at my graduation. Her energy is absolutely contagious.",
    ratings: { trustworthy: 5, fun: 5, caring: 5, ambitious: 5, reliable: 4 },
    approved: true
  }
*/

export async function seedAllVouches() {
  console.log("🌟 Seeding all vouches for sample profiles...");
  
  try {
    for (const vouch of allVouches) {
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
    
    console.log(`✅ Successfully seeded ${allVouches.length} vouches for all profiles`);
  } catch (error) {
    console.error("❌ Error seeding vouches:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllVouches()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to seed vouches:", error);
      process.exit(1);
    });
}