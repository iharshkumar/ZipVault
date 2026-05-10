require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUploadAndDownload() {
    try {
        fs.writeFileSync('dummy.zip', 'dummy content');
        const result = await cloudinary.uploader.upload('dummy.zip', {
            resource_type: 'raw',
            type: 'private',
            folder: 'zip_uploads'
        });
        console.log('Uploaded private file:', result.public_id);
        
        const url = cloudinary.utils.private_download_url(result.public_id, '', {
            resource_type: 'raw',
            type: 'private'
        });
        console.log('Private Download URL:', url);
        
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        console.log('Download Status:', response.status);
    } catch (e) {
        console.error('Error:', e.response ? e.response.status : e.message);
    }
}

testUploadAndDownload();
