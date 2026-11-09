const router    = require('express').Router();
const passport  = require('passport');
const AdminUser = require('../models/AdminUser');

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_ORIGIN}/login?error=auth_failed` }),
  async (req, res) => {
    if (req.user.expiryDate && new Date() > new Date(req.user.expiryDate)) {
      // Allow admin users (AdminUser) through even if their gym membership expired
      const adminUser = await AdminUser.findOne({ email: req.user.email });
      if (!adminUser) return res.redirect(`${process.env.FRONTEND_ORIGIN}/login?error=expired`);
    }
    const isSuperAdmin = req.user.email === process.env.ADMIN_EMAIL;
    const adminUser    = !isSuperAdmin ? await AdminUser.findOne({ email: req.user.email }) : null;
    if (isSuperAdmin || adminUser) return res.redirect(`${process.env.FRONTEND_ORIGIN}/admin`);
    res.redirect(`${process.env.FRONTEND_ORIGIN}/`);
  }
);

// Get current session user
router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const isSuperAdmin = req.user.email === process.env.ADMIN_EMAIL;
  const adminUser    = !isSuperAdmin ? await AdminUser.findOne({ email: req.user.email }).populate('permissions.members permissions.analytics permissions.branches') : null;
  res.json({
    userId:      req.user.userId,
    name:        req.user.name,
    email:       req.user.email,
    plan:        req.user.plan,
    expiryDate:  req.user.expiryDate,
    isAdmin:     isSuperAdmin || !!adminUser,
    isSuperAdmin,
    permissions: isSuperAdmin
      ? { members: null, analytics: null, branches: null, roles: true }
      : (adminUser ? {
          members:   adminUser.permissions.members.map(b => b._id?.toString() || b.toString()),
          analytics: adminUser.permissions.analytics.map(b => b._id?.toString() || b.toString()),
          branches:  adminUser.permissions.branches.map(b => b._id?.toString() || b.toString()),
          roles:     false,
        } : null),
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => res.json({ success: true }));
});

module.exports = router;
