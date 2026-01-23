// Parse Cloudinary URL จาก environment variable
// Format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL || '';

let cloudinaryConfig = {
  cloud_name: '',
  api_key: '',
  api_secret: ''
};

if (cloudinaryUrl) {
  try {
    // Parse: cloudinary://api_key:api_secret@cloud_name
    // ตัวอย่าง: cloudinary://123456789:abcdefghijk@dqunjp3dj
    const urlPattern = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
    const match = cloudinaryUrl.match(urlPattern);
    
    if (match && match.length === 4) {
      cloudinaryConfig = {
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3]
      };
    }
  } catch {
    // Error parsing Cloudinary URL
  }
}

export { cloudinaryConfig };

