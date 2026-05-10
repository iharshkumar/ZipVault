import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileArchive, X, CheckCircle2, Loader2, Download, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useAuth();
    const [recentUploads, setRecentUploads] = useState([]);

    const fetchRecent = useCallback(async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/upload`, config);
            setRecentUploads(res.data.slice(0, 5));
        } catch (err) {
            console.error(err);
        }
    }, [user.token]);

    useEffect(() => {
        if (user) fetchRecent();
    }, [user, fetchRecent]);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && selectedFile.name.endsWith('.zip')) {
            setFile(selectedFile);
        } else {
            toast.error('Only ZIP files are allowed');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/zip': ['.zip'] },
        multiple: false
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('zip', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                },
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, config);
            toast.success('File uploaded successfully!');
            setFile(null);
            setProgress(0);
            fetchRecent();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Upload failed');
            console.error('Upload Error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRename = async (id, currentName) => {
        const newName = window.prompt("Enter new file name:", currentName);
        if (!newName || newName === currentName) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/upload/${id}`, { filename: newName }, config);
            toast.success('File renamed successfully');
            fetchRecent();
        } catch (err) {
            toast.error('Rename failed');
            console.error(err);
        }
    };

    return (
        <div className="home-container">
            <div className="home-grid">
                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hero-section"
                >
                    <div>
                        <h1 className="hero-title">
                            Secure <span className="gradient-text">ZIP Storage</span> for Professionals.
                        </h1>
                        <p className="hero-subtitle">
                            Upload, preview, and manage your ZIP archives with ease. 
                            Built for speed, security, and a premium experience.
                        </p>
                    </div>

                    <div className="upload-card">
                        <div
                            {...getRootProps()}
                            className={`dropzone ${isDragActive ? 'dropzone-active' : 'dropzone-inactive'}`}
                        >
                            <input {...getInputProps()} />
                            <div className="icon-container">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="dropzone-text">
                                    {isDragActive ? 'Drop it here!' : 'Drag & Drop ZIP File'}
                                </p>
                                <p className="dropzone-subtext">or click to browse your files</p>
                            </div>
                        </div>

                        <AnimatePresence>
                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="file-preview"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 text-primary rounded-lg">
                                            <FileArchive size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!uploading && (
                                            <button
                                                onClick={() => setFile(null)}
                                                className="p-1 hover:text-red-400 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {uploading && (
                            <div className="progress-container">
                                <div className="flex justify-between text-xs font-medium text-slate-400">
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <motion.div
                                        className="progress-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            disabled={!file || uploading}
                            onClick={handleUpload}
                            className="upload-btn"
                        >
                            {uploading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Upload to Vault</span>
                                    <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Recent Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="recent-section"
                >
                    <div className="section-header">
                        <h2 className="section-title">Recent Uploads</h2>
                        <Link to="/logs" className="view-all-link">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {recentUploads.length === 0 ? (
                            <div className="empty-state">
                                <FileArchive size={48} className="mx-auto text-slate-700 mb-4" />
                                <p className="text-slate-500">No uploads yet. Start by dropping a file!</p>
                            </div>
                        ) : (
                            recentUploads.map((upload, idx) => (
                                <motion.div
                                    key={upload._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="upload-item"
                                >
                                    <div className="item-details">
                                        <div className="item-icon">
                                            <FileArchive size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-200 truncate max-w-[150px] md:max-w-[250px]">
                                                {upload.filename}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {new Date(upload.createdAt).toLocaleDateString()} • {(upload.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            onClick={() => handleRename(upload._id, upload.filename)}
                                            className="action-btn"
                                            title="Rename File"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <a
                                            href={`${import.meta.env.VITE_API_URL}/api/upload/download/${upload._id}?token=${user.token}`}
                                            download={upload.filename}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn"
                                            title="Download ZIP"
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
