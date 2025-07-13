import { storage } from './storage.ts';
import { randomBytes } from 'crypto';

async function addVouchesToAllProfiles() {
  console.log('Adding vouch requests to ALL sample profiles...');
  
  // Get all profiles (both original and duplicate sets)
  const allProfileIds = [];
  for (let i = 2; i <= 25; i++) {
    allProfileIds.push(i);
  }
  for (let i = 50; i <= 57; i++) {
    allProfileIds.push(i);
  }
  
  const relationships = ['Best Friend', 'Sister', 'Brother', 'Coworker', 'College Friend', 'Roommate', 'Cousin', 'Gym Buddy', 'Neighbor', 'Study Partner'];
  const names = [
    'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson', 'Lisa Brown', 'David Kim', 
    'Rachel Green', 'Alex Turner', 'Jennifer Lopez', 'Michael Smith', 'Amanda Clark', 'Ryan Murphy',
    'Jessica Lee', 'Chris Taylor', 'Nicole White', 'Brandon Jones', 'Stephanie Miller', 'Kevin Zhang',
    'Ashley Rodriguez', 'Daniel Park', 'Megan Thompson', 'Tyler Anderson', 'Samantha Garcia', 'Jordan Martinez'
  ];
  const emails = [
    'sarah.j@email.com', 'mike.c@email.com', 'emily.d@email.com', 'james.w@email.com', 
    'lisa.b@email.com', 'david.k@email.com', 'rachel.g@email.com', 'alex.t@email.com',
    'jennifer.l@email.com', 'michael.s@email.com', 'amanda.c@email.com', 'ryan.m@email.com',
    'jessica.l@email.com', 'chris.t@email.com', 'nicole.w@email.com', 'brandon.j@email.com',
    'stephanie.m@email.com', 'kevin.z@email.com', 'ashley.r@email.com', 'daniel.p@email.com',
    'megan.t@email.com', 'tyler.a@email.com', 'samantha.g@email.com', 'jordan.m@email.com'
  ];
  
  const personalMessages = [
    'Hey! I would love for you to vouch for me on my dating profile. Your testimonial would mean a lot!',
    'Hi there! Could you help me out by writing a vouch for my dating profile? Thanks so much!',
    'Would you mind vouching for me on Heartlink? I think your perspective would be really valuable.',
    'Hey! I am putting together some testimonials for my dating profile. Would you be willing to help?',
    'Hi! I would really appreciate if you could write a quick vouch for me. Thanks!',
    'Could you do me a favor and vouch for me? Your opinion means so much to me!',
    'I am trying to get some character references for my profile. Would you mind helping out?',
    'Hey! Would you be up for writing a testimonial about me? It would really help!',
  ];
  
  const testimonialContents = [
    "I've known them for years and they're one of the most genuine, caring people I know. They always put others first and have an amazing sense of humor that can light up any room.",
    "As their coworker, I can say they're incredibly reliable and always bring positive energy to everything they do. They're the type of person who remembers your birthday.",
    "They've been my best friend since college and I've watched them grow into such an amazing person. They're loyal, funny, ambitious, and have the biggest heart.",
    "I've had the pleasure of knowing them through our volunteer work together. They're passionate about making a difference and always show up for others.",
    "As their sister, I can honestly say they're the best person I know. They're supportive, hilarious, and have always been there for our family.",
    "We've been roommates and living with them has been such a joy. They're considerate, fun to be around, and always up for an adventure.",
    "I've known them since high school and they've always been the friend everyone turns to for advice. They're wise beyond their years and incredibly empathetic.",
    "Working with them has been such a pleasure. They're creative, collaborative, and always willing to help others succeed.",
    "They're one of the most trustworthy people I know. When they say they'll do something, you can count on it happening. Their word means everything.",
    "What I love most about them is their infectious positivity. Even on tough days, they find a way to make everyone around them smile.",
    "They have this incredible ability to make you feel heard and valued. Conversations with them are always meaningful and uplifting.",
    "I've seen them handle challenges with such grace and determination. They never give up and always find creative solutions to problems."
  ];
  
  for (const profileId of allProfileIds) {
    try {
      const profile = await storage.getProfileById(profileId);
      if (!profile) {
        console.log(`Profile ${profileId} not found, skipping...`);
        continue;
      }
      
      // Check if this profile already has vouch requests
      const existingVouches = await storage.getVouchRequestsByProfileId(profileId);
      if (existingVouches.length > 0) {
        console.log(`Profile ${profileId} already has vouches, skipping...`);
        continue;
      }
      
      // Create 2-4 vouch requests per profile
      const vouchCount = Math.floor(Math.random() * 3) + 2; // 2-4 vouches
      
      for (let i = 0; i < vouchCount; i++) {
        const randomIndex = Math.floor(Math.random() * names.length);
        const messageIndex = Math.floor(Math.random() * personalMessages.length);
        const inviteToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // 70% chance of being accepted, 30% pending
        const status = Math.random() > 0.3 ? 'accepted' : 'pending';
        const respondedAt = status === 'accepted' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
        
        await storage.createVouchRequest({
          profileId: profileId,
          requesterId: profile.userId,
          inviteToken,
          recipientEmail: emails[randomIndex],
          recipientName: names[randomIndex],
          relationship: relationships[Math.floor(Math.random() * relationships.length)],
          personalMessage: personalMessages[messageIndex],
          expiresAt,
          status,
          respondedAt,
        });
        
        // If accepted, create a testimonial
        if (status === 'accepted') {
          const randomContent = testimonialContents[Math.floor(Math.random() * testimonialContents.length)];
          
          // Generate realistic ratings (mostly 4-5 stars)
          const generateRating = () => Math.random() > 0.2 ? 5 : 4;
          
          await storage.createTestimonial({
            profileId: profileId,
            authorName: names[randomIndex],
            authorEmail: emails[randomIndex],
            relationship: relationships[Math.floor(Math.random() * relationships.length)],
            content: randomContent,
            ratings: {
              trustworthy: generateRating(),
              fun: generateRating(),
              caring: generateRating(),
              ambitious: generateRating(),
              reliable: generateRating(),
            },
            approved: true,
          });
        }
      }
      
      console.log(`Added ${vouchCount} vouch requests for profile ${profileId} (${profile.name})`);
    } catch (error) {
      console.error(`Error adding vouches for profile ${profileId}:`, error);
    }
  }
  
  console.log('Finished adding vouch requests to all profiles');
  process.exit(0);
}

addVouchesToAllProfiles().catch(console.error);