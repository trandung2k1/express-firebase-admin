require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('./config/firebase');
const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
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

server.get('/users', async (req, res) => {
    try {
        const db = admin.firestore();
        //GET ALL
        // const usersRef = db.collection('users');
        // const users = await usersRef.get();
        // const usersData = [];
        // users.forEach((doc) => {
        //     usersData.push(doc.data());
        // });
        // return res.status(200).json(usersData);

        // CREATE
        const postsRef = db.collection('posts');
        const created = await postsRef.add({
            id: uuidv4(),
            name: 'Clean room',
            desc: 'This is clean room',
        });
        const saved = await created.get();
        return res.status(201).json(saved.data());
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
});

server.get('/storage', async (req, res) => {
    try {
        const storage = admin.storage();

        //return link image
        // const file = await storage.bucket().file('avatar.jpg').getSignedUrl({
        //     action: 'read',
        //     expires: '04-05-2042',
        // });
        // const file = await storage.bucket().file('avatar.jpg').download();

        // Dowload file
        const file = await storage.bucket().file('avatar.jpg').download();
        const buffer = Buffer.from(file[0]);
        res.set({
            'Content-Disposition': 'attachment; filename="avatar.jpg"',
            'Content-Type': 'image/jpeg',
        });
        res.send(buffer);

        return;
        //Create file inside server and dowload
        const filePath = path.join(__dirname, 'image.jpg');
        fs.writeFileSync(filePath, buffer);
        res.download(filePath, 'downloaded_image.jpg', (err) => {
            if (err) {
                console.log('Error downloading the file:', err);
                res.sendStatus(500);
            }
            res.sendStatus(200);
        });
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
