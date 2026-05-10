import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Trash2, Edit2, FileArchive, Filter, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './Logs.css';

const Logs = () => {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const { user } = useAuth();

    useEffect(() => {
        fetchUploads();
    }, []);

    const fetchUploads = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/upload`, config);
            setUploads(res.data);
        } catch (err) {
            toast.error('Failed to fetch uploads');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/upload/${id}`, config);
            toast.success('File deleted');
            setUploads(uploads.filter(u => u._id !== id));
        } catch (err) {
            toast.error('Delete failed');
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
            fetchUploads();
        } catch (err) {
            toast.error('Rename failed');
            console.error(err);
        }
    };

    const filteredUploads = uploads
        .filter(u => u.filename.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOrder === 'size') return b.size - a.size;
            return 0;
        });

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h1 className="logs-title">Upload <span className="gradient-text">History</span></h1>
                <p className="logs-subtitle">Manage all your archived ZIP files in one place.</p>
            </div>

            {/* Filters & Search */}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="filter-wrapper">
                        <Filter className="filter-icon" size={18} />
                        <select
                            className="filter-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="size">Largest Size</option>
                        </select>
                        <ArrowUpDown className="filter-arrow" size={14} />
                    </div>
                </div>
            </div>

            {/* Table/Card Grid */}
            {loading ? (
                <div className="logs-grid">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="skeleton-card"></div>
                    ))}
                </div>
            ) : filteredUploads.length === 0 ? (
                <div className="logs-empty-state">
                    <FileArchive size={64} className="empty-icon" />
                    <h3 className="text-2xl font-bold text-[#2d3748] mb-2">No files found</h3>
                    <p className="text-[#4a5568] font-semibold">Try searching for something else or upload a new file.</p>
                </div>
            ) : (
                <div className="logs-grid">
                    {filteredUploads.map((upload, idx) => (
                        <motion.div
                            key={upload._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="log-card"
                        >
                            <div className="log-card-header">
                                <div className="log-icon-container">
                                    <FileArchive size={24} />
                                </div>
                                <div className="log-actions">
                                    <button
                                        onClick={() => handleRename(upload._id, upload.filename)}
                                        className="log-action-btn"
                                        title="Rename File"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/api/upload/download/${upload._id}?token=${user.token}`}
                                        download={upload.filename}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="log-action-btn"
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(upload._id)}
                                        className="log-delete-btn"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="log-card-footer">
                                <h3 className="log-filename" title={upload.filename}>
                                    {upload.filename}
                                </h3>
                                <div className="log-meta">
                                    <span className="log-size-tag">
                                        {(upload.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                    <span>
                                        {new Date(upload.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Logs;
