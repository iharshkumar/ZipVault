const Upload = require('../models/Upload');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getSignedCloudinaryUrl = (publicId) => {
    return cloudinary.utils.private_download_url(publicId, '', {
        resource_type: 'raw',
        type: 'private'
    });
};

// @desc    Upload ZIP file
// @route   POST /api/upload
// @access  Private
const uploadZip = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw',
            type: 'private',
            folder: 'zip_uploads',
            public_id: `${Date.now()}-${req.file.originalname}`,
        });

        // Save to Database
        const upload = await Upload.create({
            filename: req.file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            size: req.file.size,
            uploadedBy: req.user._id,
        });

        // Remove temp file
        fs.unlinkSync(filePath);

        res.status(201).json(upload);
    } catch (error) {
        console.error('Upload Error Details:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all user uploads
// @route   GET /api/uploads
// @access  Private
const getUploads = async (req, res) => {
    try {
        const uploads = await Upload.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(uploads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete upload
// @route   DELETE /api/upload/:id
// @access  Private
const deleteUpload = async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);

        if (!upload) {
            return res.status(404).json({ message: 'Upload not found' });
        }

        // Check user
        if (upload.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(upload.public_id, { resource_type: 'raw', type: 'private' });
        // Also attempt to delete old public ones just in case (graceful failure)
        await cloudinary.uploader.destroy(upload.public_id, { resource_type: 'raw', type: 'upload' }).catch(() => {});

        // Delete from DB
        await upload.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Rename upload
// @route   PUT /api/upload/:id
// @access  Private
const renameUpload = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: 'Filename is required' });
        }

        const upload = await Upload.findById(req.params.id);

        if (!upload) {
            return res.status(404).json({ message: 'Upload not found' });
        }

        if (upload.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        upload.filename = filename.endsWith('.zip') ? filename : `${filename}.zip`;
        const updatedUpload = await upload.save();

        res.status(200).json(updatedUpload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get ZIP content preview list
// @route   GET /api/preview/:id
// @access  Private
const getPreviewList = async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);

        if (!upload) {
            return res.status(404).json({ message: 'Upload not found' });
        }

        // For preview, we need to download the zip or have it locally.
        // Since we deleted the local file, we might need to fetch it from Cloudinary URL
        // or just use the Cloudinary URL to download to a temp buffer.
        
        // This is a bit complex for a real-time preview if files are large.
        // Alternative: Download to memory and extract.
        
        const response = await axios.get(getSignedCloudinaryUrl(upload.public_id), { responseType: 'arraybuffer' });
        const buffer = response.data;
        const zip = new AdmZip(Buffer.from(buffer));
        const zipEntries = zip.getEntries();

        const files = zipEntries.map(entry => ({
            name: entry.entryName,
            isDirectory: entry.isDirectory,
            size: entry.header.size,
        }));

        res.status(200).json({
            id: upload._id,
            filename: upload.filename,
            files
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during preview' });
    }
};

// @desc    Get specific file preview from ZIP
// @route   GET /api/preview/:id/file/*
// @access  Private
const getFilePreview = async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        const filePath = req.params.filePath; // Captured by :filePath(*)

        if (!upload) return res.status(404).json({ message: 'Upload not found' });

        const response = await axios.get(getSignedCloudinaryUrl(upload.public_id), { responseType: 'arraybuffer' });
        const buffer = response.data;
        const zip = new AdmZip(Buffer.from(buffer));
        const entry = zip.getEntry(filePath);

        if (!entry) return res.status(404).json({ message: 'File not found in ZIP' });

        const data = entry.getData();
        
        // Determine mime type (simple version)
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.pdf') contentType = 'application/pdf';

        res.set('Content-Type', contentType);
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stats for dashboard
// @route   GET /api/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const uploads = await Upload.find({ uploadedBy: req.user._id });
        const totalUploads = uploads.length;
        const totalSize = uploads.reduce((acc, curr) => acc + curr.size, 0);
        
        // Group by month for chart (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentUploads = uploads.filter(u => u.createdAt >= sixMonthsAgo);
        
        res.status(200).json({
            totalUploads,
            totalSize,
            recentActivity: uploads.slice(0, 5),
            lastUpload: uploads[0] || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Download ZIP file
// @route   GET /api/upload/download/:id
// @access  Private
const downloadZip = async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) {
            return res.status(404).json({ message: 'Upload not found' });
        }

        const response = await axios({
            method: 'GET',
            url: getSignedCloudinaryUrl(upload.public_id),
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="${upload.filename}"`);
        res.setHeader('Content-Type', 'application/zip');

        response.data.pipe(res);
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Server Error during download' });
    }
};

module.exports = {
    uploadZip,
    getUploads,
    deleteUpload,
    renameUpload,
    getPreviewList,
    getFilePreview,
    getStats,
    downloadZip
};
