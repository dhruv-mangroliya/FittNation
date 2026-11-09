const router = require('express').Router();
const AdminUser = require('../models/AdminUser');

const isSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Not authorized' });
  next();
};

// GET all admin users
router.get('/', isSuperAdmin, async (req, res) => {
  try {
    res.json(await AdminUser.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create admin user
router.post('/', isSuperAdmin, async (req, res) => {
  try {
    const { name, email, phone, permissions } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    if (await AdminUser.findOne({ email })) return res.status(409).json({ error: 'Email already exists' });
    const adminUser = await AdminUser.create({ name, email, phone, permissions });
    res.status(201).json(adminUser);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update permissions
router.patch('/:id', isSuperAdmin, async (req, res) => {
  try {
    const { permissions, name, phone } = req.body;
    const adminUser = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(phone && { phone }), ...(permissions && { permissions }) },
      { new: true }
    );
    if (!adminUser) return res.status(404).json({ error: 'Not found' });
    res.json(adminUser);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE admin user
router.delete('/:id', isSuperAdmin, async (req, res) => {
  try {
    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
