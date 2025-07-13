import { db } from './db';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import type { UpsertUser, InsertProfile } from '@shared/schema';

const additionalUsers: Array<UpsertUser & { password?: string }> = [
  // Additional diverse profiles for a rich dating experience
  {
    id: 'sample_9',
    email: 'nova.kim@example.com',
    firstName: 'Nova',
    lastName: 'Kim',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_10',
    email: 'phoenix.thompson@example.com',
    firstName: 'Phoenix',
    lastName: 'Thompson',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_11',
    email: 'sage.rodriguez@example.com',
    firstName: 'Sage',
    lastName: 'Rodriguez',
    profileImageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_12',
    email: 'river.patel@example.com',
    firstName: 'River',
    lastName: 'Patel',
    profileImageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_13',
    email: 'storm.nguyen@example.com',
    firstName: 'Storm',
    lastName: 'Nguyen',
    profileImageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_14',
    email: 'aurora.jackson@example.com',
    firstName: 'Aurora',
    lastName: 'Jackson',
    profileImageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_15',
    email: 'kai.sanders@example.com',
    firstName: 'Kai',
    lastName: 'Sanders',
    profileImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_16',
    email: 'luna.cooper@example.com',
    firstName: 'Luna',
    lastName: 'Cooper',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_17',
    email: 'phoenix.lee@example.com',
    firstName: 'Phoenix',
    lastName: 'Lee',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_18',
    email: 'cedar.wright@example.com',
    firstName: 'Cedar',
    lastName: 'Wright',
    profileImageUrl: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_19',
    email: 'ocean.rivera@example.com',
    firstName: 'Ocean',
    lastName: 'Rivera',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_20',
    email: 'aspen.clark@example.com',
    firstName: 'Aspen',
    lastName: 'Clark',
    profileImageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_21',
    email: 'dakota.flores@example.com',
    firstName: 'Dakota',
    lastName: 'Flores',
    profileImageUrl: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_22',
    email: 'rowan.mitchell@example.com',
    firstName: 'Rowan',
    lastName: 'Mitchell',
    profileImageUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_23',
    email: 'sage.turner@example.com',
    firstName: 'Sage',
    lastName: 'Turner',
    profileImageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_24',
    email: 'blake.morris@example.com',
    firstName: 'Blake',
    lastName: 'Morris',
    profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    provider: 'sample',
    password: 'password123'
  }
];

