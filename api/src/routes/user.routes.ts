import { Router } from 'express';

const router = Router();

// GET /api/users - Get all users
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  res.json({ message: 'Create new user' });
});

export default router;
