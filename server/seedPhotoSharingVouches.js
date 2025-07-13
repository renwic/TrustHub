import { db } from './db.ts';
import { testimonials } from '../shared/schema.ts';

// Sample photo sharing vouches with real photos and descriptions
const photoSharingVouches = [
  {
    profileId: 16, // Maya Chen
    authorName: "Sarah Kim",
    authorEmail: "sarah.kim@email.com",
    relationship: "college roommate",
    content: "Maya was my roommate for three years at Stanford and I can't imagine a better person to share space with. She's incredibly organized, thoughtful, and brings such positive energy to everything she does. Her passion for sustainable engineering is inspiring - she turned our dorm room into a mini eco-lab! She's also the most reliable person I know and always made time to help others despite her demanding course load.",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 4,
      ambitious: 5,
      reliable: 5
    },
    approved: true,
    allowPhotoSharing: true,
    sharedPhotos: [
      "https://images.pexels.com/photos/1172253/pexels-photo-1172253.jpeg",
      "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg"
    ],
    photoDescriptions: [
      "Maya and me at our Stanford graduation ceremony - so proud of her engineering achievements!",
      "Weekend hiking trip in Big Sur. Maya organized this whole adventure for our study group!"
    ]
  },
  {
    profileId: 17, // James Rodriguez
    authorName: "Miguel Santos",
    authorEmail: "miguel.santos@email.com", 
    relationship: "workout partner",
    content: "James has been my gym buddy for over two years and he's one of the most dedicated and motivating people I know. He never misses a workout, always spots me when I need it, and pushes me to be better. Beyond fitness, he's just a genuinely good person who listens and offers great advice. Any partner would be lucky to have someone so committed and supportive in their life.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 5,
      ambitious: 4,
      reliable: 5
    },
    approved: true,
    allowPhotoSharing: true,
    sharedPhotos: [
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
      "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg"
    ],
    photoDescriptions: [
      "James crushing his deadlift PR - this guy never gives up!",
      "Post-workout celebration after completing our first marathon together in 2023"
    ]
  },
  {
    profileId: 18, // Sophia Thompson
    authorName: "Emma Wilson",
    authorEmail: "emma.wilson@email.com",
    relationship: "sister",
    content: "As Sophia's older sister, I've watched her grow into an incredible woman. She's always been the creative one in our family, turning everything into art. Her graphic design work is amazing, but what makes me most proud is her kindness and empathy. She volunteers every weekend at the animal shelter and has rescued three dogs. She brings out the best in everyone around her and has the biggest heart.",
    ratings: {
      trustworthy: 5,
      fun: 5,
      caring: 5,
      ambitious: 4,
      reliable: 4
    },
    approved: true,
    allowPhotoSharing: true,
    sharedPhotos: [
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      "https://images.pexels.com/photos/1181563/pexels-photo-1181563.jpeg"
    ],
    photoDescriptions: [
      "Sophia with her rescue dog Max at the beach - this was the day she adopted him!",
      "Sister vacation in Portland last year. Sophia found the cutest coffee shops for us to visit!"
    ]
  },
  {
    profileId: 19, // Alex Kim
    authorName: "David Park",
    authorEmail: "david.park@email.com", 
    relationship: "business partner",
    content: "Alex and I co-founded our startup three years ago and I couldn't ask for a better partner. They bring incredible vision and strategic thinking to everything we do. Alex is also the most ethical person I know in business - always putting our team and customers first. They're naturally charismatic and great at building relationships, but also incredibly hardworking behind the scenes.",
    ratings: {
      trustworthy: 5,
      fun: 4,
      caring: 4,
      ambitious: 5,
      reliable: 5
    },
    approved: true,
    allowPhotoSharing: true,
    sharedPhotos: [
      "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
      "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg"
    ],
    photoDescriptions: [
      "Alex presenting our product at TechCrunch Disrupt - they absolutely nailed it!",
      "Celebrating our Series A funding round. Alex's vision made this possible!"
    ]
  }
];

async function seedPhotoSharingVouches() {
  try {
    console.log('Adding photo sharing vouches...');
    
    for (const vouch of photoSharingVouches) {
      await db.insert(testimonials).values(vouch);
      console.log(`Added photo sharing vouch from ${vouch.authorName} for profile ${vouch.profileId}`);
    }
    
    console.log('✅ Photo sharing vouches added successfully!');
  } catch (error) {
    console.error('Error adding photo sharing vouches:', error);
  }
}

seedPhotoSharingVouches();