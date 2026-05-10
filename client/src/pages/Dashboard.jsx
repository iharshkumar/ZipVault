import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart3, 
    HardDrive, 
    Clock, 
    FileArchive, 
    TrendingUp, 
    ShieldCheck, 
    Activity
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/upload/stats`, config);
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user.token]);

    const barData = {
        labels: stats?.chartData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Uploads',
                data: stats?.chartData?.data || [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    if (loading) return null;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Workspace <span className="gradient-text">Overview</span></h1>
                <p className="dashboard-subtitle">Monitoring your cloud storage performance.</p>
            </div>

            <div className="stats-grid">
                <StatCard 
                    icon={<FileArchive className="text-blue-400" />} 
                    label="Total ZIPs" 
                    value={stats?.totalUploads || 0} 
                    sub="Archives stored"
                />
                <StatCard 
                    icon={<HardDrive className="text-purple-400" />} 
                    label="Storage Used" 
                    value={`${((stats?.totalSize || 0) / (1024 * 1024)).toFixed(1)} MB`} 
                    sub="Cloudinary usage"
                />
                <StatCard 
                    icon={<Activity className="text-green-400" />} 
                    label="Active Health" 
                    value="Optimal" 
                    sub="System status"
                />
                <StatCard 
                    icon={<ShieldCheck className="text-indigo-400" />} 
                    label="Encryption" 
                    value="AES-256" 
                    sub="Secured tunnel"
                />
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <div className="chart-header">
                        <h3 className="chart-title">
                            <TrendingUp size={20} className="text-primary" />
                            Storage Trends
                        </h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="activity-section">
                    <h3 className="activity-title">
                        <Clock size={20} className="text-primary" />
                        Recent Activity
                    </h3>
                    <div className="activity-list">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity, i) => (
                                <div key={i} className="activity-item">
                                    <div className="activity-dot"></div>
                                    <div className="activity-details">
                                        <p className="activity-filename">{activity.filename}</p>
                                        <p className="activity-date">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="activity-empty">No activity recorded</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, sub }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="stat-card"
    >
        <div className="stat-icon-box">
            {icon}
        </div>
        <p className="stat-label">{label}</p>
        <h4 className="stat-value">{value}</h4>
        <p className="stat-sub">{sub}</p>
    </motion.div>
);

export default Dashboard;
