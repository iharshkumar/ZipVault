require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getSignedCloudinaryUrl = (publicId) => {
    return cloudinary.utils.url(publicId, {
        resource_type: 'raw',
        sign_url: true,
        secure: true
    });
};

async function testDownload() {
    try {
        const publicId = "zip_uploads/1778433439488-ezgif-22f421bbab5aaf9-jpg.zip"; // Taken from previous logs
        const url = getSignedCloudinaryUrl(publicId);
        console.log("Fetching URL:", url);

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        console.log("Response status:", response.status);
    } catch (error) {
        console.error("Axios Error:");
        if (error.response) {
            console.error(error.response.status, error.response.statusText);
            console.error(error.response.headers);
            // Since it's a stream, we need to read it to get the error message
            error.response.data.on('data', chunk => console.error(chunk.toString()));
        } else {
            console.error(error.message);
        }
    }
}

testDownload();
