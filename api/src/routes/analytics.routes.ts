import { Router } from 'express';

const router = Router();

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Get dashboard analytics' });
});

// GET /api/analytics/sales - Get sales analytics
router.get('/sales', (req, res) => {
  res.json({ message: 'Get sales analytics' });
});

export default router;
