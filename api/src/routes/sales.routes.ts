import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const salesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['pending', 'completed', 'cancelled', 'returned']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sales_agent_id: z.string().uuid().optional(),
});

const saleCreateSchema = z.object({
  vehicle_id: z.string().uuid(),
  customer_name: z.string().min(1),
  customer_nic: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  selling_price: z.number().min(0),
  payment_type: z.enum(['cash', 'leasing', 'bank_transfer']).default('cash'),
  leasing_company_id: z.string().uuid().optional(),
  sales_agent_id: z.string().uuid().optional(),
  pcn_advance_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const saleUpdateSchema = saleCreateSchema.partial().extend({
  status: z.enum(['pending', 'completed', 'cancelled', 'returned']).optional(),
});

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales transactions
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled, returned]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sales_agent_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of sales transactions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const queryResult = salesQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: queryResult.error.issues });
    }

    const { limit, offset, status, start_date, end_date, sales_agent_id } = queryResult.data;

    let query = supabase
      .from('pending_vehicle_sales')
      .select(`
        *,
        vehicles:vehicle_id (id, vehicle_name, price),
        sales_agents:sales_agent_id (id, name),
        leasing_companies:leasing_company_id (id, name)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (sales_agent_id) query = query.eq('sales_agent_id', sales_agent_id);
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', `${end_date}T23:59:59`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch sales', details: error.message });
    }

    res.json({
      data: data || [],
      pagination: { total: count || 0, limit, offset, hasMore: (count || 0) > offset + limit },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid sale ID format' });
    }

    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .select(`
        *,
        vehicles:vehicle_id (*),
        sales_agents:sales_agent_id (*),
        leasing_companies:leasing_company_id (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - customer_name
 *               - selling_price
 *             properties:
 *               vehicle_id:
 *                 type: string
 *                 format: uuid
 *               customer_name:
 *                 type: string
 *               customer_nic:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *               customer_address:
 *                 type: string
 *               selling_price:
 *                 type: number
 *               payment_type:
 *                 type: string
 *                 enum: [cash, leasing, bank_transfer]
 *               leasing_company_id:
 *                 type: string
 *                 format: uuid
 *               sales_agent_id:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Invalid input or vehicle not available
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const bodyResult = saleCreateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid sale data', details: bodyResult.error.issues });
    }

    const saleData = bodyResult.data;

    // Check if vehicle exists and is available
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, status, price, vehicle_name')
      .eq('id', saleData.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({ error: 'Vehicle is not available for sale', currentStatus: vehicle.status });
    }

    // Create snapshot of vehicle data
    const vehicleSnapshot = {
      vehicle_name: vehicle.vehicle_name,
      original_price: vehicle.price,
    };

    // Create sale record
    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .insert({
        ...saleData,
        status: 'pending',
        vehicle_snapshot: vehicleSnapshot,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Failed to create sale', details: error.message });
    }

    // Update vehicle status to pending
    await supabase.from('vehicles').update({ status: 'pending' }).eq('id', saleData.vehicle_id);

    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *       404:
 *         description: Sale not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid sale ID format' });
    }

    const bodyResult = saleUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid sale data', details: bodyResult.error.issues });
    }

    const { data: existing } = await supabase.from('pending_vehicle_sales').select('id, vehicle_id, status').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const updateData = bodyResult.data;

    // Handle status changes
    if (updateData.status && updateData.status !== existing.status) {
      if (updateData.status === 'completed') {
        // Mark vehicle as sold
        await supabase.from('vehicles').update({ status: 'sold' }).eq('id', existing.vehicle_id);
      } else if (updateData.status === 'cancelled' || updateData.status === 'returned') {
        // Return vehicle to available
        await supabase.from('vehicles').update({ status: 'available' }).eq('id', existing.vehicle_id);
      }
    }

    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update sale', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete/Cancel a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid sale ID format' });
    }

    const { data: existing } = await supabase.from('pending_vehicle_sales').select('id, vehicle_id').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Return vehicle to available
    await supabase.from('vehicles').update({ status: 'available' }).eq('id', existing.vehicle_id);

    const { error } = await supabase.from('pending_vehicle_sales').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete sale', details: error.message });
    }

    res.json({ message: 'Sale deleted successfully', id });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales/pending:
 *   get:
 *     summary: Get all pending sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending sales
 */
router.get('/status/pending', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .select(`*, vehicles:vehicle_id (id, vehicle_name)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch pending sales' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/sales/completed:
 *   get:
 *     summary: Get all completed sales (sold out)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed sales
 */
router.get('/status/completed', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .select(`*, vehicles:vehicle_id (id, vehicle_name)`)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch completed sales' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
