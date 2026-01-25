// Simple migration script to convert portraits to image IDs
// Run this in the browser console while the backend is running

async function migrateImages() {
  console.log('Starting image migration...');
  
  try {
    const response = await fetch('/api/migrate/portraits-to-images', { 
      method: 'POST' 
    });
    
    const result = await response.json();
    
    console.log('✅ Migration complete!');
    console.log(`   Migrated: ${result.migrated} portraits`);
    console.log(`   Skipped: ${result.skipped} (already image IDs or no portrait)`);
    console.log(`\n💡 Reload the page to see the changes!`);
    
    return result;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run it!
migrateImages();
