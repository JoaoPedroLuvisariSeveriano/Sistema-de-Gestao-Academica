"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
exports.authenticateToken = authenticateToken;
exports.authorizeRoles = authorizeRoles;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return User_1.UserRole; } });
const JWT_SECRET = process.env.JWT_SECRET || 'gestao-academica-secret-key-2024';
// Middleware de autenticação JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
}
// Middleware de autorização por perfil
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acesso negado. Você não tem permissão para esta ação.',
            });
        }
        next();
    };
}
// Função para gerar token JWT
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}
//# sourceMappingURL=auth.js.map