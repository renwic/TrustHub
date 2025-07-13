import { db } from "./db";
import { profiles, testimonials, users } from "@shared/schema";

export const comprehensiveProfiles = [
  // Verified Profiles (85%+ trust score)
  {
    userId: "verified_1",
    name: "Alexandra Chen",
    age: 28,
    bio: "Software architect passionate about sustainable tech and rock climbing. I believe in building meaningful connections through shared adventures and deep conversations.",
    location: "San Francisco, CA",
    photos: ["https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"],
    interests: ["rock climbing", "sustainable technology", "cooking", "photography", "travel"],
    relationshipStatus: "single",
    height: "5'6\"",
    education: "Stanford University - Computer Science",
    occupation: "Senior Software Architect",
    vouches: [
      {
        authorName: "Sarah Martinez",
        relationship: "Best Friend (8 years)",
        content: "Alex is the most genuine and loyal person I know. She's incredibly intelligent, always puts others first, and has this amazing ability to see the best in everyone. Her integrity is unmatched.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 5,
        recommendationRating: 5
      },
      {
        authorName: "Michael Chen",
        relationship: "Brother",
        content: "My sister Alex is an incredible person with a heart of gold. She's achieved so much professionally while never losing her humility. Any partner would be lucky to have her support and love.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 4,
        recommendationRating: 5
      },
      {
        authorName: "David Kim",
        relationship: "Work Colleague",
        content: "Alex is not only brilliant technically but also an amazing team player. She mentors junior developers and always makes time to help others. Her work ethic and kindness are inspiring.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 4,
        recommendationRating: 5
      },
      {
        authorName: "Emma Thompson",
        relationship: "College Roommate",
        content: "Lived with Alex for 3 years and she was the best roommate ever. Super clean, considerate, and always up for adventures. She's genuine, smart, and has great judgment about people.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 5,
        recommendationRating: 5
      }
    ]
  },
  {
    userId: "verified_2",
    name: "Marcus Johnson",
    age: 32,
    bio: "Emergency room doctor who loves jazz music and marathon running. Looking for someone who appreciates both quiet evenings and spontaneous adventures.",
    location: "New York, NY",
    photos: ["https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"],
    interests: ["medicine", "jazz music", "marathon running", "cooking", "volunteering"],
    relationshipStatus: "single",
    height: "6'1\"",
    education: "Harvard Medical School",
    occupation: "Emergency Room Physician",
    vouches: [
      {
        authorName: "Lisa Rodriguez",
        relationship: "Medical School Friend",
        content: "Marcus is one of the most compassionate doctors I know. He genuinely cares about his patients and colleagues. Outside of work, he's incredibly fun and has this great sense of humor.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 5,
        recommendationRating: 5
      },
      {
        authorName: "James Johnson",
        relationship: "Father",
        content: "I'm incredibly proud of my son Marcus. He's dedicated, caring, and has always been there for our family. He deserves someone who will appreciate his big heart and ambition.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 4,
        recommendationRating: 5
      },
      {
        authorName: "Rachel Green",
        relationship: "Running Partner",
        content: "Marcus is my marathon training buddy and he's incredibly disciplined and motivating. He's also hilarious during our long runs and always keeps things positive even when it's tough.",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 4,
        funRating: 5,
        recommendationRating: 5
      }
    ]
  },
  {
    userId: "verified_3",
    name: "Sophia Williams",
    age: 26,
    bio: "Environmental lawyer and weekend pottery enthusiast. I'm passionate about making the world better and believe the best relationships are built on shared values and mutual growth.",
    location: "Portland, OR",
    photos: ["https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"],
    interests: ["environmental law", "pottery", "hiking", "sustainable living", "yoga"],
    relationshipStatus: "single",
    height: "5'7\"",
    education: "Yale Law School",
    occupation: "Environmental Lawyer",
    vouches: [
      {
        authorName: "Jennifer Adams",
        relationship: "Law School Study Partner",
        content: "Sophia is brilliant, driven, and incredibly ethical. She's the person you want in your corner when things get tough. She's also surprisingly funny and great at karaoke!",
        personalityRating: 5,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 4,
        recommendationRating: 5
      },
      {
        authorName: "Robert Williams",
        relationship: "Uncle",
        content: "Sophia has always been special. She's accomplished so much but never lost her kindness. She lights up every family gathering and would make an amazing partner for someone.",
        personalityRating: 5,
        reliabilityRating: 4,
        kindnessRating: 5,
        funRating: 5,
        recommendationRating: 5
      },
      {
        authorName: "Maya Patel",
        relationship: "Pottery Class Friend",
        content: "Met Sophia in pottery class and she's become such a good friend. She's creative, patient, and always willing to help others. Plus she makes the most beautiful ceramics!",
        personalityRating: 4,
        reliabilityRating: 5,
        kindnessRating: 5,
        funRating: 5,
        recommendationRating: 5
      }
    ]
  },

  // Trusted Profiles (70-84% trust score)
  {
    userId: "trusted_1",
    name: "Daniel Garcia",
    age: 29,
    bio: "Marketing director who loves craft beer and board games. Looking for someone to explore the city with and maybe start a collection of terrible movies.",
    location: "Austin, TX",
    photos: ["https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"],
    interests: ["marketing", "craft beer", "board games", "cycling", "music festivals"],
    relationshipStatus: "single",
    height: "5'10\"",
    education: "University of Texas - Business",
    occupation: "Marketing Director",
    vouches: [
      {
        authorName: "Carlos Rodriguez",
        relationship: "Best Friend",
        content: "Daniel is loyal, funny, and always up for an adventure. He's the friend who remembers your birthday and shows up when you need him. Great taste in beer too!",
        personalityRating: 4,
        reliabilityRating: 5,
        kindnessRating: 4,
        funRating: 5,
        recommendationRating: 4
      },
      {
        authorName: "Amanda Foster",
        relationship: "Work Colleague",
        content: "Daniel is creative, professional, and brings positive energy to every project. He's great at collaborating and always has innovative ideas. Really enjoy working with him.",
        personalityRating: 4,
        reliabilityRating: 4,
        kindnessRating: 4,
        funRating: 4,
        recommendationRating: 4
      }
    ]
  },
  {
    userId: "trusted_2",
    name: "Isabella Brown",
    age: 27,
    bio: "Graphic designer and amateur chef. I love creating beautiful things and believe life is better when shared with someone who appreciates art, food, and laughter.",
    location: "Seattle, WA",
    photos: ["https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg"],
    interests: ["graphic design", "cooking", "art museums", "coffee", "indie films"],
    relationshipStatus: "single",
    height: "5'5\"",
    education: "Art Institute of Seattle",
    occupation: "Senior Graphic Designer",
    vouches: [
      {
        authorName: "Chloe Martinez",
        relationship: "Roommate",
        content: "Bella is incredibly talented and has such great style. She's also super thoughtful and always remembers little details. Living with her has been amazing!",
        personalityRating: 4,
        reliabilityRating: 4,
        kindnessRating: 5,
        funRating: 4,
        recommendationRating: 4
      },
      {
        authorName: "Tom Wilson",
        relationship: "Creative Director",
        content: "Isabella consistently delivers outstanding work and is a pleasure to work with. She's creative, deadline-oriented, and brings fresh perspectives to every project.",
        personalityRating: 4,
        reliabilityRating: 5,
        kindnessRating: 4,
        funRating: 3,
        recommendationRating: 4
      }
    ]
  },

  // Emerging Profiles (50-69% trust score)
  {
    userId: "emerging_1",
    name: "Ryan Thompson",
    age: 25,
    bio: "Recent graduate working in finance. Love basketball and trying new restaurants. Still figuring things out but excited about the journey.",
    location: "Chicago, IL",
    photos: ["https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg"],
    interests: ["finance", "basketball", "food", "fitness", "video games"],
    relationshipStatus: "single",
    height: "6'0\"",
    education: "Northwestern University - Finance",
    occupation: "Financial Analyst",
    vouches: [
      {
        authorName: "Kevin Lee",
        relationship: "College Friend",
        content: "Ryan is a solid guy who's always there for his friends. He's hardworking and has a good sense of humor. Still growing into himself but has great potential.",
        personalityRating: 4,
        reliabilityRating: 4,
        kindnessRating: 4,
        funRating: 4,
        recommendationRating: 3
      }
    ]
  },
  {
    userId: "emerging_2",
    name: "Zoe Davis",
    age: 24,
    bio: "Teacher who loves reading and weekend hiking. Looking for someone genuine who enjoys deep conversations and outdoor adventures.",
    location: "Denver, CO",
    photos: ["https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg"],
    interests: ["teaching", "reading", "hiking", "yoga", "travel"],
    relationshipStatus: "single",
    height: "5'4\"",
    education: "University of Colorado - Education",
    occupation: "Elementary School Teacher",
    vouches: [
      {
        authorName: "Hannah Smith",
        relationship: "Teaching Colleague",
        content: "Zoe is wonderful with kids and brings such creativity to her classroom. She's kind, patient, and always willing to help other teachers. Really admire her dedication.",
        personalityRating: 4,
        reliabilityRating: 4,
        kindnessRating: 5,
        funRating: 3,
        recommendationRating: 4
      }
    ]
  },

  // New Profiles (under 50% trust score)
  {
    userId: "new_1",
    name: "Jake Miller",
    age: 23,
    bio: "Software developer new to the city. Love coding, gaming, and exploring local coffee shops.",
    location: "San Francisco, CA",
    photos: ["https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg"],
    interests: ["programming", "gaming", "coffee", "tech meetups"],
    relationshipStatus: "single",
    height: "5'9\"",
    education: "Coding Bootcamp Graduate",
    occupation: "Junior Software Developer",
    vouches: []
  },
  {
    userId: "new_2",
    name: "Lily Anderson",
    age: 22,
    bio: "Recent graduate exploring career options. Love art, music, and meeting new people.",
    location: "Los Angeles, CA",
    photos: ["https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg"],
    interests: ["art", "music", "photography", "social media"],
    relationshipStatus: "single",
    height: "5'3\"",
    education: "UCLA - Liberal Arts",
    occupation: "Freelance Creator",
    vouches: []
  },
  {
    userId: "new_3",
    name: "Ethan Clark",
    age: 26,
    bio: "New to online dating. Work in sales and enjoy sports and weekend adventures.",
    location: "Miami, FL",
    photos: ["https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"],
    interests: ["sales", "sports", "beach", "nightlife"],
    relationshipStatus: "single",
    height: "5'11\"",
    education: "University of Miami - Business",
    occupation: "Sales Representative",
    vouches: []
  },
  {
    userId: "new_4",
    name: "Ava Martinez",
    age: 25,
    bio: "Nurse who just moved here for work. Love helping others and exploring new places in my free time.",
    location: "Boston, MA",
    photos: ["https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"],
    interests: ["nursing", "healthcare", "fitness", "travel"],
    relationshipStatus: "single",
    height: "5'6\"",
    education: "Boston University - Nursing",
    occupation: "Registered Nurse",
    vouches: []
  }
];

