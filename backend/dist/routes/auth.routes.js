"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Login
router.post('/login', authController.login);
// Register (student self-registration)
router.post('/register', authController.register);
// Get current user
router.get('/me', auth_1.authenticateToken, authController.getCurrentUser);
// Change password
router.put('/password', auth_1.authenticateToken, authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map