import { storage } from './storage.ts';

async function addTestimonialsFromVouches() {
  console.log('Adding testimonials from accepted vouch requests...');
  
  // Get all accepted vouch requests
  const profileIds = [50, 51, 52, 53, 54, 55, 56, 57];
  
  const testimonialContents = [
    "I've known them for over 5 years and they're one of the most genuine, caring people I know. They always put others first and have an amazing sense of humor that can light up any room. Anyone would be lucky to date them!",
    "As their coworker, I can say they're incredibly reliable and always bring positive energy to everything they do. They're the type of person who remembers your birthday and always asks how your family is doing. A truly wonderful human being.",
    "They've been my best friend since college and I've watched them grow into such an amazing person. They're loyal, funny, ambitious, and have the biggest heart. They deserve someone who appreciates how special they are.",
    "I've had the pleasure of knowing them through our volunteer work together. They're passionate about making a difference and always show up for others. Their kindness and authenticity shine through in everything they do.",
    "As their sister, I can honestly say they're the best person I know. They're supportive, hilarious, and have always been there for our family. They bring out the best in everyone around them.",
    "We've been roommates for 2 years and living with them has been such a joy. They're considerate, fun to be around, and always up for an adventure. They have this amazing ability to make ordinary moments feel special.",
    "I've known them since high school and they've always been the friend everyone turns to for advice. They're wise beyond their years, incredibly empathetic, and have this infectious laugh that makes everything better.",
    "Working with them has been such a pleasure. They're creative, collaborative, and always willing to help others succeed. They bring such positive energy to our team and I know they'd bring that same energy to a relationship."
  ];
  
  for (const profileId of profileIds) {
    try {
      // Get accepted vouch requests for this profile
      const vouchRequests = await storage.getVouchRequestsByProfileId(profileId);
      const acceptedVouches = vouchRequests.filter(v => v.status === 'accepted');
      
      for (const vouch of acceptedVouches) {
        // Check if testimonial already exists for this vouch
        const existingTestimonials = await storage.getProfileTestimonials(profileId);
        const alreadyExists = existingTestimonials.some(t => 
          t.authorName === vouch.recipientName && t.authorEmail === vouch.recipientEmail
        );
        
        if (!alreadyExists) {
          const randomContent = testimonialContents[Math.floor(Math.random() * testimonialContents.length)];
          
          // Generate realistic ratings (mostly 4-5 stars)
          const generateRating = () => Math.random() > 0.2 ? 5 : 4;
          
          await storage.createTestimonial({
            profileId: profileId,
            authorName: vouch.recipientName,
            authorEmail: vouch.recipientEmail,
            relationship: vouch.relationship,
            content: randomContent,
            ratings: {
              trustworthy: generateRating(),
              fun: generateRating(),
              caring: generateRating(),
              ambitious: generateRating(),
              reliable: generateRating(),
            },
            approved: true, // Auto-approve vouches from invite system
          });
          
          console.log(`Added testimonial from ${vouch.recipientName} for profile ${profileId}`);
        }
      }
    } catch (error) {
      console.error(`Error adding testimonials for profile ${profileId}:`, error);
    }
  }
  
  console.log('Finished adding testimonials from vouch requests');
  process.exit(0);
}

addTestimonialsFromVouches().catch(console.error);