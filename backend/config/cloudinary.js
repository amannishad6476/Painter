import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Configure Cloudinary if environment variables are provided
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Returns true if Cloudinary has the required credentials configured.
 */
export const isCloudinaryConfigured = () => {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
};

/**
 * Uploads a file buffer directly to Cloudinary using streaming.
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Upload options (folder, resource_type, tags, etc.)
 * @returns {Promise<Object>} Cloudinary upload result object
 */
export const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env'
        )
      );
    }

    const defaultOptions = {
      folder: 'munnalal_painter',
      resource_type: 'auto',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.end(buffer);
  });
};

export default cloudinary;
