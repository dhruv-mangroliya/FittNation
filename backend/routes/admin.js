const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Branch = require('../models/Branch');
const AdminUser = require('../models/AdminUser');

// Super admin check
const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Not authorized' });
  next();
};

// Permission-aware middleware factory
// Attaches req.allowedBranches = null (all) or [ObjectId, ...] (filtered)
const hasPermission = (perm) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.email === process.env.ADMIN_EMAIL) {
    req.allowedBranches = null; // super admin sees all
    return next();
  }
  const adminUser = await AdminUser.findOne({ email: req.user.email });
  const allowed = adminUser?.permissions?.[perm];
  if (!allowed || allowed.length === 0) return res.status(403).json({ error: 'Permission denied' });
  req.allowedBranches = allowed.map(id => id.toString());
  next();
};

// Calculate expiry date based on plan
function getExpiryDate(plan) {
  const now = new Date();
  if (plan === 'Monthly')  { now.setMonth(now.getMonth() + 1); }
  if (plan === '6 Months') { now.setMonth(now.getMonth() + 6); }
  if (plan === 'Annual')   { now.setFullYear(now.getFullYear() + 1); }
  return now;
}

// GET all users
router.get('/users',        hasPermission('members'),   async (req, res) => {
  try {
    const filter = req.allowedBranches ? { branch: { $in: req.allowedBranches } } : {};
    const users = await User.find(filter).populate('branch', 'name slug').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all transactions
router.get('/transactions', hasPermission('analytics'), async (req, res) => {
  try {
    const filter = req.allowedBranches ? { branch: { $in: req.allowedBranches } } : {};
    const transactions = await Transaction.find(filter).populate('branch', 'name slug _id').sort({ date: -1 });
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create user
router.post('/users',       hasPermission('members'),   async (req, res) => {
  try {
    const { name, email, phone, plan, branch, amountPaid } = req.body;
    if (!name || !email || !phone || !plan || !branch || !amountPaid) return res.status(400).json({ error: 'All fields required' });

    // Enforce branch-level access
    if (req.allowedBranches && !req.allowedBranches.includes(branch))
      return res.status(403).json({ error: 'No access to this branch' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User with this email already exists' });

    const branchDoc = await Branch.findById(branch);
    if (!branchDoc) return res.status(400).json({ error: 'Invalid branch' });

    const userId = 'FN-' + uuidv4().split('-')[0].toUpperCase();
    const expiryDate = getExpiryDate(plan);

    const user = await User.create({ userId, name, email, phone, plan, branch: branchDoc._id, expiryDate });
    await Transaction.create({ userId: user._id, amount: amountPaid, plan, branch: branchDoc._id });
    const populated = await user.populate('branch', 'name slug');
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH renew user plan
router.patch('/users/:id',  hasPermission('members'),   async (req, res) => {
  try {
    const { plan, amountPaid, branch } = req.body;
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    if (req.allowedBranches && !req.allowedBranches.includes(existing.branch.toString()))
      return res.status(403).json({ error: 'No access to this branch' });
    const update = { plan, expiryDate: getExpiryDate(plan) };
    if (branch) update.branch = branch;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).populate('branch', 'name slug');
    if (amountPaid) await Transaction.create({ userId: user._id, amount: amountPaid, plan, branch: branch || user.branch._id });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:id', hasPermission('members'),   async (req, res) => {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    if (req.allowedBranches && !req.allowedBranches.includes(existing.branch.toString()))
      return res.status(403).json({ error: 'No access to this branch' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all branches
router.get('/branches',     hasPermission('branches'),  async (req, res) => {
  try {
    const filter = req.allowedBranches ? { _id: { $in: req.allowedBranches } } : {};
    const branches = await Branch.find(filter).sort({ createdAt: 1 });
    res.json(branches);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update branch
router.put('/branches/:slug', hasPermission('branches'), async (req, res) => {
  try {
    const branchDoc = await Branch.findOne({ slug: req.params.slug });
    if (!branchDoc) return res.status(404).json({ error: 'Branch not found' });
    if (req.allowedBranches && !req.allowedBranches.includes(branchDoc._id.toString()))
      return res.status(403).json({ error: 'No access to this branch' });
    const { name, tag, address, phone, hours, facilities, mapUrl, mapLink } = req.body;
    const updated = await Branch.findOneAndUpdate(
      { slug: req.params.slug },
      { name, tag, address, phone, hours, facilities, mapUrl, mapLink },
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
