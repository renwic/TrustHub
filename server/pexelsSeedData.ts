import { db } from './db';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import type { UpsertUser, InsertProfile } from '@shared/schema';

const allSampleUsers: Array<UpsertUser & { password?: string }> = [
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
  },
  // Extended profiles with Pexels images
  {
    id: 'sample_9',
    email: 'nova.kim@example.com',
    firstName: 'Nova',
    lastName: 'Kim',
    profileImageUrl: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_10',
    email: 'phoenix.thompson@example.com',
    firstName: 'Phoenix',
    lastName: 'Thompson',
    profileImageUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_11',
    email: 'sage.rodriguez@example.com',
    firstName: 'Sage',
    lastName: 'Rodriguez',
    profileImageUrl: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_12',
    email: 'river.patel@example.com',
    firstName: 'River',
    lastName: 'Patel',
    profileImageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_13',
    email: 'storm.nguyen@example.com',
    firstName: 'Storm',
    lastName: 'Nguyen',
    profileImageUrl: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_14',
    email: 'aurora.jackson@example.com',
    firstName: 'Aurora',
    lastName: 'Jackson',
    profileImageUrl: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_15',
    email: 'kai.sanders@example.com',
    firstName: 'Kai',
    lastName: 'Sanders',
    profileImageUrl: 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_16',
    email: 'luna.cooper@example.com',
    firstName: 'Luna',
    lastName: 'Cooper',
    profileImageUrl: 'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_17',
    email: 'phoenix.lee@example.com',
    firstName: 'Phoenix',
    lastName: 'Lee',
    profileImageUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_18',
    email: 'cedar.wright@example.com',
    firstName: 'Cedar',
    lastName: 'Wright',
    profileImageUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_19',
    email: 'ocean.rivera@example.com',
    firstName: 'Ocean',
    lastName: 'Rivera',
    profileImageUrl: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_20',
    email: 'aspen.clark@example.com',
    firstName: 'Aspen',
    lastName: 'Clark',
    profileImageUrl: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_21',
    email: 'dakota.flores@example.com',
    firstName: 'Dakota',
    lastName: 'Flores',
    profileImageUrl: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_22',
    email: 'rowan.mitchell@example.com',
    firstName: 'Rowan',
    lastName: 'Mitchell',
    profileImageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_23',
    email: 'sage.turner@example.com',
    firstName: 'Sage',
    lastName: 'Turner',
    profileImageUrl: 'https://images.pexels.com/photos/1321909/pexels-photo-1321909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  },
  {
    id: 'sample_24',
    email: 'blake.morris@example.com',
    firstName: 'Blake',
    lastName: 'Morris',
    profileImageUrl: 'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    provider: 'sample',
    password: 'password123'
  }
];

const allSampleProfiles: Omit<InsertProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: 'sample_1',
    name: 'Alex Chen',
    bio: 'Adventure seeker and coffee enthusiast ☕ Love hiking, photography, and discovering new places. Always up for spontaneous road trips!',
    age: 28,
    location: 'San Francisco, CA',
    interests: ['Photography', 'Hiking', 'Travel', 'Coffee', 'Art'],
    photos: [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
    interests: ['Music', 'Production', 'Food', 'Concerts', 'Art'],
    photos: [
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1321909/pexels-photo-1321909.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 172,
    education: 'Berklee College of Music',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_4',
    name: 'Casey Williams',
    bio: 'Travel blogger documenting hidden gems around the world 🌍 Currently writing a book about sustainable tourism. Let\'s explore together!',
    age: 27,
    location: 'Denver, CO',
    interests: ['Travel', 'Writing', 'Photography', 'Sustainability', 'Culture'],
    photos: [
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 168,
    education: 'BA Journalism',
    occupation: 'Media & Communications'
  },
  {
    userId: 'sample_5',
    name: 'Riley Brown',
    bio: 'Veterinarian with a passion for animal rescue 🐕 Spend weekends volunteering at shelters. Looking for someone who loves animals as much as I do!',
    age: 29,
    location: 'Portland, OR',
    interests: ['Animals', 'Veterinary Medicine', 'Volunteering', 'Hiking', 'Reading'],
    photos: [
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 163,
    education: 'DVM Veterinary Medicine',
    occupation: 'Healthcare'
  },
  {
    userId: 'sample_6',
    name: 'Sam Davis',
    bio: 'Freelance graphic designer creating visual stories 🎨 Love comic books, board games, and anything that sparks creativity. Let\'s make something beautiful!',
    age: 25,
    location: 'Seattle, WA',
    interests: ['Design', 'Comics', 'Board Games', 'Art', 'Film'],
    photos: [
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'casual',
    height: 180,
    education: 'BFA Graphic Design',
    occupation: 'Creative Arts'
  },
  {
    userId: 'sample_7',
    name: 'Morgan Wilson',
    bio: 'Personal trainer helping people achieve their fitness goals 💪 Marathon runner, rock climber, and healthy cooking enthusiast. Swipe right for workout tips!',
    age: 31,
    location: 'Miami, FL',
    interests: ['Fitness', 'Marathon Running', 'Rock Climbing', 'Nutrition', 'Outdoors'],
    photos: [
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 178,
    education: 'Certified Personal Trainer',
    occupation: 'Fitness & Sports'
  },
  {
    userId: 'sample_8',
    name: 'Avery Garcia',
    bio: 'Elementary school teacher nurturing young minds 📚 Love children\'s literature, weekend farmer\'s markets, and cozy movie nights. Seeking genuine connection!',
    age: 26,
    location: 'Nashville, TN',
    interests: ['Teaching', 'Literature', 'Farmer\'s Markets', 'Movies', 'Gardening'],
    photos: [
      'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 165,
    education: 'MEd Elementary Education',
    occupation: 'Education'
  },
  // Extended profiles
  {
    userId: 'sample_9',
    name: 'Nova Kim',
    bio: 'Astrophysicist and stargazing enthusiast 🌌 Passionate about space exploration and discovering the universe. Love science museums and planetarium dates!',
    age: 29,
    location: 'Houston, TX',
    interests: ['Astronomy', 'Science', 'Space', 'Museums', 'Photography'],
    photos: [
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/936032/pexels-photo-936032.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/936032/pexels-photo-936032.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1321909/pexels-photo-1321909.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/936032/pexels-photo-936032.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/936032/pexels-photo-936032.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1321909/pexels-photo-1321909.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
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
      'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
    ],
    relationshipGoal: 'serious',
    height: 183,
    education: 'Business Management',
    occupation: 'Food & Hospitality'
  }
];

export async function seedAllProfilesWithPexels() {
  try {
    console.log('Seeding all profiles with Pexels images...');

    // Create all users
    for (const userData of allSampleUsers) {
      const { password, ...userWithoutPassword } = userData;
      
      // Hash password if it exists
      if (password) {
        userWithoutPassword.passwordHash = await bcrypt.hash(password, 10);
      }
      
      await storage.upsertUser(userWithoutPassword);
      console.log(`Created user: ${userData.firstName} ${userData.lastName}`);
    }

    // Create all profiles
    for (const profileData of allSampleProfiles) {
      await storage.createProfile(profileData);
      console.log(`Created profile for user: ${profileData.userId}`);
    }

    console.log('Profile seeding completed successfully!');
    console.log(`Added ${allSampleUsers.length} users and ${allSampleProfiles.length} profiles with Pexels images`);
    
  } catch (error) {
    console.error('Error seeding profiles:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllProfilesWithPexels()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}