require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testDownload() {
    const publicId = "zip_uploads/1778433439488-ezgif-22f421bbab5aaf9-jpg.zip";
    
    // format is left empty string since it's raw
    const url = cloudinary.utils.private_download_url(publicId, '', {
        resource_type: 'raw',
        type: 'upload'
    });
    
    console.log('Fetching:', url);

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        console.log('Success, Status:', response.status);
    } catch (err) {
        console.error('Error:', err.response ? err.response.status : err.message);
    }
}

testDownload();
