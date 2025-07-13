import { db } from './db';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import type { UpsertUser, InsertProfile } from '@shared/schema';

const sampleUsers: Array<UpsertUser & { password?: string }> = [
  {
    id: 'sample_1',
    email: 'alex.chen@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    profileImageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_2', 
    email: 'jordan.martinez@example.com',
    firstName: 'Jordan',
    lastName: 'Martinez',
    profileImageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_3',
    email: 'taylor.johnson@example.com', 
    firstName: 'Taylor',
    lastName: 'Johnson',
    profileImageUrl: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_4',
    email: 'casey.williams@example.com',
    firstName: 'Casey',
    lastName: 'Williams', 
    profileImageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_5',
    email: 'riley.brown@example.com',
    firstName: 'Riley',
    lastName: 'Brown',
    profileImageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_6',
    email: 'sam.davis@example.com',
    firstName: 'Sam',
    lastName: 'Davis',
    profileImageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_7',
    email: 'morgan.wilson@example.com',
    firstName: 'Morgan',
    lastName: 'Wilson',
    profileImageUrl: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_8',
    email: 'avery.garcia@example.com',
    firstName: 'Avery',
    lastName: 'Garcia',
    profileImageUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  }
];

const sampleProfiles: Omit<InsertProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: 'sample_1',
    name: 'Alex Chen',
    bio: 'Adventure seeker and coffee enthusiast ☕ Love hiking, photography, and discovering new places. Always up for spontaneous road trips!',
    age: 28,
    location: 'San Francisco, CA',
    interests: ['Photography', 'Hiking', 'Travel', 'Coffee', 'Art'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 175,
    education: 'Software Engineer at Meta',
    occupation: 'Technology'
  },
  {
    userId: 'sample_2',
    name: 'Jordan Martinez',
    bio: 'Yoga instructor by day, stargazer by night 🌟 Passionate about wellness, mindfulness, and creating meaningful connections.',
    age: 26,
    location: 'Los Angeles, CA', 
    interests: ['Yoga', 'Meditation', 'Astronomy', 'Cooking', 'Dancing'],
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506629905607-24bf3a045b2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 165,
    education: 'Certified Yoga Instructor',
    occupation: 'Health & Wellness'
  },
  {
    userId: 'sample_3',
    name: 'Taylor Johnson',
    bio: 'Musician and music producer 🎵 When I\'m not in the studio, you can find me at live shows or exploring the city\'s food scene.',
    age: 30,
    location: 'Austin, TX',
    interests: ['Music', 'Food', 'Concerts', 'Vinyl Records', 'Cycling'],
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 180,
    education: 'Berklee College of Music',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_4',
    name: 'Casey Williams',
    bio: 'Marine biologist with a passion for ocean conservation 🌊 Love scuba diving, beach volleyball, and good books by the sea.',
    age: 29,
    location: 'San Diego, CA',
    interests: ['Scuba Diving', 'Marine Biology', 'Beach Volleyball', 'Reading', 'Conservation'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 168,
    education: 'PhD in Marine Biology',
    occupation: 'Science & Research'
  },
  {
    userId: 'sample_5',
    name: 'Riley Brown',
    bio: 'Chef and food blogger 👨‍🍳 I believe the best conversations happen over good food. Let me cook for you!',
    age: 32,
    location: 'New York, NY',
    interests: ['Cooking', 'Food Photography', 'Wine Tasting', 'Travel', 'Blogging'],
    photos: [
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 178,
    education: 'Culinary Institute of America',
    occupation: 'Food & Hospitality'
  },
  {
    userId: 'sample_6',
    name: 'Sam Davis',
    bio: 'Pediatric nurse and weekend rock climber 🧗‍♀️ Love helping others and seeking thrills in equal measure.',
    age: 27,
    location: 'Denver, CO',
    interests: ['Rock Climbing', 'Nursing', 'Hiking', 'Volunteering', 'Skiing'],
    photos: [
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 163,
    education: 'BSN in Nursing',
    occupation: 'Healthcare'
  },
  {
    userId: 'sample_7',
    name: 'Morgan Wilson',
    bio: 'Graphic designer and digital nomad ✈️ Currently exploring the Pacific Northwest. Love coffee shops, good design, and mountain views.',
    age: 25,
    location: 'Seattle, WA',
    interests: ['Design', 'Travel', 'Coffee', 'Mountains', 'Digital Art'],
    photos: [
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 170,
    education: 'BFA in Graphic Design',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_8',
    name: 'Avery Garcia',
    bio: 'Veterinarian and animal rescue volunteer 🐕 Passionate about animal welfare and outdoor adventures with my rescue dog, Luna.',
    age: 31,
    location: 'Portland, OR',
    interests: ['Veterinary Medicine', 'Animal Rescue', 'Hiking', 'Dogs', 'Environmental Conservation'],
    photos: [
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 172,
    education: 'Doctor of Veterinary Medicine',
    occupation: 'Healthcare'
  }
];

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create sample users
    for (const userData of sampleUsers) {
      const { password, ...userWithoutPassword } = userData;
      
      // Hash password if it exists
      if (password) {
        userWithoutPassword.passwordHash = await bcrypt.hash(password, 10);
      }
      
      await storage.upsertUser(userWithoutPassword);
      console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
    }

    // Create sample profiles
    for (const profileData of sampleProfiles) {
      await storage.createProfile(profileData);
      console.log(`Created profile for user: ${profileData.userId}`);
    }

    // Add sample vouches (testimonials)
    await seedSampleVouches();

    console.log('Database seeding completed successfully!');
    console.log(`Created ${sampleUsers.length} users and ${sampleProfiles.length} profiles`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function seedSampleVouches() {
  console.log("🌟 Seeding sample vouches...");
  
  const sampleVouches = [
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
    }
  ];
  
  try {
    for (const vouch of sampleVouches) {
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
    
    console.log(`✅ Successfully seeded ${sampleVouches.length} vouches`);
  } catch (error) {
    console.error("❌ Error seeding vouches:", error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}