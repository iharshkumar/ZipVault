require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const signedUrl = cloudinary.utils.url("zip_uploads/1778433439488-ezgif-22f421bbab5aaf9-jpg.zip", {
    resource_type: 'raw',
    sign_url: true,
    secure: true
});

console.log('Signed URL:', signedUrl);
