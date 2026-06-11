// middleware/auth.js

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const verifyToken = (token, secret) => {
  try { return jwt.verify(token, secret); } catch (error) { return null; }
};

const generateTokens = (payload, secret, refreshSecret, expiresIn, refreshExpiresIn) => {
  const accessToken = jwt.sign(payload, secret, { expiresIn });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
  return { accessToken, refreshToken };
};

const requireSchoolAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.SCHOOL_JWT_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ message: 'Admin access required.' });
  req.user = decoded;
  next();
};

const requireSchoolPortal = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.SCHOOL_PORTAL_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  req.user = decoded;
  next();
};

const requireCyberTenant = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.CYBER_JWT_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  req.user = decoded;
  req.tenantId = decoded.id;
  next();
};

const requireCyberTenantQuery = (req, res, next) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.CYBER_JWT_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  req.user = decoded;
  req.tenantId = decoded.id;
  next();
};

const requireCyberAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.CYBER_ADMIN_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  if (decoded.role !== 'super_admin') return res.status(403).json({ message: 'Super admin access required.' });
  req.user = decoded;
  next();
};

const requireCyberAdminQuery = (req, res, next) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const decoded = verifyToken(token, env.CYBER_ADMIN_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
  if (decoded.role !== 'super_admin') return res.status(403).json({ message: 'Super admin access required.' });
  req.user = decoded;
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { req.user = null; return next(); }
  const secrets = [
    { key: 'schoolAdmin', secret: env.SCHOOL_JWT_SECRET },
    { key: 'schoolPortal', secret: env.SCHOOL_PORTAL_SECRET },
    { key: 'cyberTenant', secret: env.CYBER_JWT_SECRET },
    { key: 'cyberAdmin', secret: env.CYBER_ADMIN_SECRET },
  ];
  for (const { key, secret } of secrets) {
    const decoded = verifyToken(token, secret);
    if (decoded) { req.user = { ...decoded, _type: key }; return next(); }
  }
  req.user = null;
  next();
};

module.exports = {
  generateTokens,
  requireSchoolAdmin,
  requireSchoolPortal,
  requireCyberTenant,
  requireCyberTenantQuery,
  requireCyberAdmin,
  requireCyberAdminQuery,
  optionalAuth,
};