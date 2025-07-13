export const sampleReferences = [
  // Aurora Jackson (Profile ID 15)
  {
    profileId: 15,
    authorName: "Marcus Thompson",
    authorEmail: "marcus.t@email.com",
    relationship: "Best Friend",
    content: "Aurora is one of the most genuine people I know. She brings so much positive energy to everything she does and has this amazing ability to make everyone feel included. Her passion for environmental causes is inspiring and she walks the walk.",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 5,
      ambitious: 4,
      reliable: 5
    },
    approved: true
  },
  {
    profileId: 15,
    authorName: "Sarah Chen",
    authorEmail: "s.chen@company.com",
    relationship: "Coworker",
    content: "Working with Aurora has been incredible. She's creative, collaborative, and always brings fresh perspectives to our sustainability projects. She's also incredibly thoughtful - she organized a surprise birthday celebration for our teammate last month.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 5,
      ambitious: 5,
      reliable: 4
    },
    approved: true
  },

  // Kai Suzuki (Profile ID 16)
  {
    profileId: 16,
    authorName: "Elena Rodriguez",
    authorEmail: "elena.r@email.com",
    relationship: "Sister",
    content: "Kai has always been the adventurous one in our family. He's constantly planning these amazing trips and somehow manages to capture the most beautiful moments. He's also incredibly patient - taught me how to use a camera when I was completely hopeless at it!",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 4,
      ambitious: 5,
      reliable: 4
    },
    approved: true
  },
  {
    profileId: 16,
    authorName: "David Park",
    authorEmail: "d.park@studio.com",
    relationship: "Photography Partner",
    content: "Kai's eye for composition is absolutely phenomenal. We've collaborated on several projects and he always brings this calm, focused energy that makes even the most chaotic shoots feel manageable. Plus he makes the best coffee on set.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 4,
      ambitious: 5,
      reliable: 5
    },
    approved: true
  },

  // Luna Rodriguez (Profile ID 17)
  {
    profileId: 17,
    authorName: "Isabella Martinez",
    authorEmail: "bella.m@email.com",
    relationship: "College Roommate",
    content: "Luna was the heart of our dorm floor. She organized study groups, movie nights, and somehow always knew when someone needed chocolate or a good laugh. Her empathy and emotional intelligence are off the charts - she's going to make an amazing therapist.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 5,
      ambitious: 4,
      reliable: 5
    },
    approved: true
  },
  {
    profileId: 17,
    authorName: "Dr. Rebecca Foster",
    authorEmail: "r.foster@university.edu",
    relationship: "Professor",
    content: "Luna consistently demonstrates exceptional insight in her psychology coursework. She has a natural ability to understand complex human dynamics and approaches every case study with both analytical rigor and genuine compassion.",
    ratings: {
      trustworthy: 5,
      fun: 3,
      caring: 5,
      ambitious: 5,
      reliable: 5
    },
    approved: true
  },

  // Phoenix Lee (Profile ID 18)
  {
    profileId: 18,
    authorName: "Alex Kim",
    authorEmail: "alex.k@techcorp.com",
    relationship: "Former Colleague",
    content: "Phoenix is a coding wizard but also one of the most down-to-earth people you'll meet. He mentored me through my first major project and always made time to explain complex concepts. He's also surprisingly funny - his developer memes are legendary.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 4,
      ambitious: 5,
      reliable: 5
    },
    approved: true
  },
  {
    profileId: 18,
    authorName: "Jamie Wu",
    authorEmail: "jamie.wu@email.com",
    relationship: "Gym Buddy",
    content: "Phoenix is incredibly dedicated and disciplined. He never misses our 6 AM workouts and always pushes me to be better. Despite being a tech genius, he's also great at explaining fitness form and keeping workouts fun with his playlist choices.",
    ratings: {
      trustworthy: 4,
      fun: 4,
      caring: 4,
      ambitious: 5,
      reliable: 5
    },
    approved: true
  },

  // Cedar Williams (Profile ID 19)
  {
    profileId: 19,
    authorName: "River Thompson",
    authorEmail: "river.t@email.com",
    relationship: "Hiking Partner",
    content: "Cedar knows every trail within 100 miles and always picks the most beautiful routes. They're incredibly knowledgeable about local wildlife and plants, and they've saved me from many questionable mushroom encounters. Safety-conscious but never takes the fun out of adventure.",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 4,
      ambitious: 4,
      reliable: 5
    },
    approved: true
  },
  {
    profileId: 19,
    authorName: "Morgan Davis",
    authorEmail: "m.davis@conservancy.org",
    relationship: "Conservation Team Lead",
    content: "Cedar brings such passion and expertise to our conservation efforts. They can identify bird calls from incredible distances and have this amazing ability to engage people of all ages in environmental education. Their dedication to protecting our local ecosystems is truly admirable.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 5,
      ambitious: 4,
      reliable: 5
    },
    approved: true
  },

  // Zara Okafor (Profile ID 20)
  {
    profileId: 20,
    authorName: "Amara Johnson",
    authorEmail: "amara.j@email.com",
    relationship: "Dance Partner",
    content: "Zara is absolutely magnetic on the dance floor and in life. She has this incredible ability to make everyone around her feel confident and beautiful. She's taught me so much about self-expression and embracing joy. Plus she gives the best pep talks before big performances.",
    ratings: {
      trustworthy: 4,
      fun: 5,
      caring: 5,
      ambitious: 5,
      reliable: 4
    },
    approved: true
  },
  {
    profileId: 20,
    authorName: "Marcus Williams",
    authorEmail: "m.williams@email.com",
    relationship: "Brother",
    content: "My sister Zara has always been a force of nature. She's incredibly driven and has worked so hard to build her dance career. She's also the most supportive person I know - she flew across the country just to be at my graduation. Her energy is absolutely contagious.",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 5,
      ambitious: 5,
      reliable: 4
    },
    approved: true
  }
];

export async function seedReferences(storage: any) {
  console.log("🌟 Seeding sample references...");
  
  try {
    for (const reference of sampleReferences) {
      await storage.createTestimonial({
        profileId: reference.profileId,
        authorName: reference.authorName,
        authorEmail: reference.authorEmail,
        relationship: reference.relationship,
        content: reference.content,
        ratings: reference.ratings,
        approved: reference.approved
      });
    }
    
    console.log(`✅ Successfully seeded ${sampleReferences.length} references`);
  } catch (error) {
    console.error("❌ Error seeding references:", error);
  }
}