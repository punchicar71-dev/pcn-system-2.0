import { Router } from 'express';

const router = Router();

// GET /api/sales - Get all sales transactions
router.get('/', (req, res) => {
  res.json({ message: 'Get all sales' });
});

// POST /api/sales - Create new sale
router.post('/', (req, res) => {
  res.json({ message: 'Create new sale' });
});

export default router;
