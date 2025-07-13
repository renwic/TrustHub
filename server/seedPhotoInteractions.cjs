const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Setup Neon connection
const neonConfig = require('@neondatabase/serverless');
neonConfig.neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedPhotoInteractions() {
  console.log('🎨 Starting photo interaction seeding...');

  try {
    // First, get all testimonials with shared photos
    const testimonialResult = await pool.query(`
      SELECT id, author_name, shared_photos 
      FROM testimonials 
      WHERE shared_photos IS NOT NULL 
      AND array_length(shared_photos, 1) > 0
      LIMIT 20
    `);

    console.log(`📊 Found ${testimonialResult.rows.length} testimonials with photos`);

    // Get sample users to create interactions
    const userResult = await pool.query(`
      SELECT id, first_name, last_name 
      FROM users 
      WHERE id LIKE 'sample_%'
      LIMIT 15
    `);

    console.log(`👥 Found ${userResult.rows.length} sample users for interactions`);

    const users = userResult.rows;
    let likesAdded = 0;
    let commentsAdded = 0;

    for (const testimonial of testimonialResult.rows) {
      const photos = testimonial.shared_photos;
      const photoCount = photos.length;

      // Add likes to each photo (random number of likes per photo)
      for (let photoIndex = 0; photoIndex < photoCount; photoIndex++) {
        const numLikes = Math.floor(Math.random() * 8) + 1; // 1-8 likes per photo
        
        // Randomly select users to like this photo
        const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
        const likingUsers = shuffledUsers.slice(0, numLikes);

        for (const user of likingUsers) {
          try {
            await pool.query(`
              INSERT INTO photo_likes (testimonial_id, photo_index, user_id)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [testimonial.id, photoIndex, user.id]);
            likesAdded++;
          } catch (error) {
            console.log(`Skipping duplicate like for testimonial ${testimonial.id}, photo ${photoIndex}`);
          }
        }

        // Add comments to some photos (30% chance per photo)
        if (Math.random() < 0.3) {
          const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
          const commentingUsers = [...users].sort(() => Math.random() - 0.5).slice(0, numComments);

          const sampleComments = [
            "Love this photo! 📸",
            "Such a great memory!",
            "You two look amazing together!",
            "This brings back so many good times",
            "Beautiful shot! 💯",
            "Miss hanging out like this",
            "So much fun that day!",
            "Picture perfect moment",
            "Great vibes in this one",
            "This is definitely going in the photo album",
            "Absolutely love this!",
            "You both look so happy here",
            "What a fantastic day that was",
            "Bringing back all the memories",
            "This photo captures it perfectly"
          ];

          for (const user of commentingUsers) {
            const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
            const authorName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous';

            try {
              await pool.query(`
                INSERT INTO photo_comments (testimonial_id, photo_index, user_id, author_name, content)
                VALUES ($1, $2, $3, $4, $5)
              `, [testimonial.id, photoIndex, user.id, authorName, comment]);
              commentsAdded++;
            } catch (error) {
              console.log(`Error adding comment: ${error.message}`);
            }
          }
        }
      }
    }

    console.log(`✅ Successfully added:`);
    console.log(`   ❤️  ${likesAdded} photo likes`);
    console.log(`   💬 ${commentsAdded} photo comments`);
    console.log(`🎉 Photo interaction seeding complete!`);

  } catch (error) {
    console.error('❌ Error seeding photo interactions:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedPhotoInteractions();
}

module.exports = { seedPhotoInteractions };