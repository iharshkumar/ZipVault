import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, History, Home, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <Link to="/" className="logo-link">
                    <div className="logo-icon">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <span className="logo-text">ZipVault</span>
                </Link>

                <div className="nav-links">
                    <NavLink to="/" icon={<Home size={18} />} label="Home" />
                    <NavLink to="/logs" icon={<History size={18} />} label="History" />
                    <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="username">{user.username}</span>
                        <span className="user-email">{user.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="nav-item"
    >
        {icon}
        <span className="nav-item-label">{label}</span>
        <motion.div
            className="nav-active-indicator"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
        />
    </Link>
);

export default Navbar;
