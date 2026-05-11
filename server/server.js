require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Initialize Firebase
initializeFirebase();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    console.log('Production mode detected. Serving static files from ../client/dist');
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('/{*splat}', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'))
    );
} else {
    console.log('Development mode detected.');
    app.get('/', (req, res) => {
        res.send('API is running (Development Mode)...');
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
