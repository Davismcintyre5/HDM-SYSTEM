const cloudinary = require('cloudinary').v2;
const { env } = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(file, { folder });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage, cloudinary };