const additionalProfiles: Omit<InsertProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: 'sample_9',
    name: 'Nova Kim',
    bio: 'Astrophysicist and stargazing enthusiast 🌌 Passionate about space exploration and discovering the universe. Love science museums and planetarium dates!',
    age: 29,
    location: 'Houston, TX',
    interests: ['Astronomy', 'Science', 'Space', 'Museums', 'Photography'],
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 167,
    education: 'PhD in Astrophysics',
    occupation: 'Science & Research'
  },
  {
    userId: 'sample_10',
    name: 'Phoenix Thompson',
    bio: 'Professional dancer and choreographer 💃 Creating movement that tells stories. Always looking for dance partners and adventure buddies!',
    age: 24,
    location: 'Miami, FL',
    interests: ['Dance', 'Choreography', 'Theatre', 'Music', 'Fitness'],
    photos: [
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 170,
    education: 'BFA in Dance Performance',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_11',
    name: 'Sage Rodriguez',
    bio: 'Environmental lawyer fighting climate change ⚖️🌱 Passionate about sustainability, hiking, and making the world better for future generations.',
    age: 33,
    location: 'Portland, OR',
    interests: ['Environmental Law', 'Sustainability', 'Hiking', 'Activism', 'Gardening'],
    photos: [
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572276596237-5db2c3e16c5d?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 173,
    education: 'JD Environmental Law',
    occupation: 'Legal'
  },
  {
    userId: 'sample_12',
    name: 'River Patel',
    bio: 'Adventure photographer capturing life\'s wild moments 📸🏔️ Always chasing the perfect sunset and authentic stories. Let\'s explore together!',
    age: 28,
    location: 'Boulder, CO',
    interests: ['Photography', 'Adventure Travel', 'Mountaineering', 'Storytelling', 'Camping'],
    photos: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150a961b9e2?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 178,
    education: 'Fine Arts Photography',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_13',
    name: 'Storm Nguyen',
    bio: 'Emergency room doctor saving lives daily 🏥❤️ High-energy lifestyle balanced with meditation. Looking for someone who understands dedication.',
    age: 31,
    location: 'Chicago, IL',
    interests: ['Medicine', 'Emergency Care', 'Meditation', 'Running', 'Travel'],
    photos: [
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 165,
    education: 'MD Emergency Medicine',
    occupation: 'Healthcare'
  },
  {
    userId: 'sample_14',
    name: 'Aurora Jackson',
    bio: 'Film director bringing stories to life 🎬✨ Currently working on my first feature film. Love indie cinema, coffee talks, and creative collaborations.',
    age: 27,
    location: 'Los Angeles, CA',
    interests: ['Filmmaking', 'Cinema', 'Storytelling', 'Coffee', 'Art'],
    photos: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1478720568477-b0208355bfda?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 168,
    education: 'MFA Film Directing',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_15',
    name: 'Kai Sanders',
    bio: 'Marine conservation scientist protecting our oceans 🌊🐠 Spend my days diving with sharks and my evenings planning conservation efforts.',
    age: 30,
    location: 'San Diego, CA',
    interests: ['Marine Biology', 'Scuba Diving', 'Conservation', 'Surfing', 'Ocean Photography'],
    photos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b8?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 182,
    education: 'PhD Marine Conservation',
    occupation: 'Science & Research'
  },
  {
    userId: 'sample_16',
    name: 'Luna Cooper',
    bio: 'Pastry chef creating edible art 🧁🎨 Obsessed with flavors, textures, and making people smile through desserts. Baking is my love language!',
    age: 26,
    location: 'Nashville, TN',
    interests: ['Baking', 'Pastry Arts', 'Food Styling', 'Music', 'Art'],
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1556909114-3d85ad21d5b6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587736604968-7b48a6f01eed?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 163,
    education: 'Culinary Institute Pastry Arts',
    occupation: 'Food & Hospitality'
  },
  {
    userId: 'sample_17',
    name: 'Phoenix Lee',
    bio: 'Software architect building the future 💻🚀 Love solving complex problems and creating elegant solutions. Gaming and hiking enthusiast!',
    age: 29,
    location: 'San Francisco, CA',
    interests: ['Software Development', 'Gaming', 'Hiking', 'Tech Innovation', 'Board Games'],
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 175,
    education: 'MS Computer Science',
    occupation: 'Technology'
  },
  {
    userId: 'sample_18',
    name: 'Cedar Wright',
    bio: 'Wilderness guide and survival instructor 🏕️⛰️ Teaching people to connect with nature. Looking for someone who loves the outdoors as much as I do.',
    age: 32,
    location: 'Anchorage, AK',
    interests: ['Wilderness Survival', 'Rock Climbing', 'Kayaking', 'Camping', 'Nature Photography'],
    photos: [
      'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1551524164-6cf4ac833fb5?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150a961b9e2?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 185,
    education: 'Wilderness Leadership Certificate',
    occupation: 'Outdoor Recreation'
  },
  {
    userId: 'sample_19',
    name: 'Ocean Rivera',
    bio: 'Fashion designer with sustainable vision 👗🌱 Creating beautiful clothes that don\'t harm our planet. Love vintage markets and ethical fashion.',
    age: 25,
    location: 'New York, NY',
    interests: ['Sustainable Fashion', 'Design', 'Vintage Shopping', 'Art', 'Environmental Consciousness'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 170,
    education: 'BFA Fashion Design',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_20',
    name: 'Aspen Clark',
    bio: 'Renewable energy engineer powering the future ⚡🌞 Working on solar and wind projects. Love sustainability, cycling, and clean technology.',
    age: 28,
    location: 'Phoenix, AZ',
    interests: ['Renewable Energy', 'Cycling', 'Technology', 'Sustainability', 'Engineering'],
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 172,
    education: 'MS Renewable Energy Engineering',
    occupation: 'Engineering'
  },
  {
    userId: 'sample_21',
    name: 'Dakota Flores',
    bio: 'Professional athlete and fitness coach 🏃‍♀️💪 Olympic marathon trials qualifier. Helping others achieve their fitness goals and live their best life.',
    age: 26,
    location: 'Eugene, OR',
    interests: ['Running', 'Fitness Coaching', 'Nutrition', 'Sports Psychology', 'Outdoor Training'],
    photos: [
      'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 168,
    education: 'BS Exercise Science',
    occupation: 'Fitness & Sports'
  },
  {
    userId: 'sample_22',
    name: 'Rowan Mitchell',
    bio: 'Jazz musician and music teacher 🎷🎶 Playing in local clubs and teaching the next generation. Music is the universal language of love.',
    age: 34,
    location: 'New Orleans, LA',
    interests: ['Jazz Music', 'Teaching', 'Saxophone', 'Live Performance', 'Music History'],
    photos: [
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 180,
    education: 'Master of Music Performance',
    occupation: 'Education & Music'
  },
  {
    userId: 'sample_23',
    name: 'Sage Turner',
    bio: 'Wildlife photographer documenting endangered species 📸🦋 Traveling the world to capture nature\'s beauty before it\'s gone. Adventure awaits!',
    age: 30,
    location: 'Missoula, MT',
    interests: ['Wildlife Photography', 'Conservation', 'Travel', 'Nature', 'Environmental Advocacy'],
    photos: [
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 165,
    education: 'BA Wildlife Biology',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_24',
    name: 'Blake Morris',
    bio: 'Craft brewery owner brewing happiness 🍺🌾 Creating unique flavors and building community. Love local food, live music, and good conversations.',
    age: 35,
    location: 'Asheville, NC',
    interests: ['Craft Brewing', 'Entrepreneurship', 'Local Food', 'Live Music', 'Community Building'],
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 183,
    education: 'Business Management',
    occupation: 'Food & Hospitality'
  }
];

export async function seedAdditionalProfiles() {
  try {
    console.log('Adding more sample profiles...');

    // Create additional users
    for (const userData of additionalUsers) {
      const { password, ...userWithoutPassword } = userData;
      
      // Hash password if it exists
      if (password) {
        userWithoutPassword.passwordHash = await bcrypt.hash(password, 10);
      }
      
      await storage.upsertUser(userWithoutPassword);
      console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
    }

    // Create additional profiles
    for (const profileData of additionalProfiles) {
      await storage.createProfile(profileData);
      console.log(`Created profile for user: ${profileData.userId}`);
    }

    console.log('Additional profile seeding completed successfully!');
    console.log(`Added ${additionalUsers.length} more users and ${additionalProfiles.length} more profiles`);
    
  } catch (error) {
    console.error('Error seeding additional profiles:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdditionalProfiles()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}