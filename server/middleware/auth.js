const { admin } = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        console.log('Verifying Token:', token.substring(0, 10) + '...');
        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Decoded Token UID:', decodedToken.uid);
        
        // Find user by firebaseUid or email
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
            console.log('User not found by UID, checking email:', decodedToken.email);
            // Check if user exists with this email (if they registered before firebase migration)
            user = await User.findOne({ email: decodedToken.email });
            
            if (user) {
                console.log('Linking existing user to Firebase UID');
                // Link firebaseUid to existing user
                user.firebaseUid = decodedToken.uid;
                await user.save();
            } else {
                console.log('Auto-creating new user from Firebase');
                // Auto-create user if they don't exist in our DB but authenticated via Firebase
                user = await User.create({
                    username: decodedToken.name || decodedToken.email.split('@')[0],
                    email: decodedToken.email,
                    firebaseUid: decodedToken.uid
                });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error Details:', error);
        res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
};

module.exports = { protect };
