import { Router } from 'express';

const router = Router();

// GET /api/vehicles - Get all vehicles
router.get('/', (req, res) => {
  res.json({ message: 'Get all vehicles' });
});

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get vehicle ${req.params.id}` });
});

// POST /api/vehicles - Create new vehicle
router.post('/', (req, res) => {
  res.json({ message: 'Create new vehicle' });
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', (req, res) => {
  res.json({ message: `Update vehicle ${req.params.id}` });
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete vehicle ${req.params.id}` });
});

export default router;
