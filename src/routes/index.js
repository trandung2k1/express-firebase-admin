const auth = require('./auth.route');
const routes = (app) => {
    app.use('/api/auth', auth);
};

module.exports = routes;
