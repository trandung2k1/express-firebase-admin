const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const login = require('../validators/auth/login');
const register = require('../validators/auth/register');
const router = Router();

router.post('/login', login, AuthController.login);
router.post('/register', register, AuthController.register);

module.exports = router;
