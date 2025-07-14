#!/usr/bin/env node
/**
 * Check if TrustMatch repository exists and its status
 */

async function checkRepository() {
  try {
    const response = await fetch('https://api.github.com/repos/renwic/TrustMatch');
    
    if (response.ok) {
      const repo = await response.json();
      console.log('✅ TrustMatch repository exists:');
      console.log(`- Created: ${repo.created_at}`);
      console.log(`- Updated: ${repo.updated_at}`);
      console.log(`- Size: ${repo.size} KB`);
      console.log(`- Default branch: ${repo.default_branch}`);
      console.log(`- URL: ${repo.html_url}`);
      
      // Check if repository has content
      if (repo.size === 0) {
        console.log('\n📝 Repository appears to be empty - you can use it!');
        console.log('Solution: Use the existing empty repository');
      } else {
        console.log('\n📁 Repository has content - you need to either:');
        console.log('1. Delete the existing repository and create new one');
        console.log('2. Use a different name like "TrustMatch2" or "HeartlinkApp"');
      }
    } else if (response.status === 404) {
      console.log('❌ Repository not found - this is unexpected given the error');
    } else {
      console.log(`❌ Error checking repository: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log('🔍 Checking TrustMatch repository status...');
checkRepository();