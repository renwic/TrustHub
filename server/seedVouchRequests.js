import { randomBytes } from 'crypto';
import { storage } from './storage.ts';

async function addVouchesToProfiles() {
  
  console.log('Adding vouch requests to sample profiles...');
  
  // Get all profiles that have vouches (the duplicate profiles)
  const profileIds = [50, 51, 52, 53, 54, 55, 56, 57];
  
  const relationships = ['Best Friend', 'Sister', 'Brother', 'Coworker', 'College Friend', 'Roommate', 'Cousin', 'Gym Buddy'];
  const names = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson', 'Lisa Brown', 'David Kim', 'Rachel Green', 'Alex Turner'];
  const emails = ['sarah.j@email.com', 'mike.c@email.com', 'emily.d@email.com', 'james.w@email.com', 'lisa.b@email.com', 'david.k@email.com', 'rachel.g@email.com', 'alex.t@email.com'];
  
  const personalMessages = [
    'Hey! I would love for you to vouch for me on my dating profile. Your testimonial would mean a lot!',
    'Hi there! Could you help me out by writing a vouch for my dating profile? Thanks so much!',
    'Would you mind vouching for me on Heartlink? I think your perspective would be really valuable.',
    'Hey! I am putting together some testimonials for my dating profile. Would you be willing to help?',
    'Hi! I would really appreciate if you could write a quick vouch for me. Thanks!',
  ];
  
  for (const profileId of profileIds) {
    try {
      const profile = await storage.getProfileById(profileId);
      if (!profile) {
        console.log(`Profile ${profileId} not found, skipping...`);
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
      }
      
      console.log(`Added ${vouchCount} vouch requests for profile ${profileId} (${profile.name})`);
    } catch (error) {
      console.error(`Error adding vouches for profile ${profileId}:`, error);
    }
  }
  
  console.log('Finished adding vouch requests to profiles');
  process.exit(0);
}

addVouchesToProfiles().catch(console.error);