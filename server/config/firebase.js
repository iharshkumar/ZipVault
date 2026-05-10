const admin = require('firebase-admin');

const initializeFirebase = () => {
    try {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
            console.warn('Firebase credentials missing in .env. Firebase Auth will not be available.');
            return;
        }

        // Handle potential quoting and newline characters in the private key
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            // Remove surrounding quotes if dotenv preserved them
            privateKey = privateKey.replace(/^"|"$/g, '');
            // Convert escaped newlines back to actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        console.log('Initializing Firebase with Project ID:', process.env.FIREBASE_PROJECT_ID);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: privateKey,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });

        console.log('Firebase Admin SDK initialized');
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error.message);
    }
};

module.exports = { admin, initializeFirebase };
