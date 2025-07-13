import { storage } from "./storage";

// Create some sample matches for testing the matching system
export async function seedSampleMatches() {
  try {
    console.log("Creating sample matches...");
    
    // Create some sample swipes that will generate matches
    const sampleSwipes = [
      // User likes profile 4 (Taylor Thompson)
      { swiperId: "sample_1", swipedId: 4, action: "like" },
      // Profile 4's user likes back - this will create a match
      { swiperId: "sample_3", swipedId: 2, action: "like" },
      
      // Another potential match
      { swiperId: "sample_1", swipedId: 16, action: "like" },
      { swiperId: "sample_15", swipedId: 2, action: "like" },
      
      // Some passes
      { swiperId: "sample_1", swipedId: 6, action: "pass" },
      { swiperId: "sample_1", swipedId: 8, action: "pass" },
    ];

    for (const swipe of sampleSwipes) {
      try {
        // Check if swipe already exists
        const existingSwipe = await storage.getSwipe(swipe.swiperId, swipe.swipedId);
        if (!existingSwipe) {
          await storage.createSwipe(swipe);
          console.log(`Created swipe: ${swipe.swiperId} -> ${swipe.swipedId} (${swipe.action})`);
        }
      } catch (error) {
        console.log(`Skipping swipe ${swipe.swiperId} -> ${swipe.swipedId}: ${error}`);
      }
    }

    console.log("Sample matches created successfully!");
  } catch (error) {
    console.error("Error creating sample matches:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleMatches().then(() => process.exit(0));
}