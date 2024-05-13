const {
    signInWithEmailAndPassword,
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} = require('firebase/auth');
const app = require('../config/firebase');

class AuthController {
    static async register(req, res, next) {
        const { email, password, displayName } = req.body;
        try {
            const auth = getAuth(app);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            updateProfile(user, {
                displayName: displayName,
                photoURL:
                    'https://res.cloudinary.com/deg3gxigl/image/upload/v1714664724/avatars/istockphoto-1393750072-612x612_ayiyfq.jpg',
            }).then(() => {
                console.log('Update profile successfully');
            });
            sendEmailVerification(user).then(() => {
                return res.status(201).json({ message: 'Email verification sent!' });
            });
        } catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        const { email, password } = req.body;
        try {
            const auth = getAuth(app);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (!user.emailVerified) {
                return res.status(403).json({
                    message: 'Account is not verified. Please check your email for verification',
                });
            }
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
