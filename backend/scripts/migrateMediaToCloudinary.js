import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getDbStatus } from '../config/db.js';
import { isCloudinaryConfigured, uploadStreamToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 Munnalal Painter: Media to Cloudinary Migration');
  console.log('====================================================');

  const status = await getDbStatus();
  console.log(`📊 DB Mode: ${status.mode}`);

  if (!isCloudinaryConfigured()) {
    console.warn('⚠️ Cloudinary credentials are not configured in your environment.');
    console.warn('👉 Please configure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env before migrating media files.');
    return;
  }

  console.log('🔍 Scanning media_files for Base64 records...');
  const res = await query(`SELECT id, filename, mime_type, size, url, data FROM media_files`);
  const rows = res.rows || [];

  const unmigrated = rows.filter(
    (r) => r.data && (!r.url || !r.url.startsWith('https://res.cloudinary.com/'))
  );

  console.log(`Found ${rows.length} total media record(s), ${unmigrated.length} needing migration to Cloudinary.`);

  if (unmigrated.length === 0) {
    console.log('✅ All media files are already migrated or have Cloudinary URLs. Zero Base64 in storage!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const item of unmigrated) {
    console.log(`\n⏳ Migrating [${item.id}] "${item.filename}" (${item.mime_type})...`);
    try {
      const buffer = Buffer.from(item.data, 'base64');
      const isVideo = item.mime_type && item.mime_type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const uploadRes = await uploadStreamToCloudinary(buffer, {
        folder: 'munnalal_painter/migrated',
        resource_type: resourceType
      });

      const cloudinaryUrl = uploadRes.secure_url || uploadRes.url;
      const publicId = uploadRes.public_id;

      // Update media_files record: set url & public_id, clear data to NULL
      await query(
        `UPDATE media_files SET url = $1, public_id = $2, resource_type = $3, data = NULL WHERE id = $4`,
        [cloudinaryUrl, publicId, resourceType, item.id]
      );

      console.log(`   ✓ Uploaded to Cloudinary: ${cloudinaryUrl}`);
      console.log(`   ✓ Database record updated: data set to NULL (0 Base64 bytes stored)`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed to migrate [${item.id}]:`, err.message);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`🏁 Migration Completed: ${successCount} succeeded, ${failCount} failed.`);
  console.log('====================================================');
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
