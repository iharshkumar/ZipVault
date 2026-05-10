import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, File, Image as ImageIcon, Video, FileText, Download, X, Play } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Preview.css';

const Preview = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchPreview();
    }, [id]);

    const fetchPreview = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/upload/preview/${id}`, config);
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load ZIP contents');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon size={24} />;
        if (['mp4', 'webm', 'mov'].includes(ext)) return <Video size={24} />;
        if (['pdf', 'txt', 'doc', 'docx'].includes(ext)) return <FileText size={24} />;
        return <File size={24} />;
    };

    const isPreviewable = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'].includes(ext);
    };

    const getPreviewUrl = (filePath) => {
        return `${import.meta.env.VITE_API_URL}/api/upload/preview/${id}/file/${filePath}?token=${user.token}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="preview-container">
            <div className="preview-header">
                <div className="header-left">
                    <Link to="/logs" className="back-btn">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="preview-title">
                            {data?.filename}
                        </h1>
                        <p className="preview-subtitle">
                            {data?.files.filter(f => !f.isDirectory).length} files inside
                        </p>
                    </div>
                </div>
            </div>

            <div className="preview-grid">
                {data?.files.filter(f => !f.isDirectory).map((file, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => isPreviewable(file.name) && setSelectedFile(file)}
                        className={`file-card ${isPreviewable(file.name) ? 'file-card-previewable' : 'file-card-static'}`}
                    >
                        <div className="file-icon-box">
                            {getFileIcon(file.name)}
                        </div>
                        <span className="file-name-label" title={file.name}>
                            {file.name.split('/').pop()}
                        </span>
                        {isPreviewable(file.name) && (
                            <span className="preview-badge">
                                Preview
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
                    >
                        <div className="modal-overlay" onClick={() => setSelectedFile(null)} />
                        
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="modal-content"
                        >
                            <div className="modal-header">
                                <h3 className="font-bold truncate">{selectedFile.name}</h3>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="close-btn"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="media-container">
                                {selectedFile.name.match(/\.(mp4|webm)$/i) ? (
                                    <video
                                        src={getPreviewUrl(selectedFile.name)}
                                        controls
                                        autoPlay
                                        className="max-h-full max-w-full"
                                    />
                                ) : (
                                    <img
                                        src={getPreviewUrl(selectedFile.name)}
                                        alt={selectedFile.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )}
                            </div>
                            <div className="modal-footer">
                                <p className="text-[#4a5568] font-semibold text-sm">
                                    Only full ZIP download allowed. Previewing single file.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Preview;
