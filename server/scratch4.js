require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicId = "zip_uploads/1778433439488-ezgif-22f421bbab5aaf9-jpg.zip";

const url = cloudinary.utils.private_download_url(publicId, 'zip', {
    resource_type: 'raw',
    type: 'upload'
});

console.log('Private Download URL:', url);
