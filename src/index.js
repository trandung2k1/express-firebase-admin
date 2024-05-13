require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('./config/firebase');
const express = require('express');
const admin = require('firebase-admin');
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
const port = 4000;
var serviceAccount = require('./chat.json');
const routes = require('./routes');
const errorHandlingMiddleware = require('./middlewares/errorHandlingMiddleware');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET,
});

server.get('/', async (req, res) => {
    try {
        const db = admin.database();
        const storage = admin.storage();
        // const firestore = admin.firestore();
        const filename = path.join(__dirname, 'avatar.jpg');
        const bucket = admin.storage().bucket();
        const upload = await bucket.upload(filename, {
            destination: 'images/avatar.jpg',
        });
        console.log(upload);
        const ref = db.ref('students/' + 2);
        const dataSnapshot = await ref.once('value');
        const user = dataSnapshot.val();
        if (user === null) {
            return res.status(404).json({ msg: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
});
routes(server);
server.use(errorHandlingMiddleware);
server
    .listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    })
    .on('error', (e) => {
        console.log(e);
        process.exit(1);
    });
