const express = require('express');
require('dotenv').config();
const admin = require('firebase-admin');
const server = express();
const port = 4000;
var serviceAccount = require('./chat.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DB_URL,
});

server.get('/', async (req, res) => {
    try {
        const db = admin.database();
        const ref = db.ref('students/' + 3);
        const dataSnapshot = await ref.once('value');
        const user = dataSnapshot.val();
        if (user === null) {
            return res.status(404).json({ msg: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(error);
    }
});
server
    .listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    })
    .on('error', (e) => {
        console.log(e);
        process.exit(1);
    });