export async function populateComprehensiveProfiles() {
  console.log("Starting comprehensive profile population...");
  
  for (const profileData of comprehensiveProfiles) {
    try {
      const { vouches, ...profileInfo } = profileData;
      
      // First create the user if they don't exist
      await db
        .insert(users)
        .values({
          id: profileInfo.userId,
          email: `${profileInfo.userId}@example.com`,
          firstName: profileInfo.name.split(' ')[0],
          lastName: profileInfo.name.split(' ')[1] || '',
        })
        .onConflictDoNothing();
      
      // Create the profile
      const [profile] = await db
        .insert(profiles)
        .values(profileInfo)
        .onConflictDoNothing()
        .returning();

      if (!profile) {
        console.log(`Profile ${profileData.name} already exists, skipping...`);
        continue;
      }

      console.log(`Created/updated profile: ${profile.name}`);

      // Create vouches for this profile
      for (const vouchData of vouches) {
        await db
          .insert(testimonials)
          .values({
            profileId: profile.id,
            authorName: vouchData.authorName,
            relationship: vouchData.relationship,
            content: vouchData.content,
            ratings: {
              personality: vouchData.personalityRating,
              reliability: vouchData.reliabilityRating,
              kindness: vouchData.kindnessRating,
              fun: vouchData.funRating,
              recommendation: vouchData.recommendationRating,
            },
            approved: true,
          })
          .onConflictDoNothing();
      }

      console.log(`Created ${vouches.length} vouches for ${profile.name}`);
    } catch (error) {
      console.error(`Error creating profile ${profileData.name}:`, error);
    }
  }
  
  console.log("Comprehensive profile population completed!");
}