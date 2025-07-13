import { storage } from './storage';

export async function seedNotifications() {
  console.log('Starting notification seeding...');
  
  try {
    // Sample user ID - in a real app, this would be actual user IDs
    const testUserId = '1';
    
    // Sample notifications for testing
    const sampleNotifications = [
      {
        userId: testUserId,
        type: 'match',
        title: 'New Match! 🎉',
        message: 'You and Sarah have matched! Start a conversation.',
        data: { matchId: 1, otherUserName: 'Sarah' },
        isRead: false
      },
      {
        userId: testUserId,
        type: 'message',
        title: 'New Message',
        message: 'Alex sent you a message: "Hey! How are you?"',
        data: { matchId: 2, otherUserName: 'Alex' },
        isRead: false
      },
      {
        userId: testUserId,
        type: 'prop_received',
        title: 'RealOne Gave You Props!',
        message: 'Your friend Mike just wrote awesome things about you.',
        data: { testimonialId: 1, realOneName: 'Mike' },
        isRead: false
      },
      {
        userId: testUserId,
        type: 'interview_request',
        title: 'RealOne Interview Request',
        message: 'Someone wants to interview your RealOne Jessica about you.',
        data: { interviewId: 1, realOneName: 'Jessica' },
        isRead: true
      },
      {
        userId: testUserId,
        type: 'like',
        title: 'Someone Likes You!',
        message: 'You have a new like from someone special.',
        data: { profileId: 3 },
        isRead: false
      }
    ];
    
    // Create notifications
    for (const notification of sampleNotifications) {
      await storage.createNotification(notification);
      console.log(`Created notification: ${notification.title}`);
    }
    
    console.log('Notification seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding notifications:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNotifications();
}