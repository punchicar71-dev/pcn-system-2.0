import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const vehicleQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['available', 'sold', 'reserved', 'In Sale', 'Reserved', 'Sold']).optional(),
  brand_id: z.string().uuid().optional(),
  fuel_type: z.enum(['petrol', 'diesel', 'hybrid', 'electric']).optional(),
  transmission: z.enum(['auto', 'manual']).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
});

const vehicleCreateSchema = z.object({
  brand_id: z.string().uuid(),
  model_id: z.string().uuid().optional(),
  custom_model: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0),
  mileage: z.number().min(0).optional(),
  fuel_type: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  transmission: z.enum(['auto', 'manual']),
  body_type: z.string().optional(),
  color: z.string().optional(),
  engine_capacity: z.number().optional(),
  country_id: z.string().uuid().optional(),
  manufacture_year: z.number().optional(),
  register_year: z.number().optional(),
  condition: z.enum(['brand_new', 'unregistered', 'used']).optional(),
  status: z.enum(['available', 'sold', 'reserved', 'In Sale', 'Reserved', 'Sold']).default('available'),
});

const vehicleUpdateSchema = vehicleCreateSchema.partial();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles with filtering and pagination
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of vehicles to return (max 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of vehicles to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold, reserved, pending]
 *         description: Filter by vehicle status
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by brand ID
 *       - in: query
 *         name: fuel_type
 *         schema:
 *           type: string
 *           enum: [petrol, diesel, hybrid, electric]
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *           enum: [auto, manual]
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in vehicle name, brand, model
 *     responses:
 *       200:
 *         description: List of vehicles with pagination info
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const queryResult = vehicleQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.issues 
      });
    }

    const { limit, offset, status, brand_id, fuel_type, transmission, min_price, max_price, search } = queryResult.data;

    let query = supabase
      .from('vehicle_inventory_view')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (brand_id) query = query.eq('brand_id', brand_id);
    if (fuel_type) query = query.eq('fuel_type', fuel_type);
    if (transmission) query = query.ilike('transmission', transmission === 'auto' ? '%auto%' : '%manual%');
    if (min_price !== undefined) query = query.gte('price', min_price);
    if (max_price !== undefined) query = query.lte('price', max_price);
    if (search) query = query.or(`vehicle_name.ilike.%${search}%,brand_name.ilike.%${search}%,model_name.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch vehicles', details: error.message });
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
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle details with images and options
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid vehicle ID format' });
    }

    const { data: vehicle, error } = await supabase
      .from('vehicle_inventory_view')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const [{ data: images }, { data: options }, { data: customOptions }, { data: seller }] = await Promise.all([
      supabase.from('vehicle_images').select('*').eq('vehicle_id', id).order('sort_order'),
      supabase.from('vehicle_options').select('*, vehicle_options_master(*)').eq('vehicle_id', id),
      supabase.from('vehicle_custom_options').select('*').eq('vehicle_id', id),
      supabase.from('sellers').select('*').eq('vehicle_id', id).single(),
    ]);

    res.json({ ...vehicle, images: images || [], options: options || [], customOptions: customOptions || [], seller: seller || null });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const bodyResult = vehicleCreateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid vehicle data', details: bodyResult.error.issues });
    }

    const vehicleData = bodyResult.data;

    const { data: brand } = await supabase.from('vehicle_brands').select('name').eq('id', vehicleData.brand_id).single();
    let modelName = vehicleData.custom_model || '';
    if (vehicleData.model_id) {
      const { data: model } = await supabase.from('vehicle_models').select('name').eq('id', vehicleData.model_id).single();
      modelName = model?.name || modelName;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({ ...vehicleData, vehicle_name: `${brand?.name || ''} ${modelName} ${vehicleData.year}`.trim() })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Failed to create vehicle', details: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid vehicle ID format' });
    }

    const bodyResult = vehicleUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid vehicle data', details: bodyResult.error.issues });
    }

    const { data: existing } = await supabase.from('vehicles').select('id').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...bodyResult.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update vehicle', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid vehicle ID format' });
    }

    const { data: existing } = await supabase.from('vehicles').select('id').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Delete related records first
    await Promise.all([
      supabase.from('vehicle_images').delete().eq('vehicle_id', id),
      supabase.from('vehicle_options').delete().eq('vehicle_id', id),
      supabase.from('vehicle_custom_options').delete().eq('vehicle_id', id),
      supabase.from('sellers').delete().eq('vehicle_id', id),
      supabase.from('vehicle_locks').delete().eq('vehicle_id', id),
    ]);

    const { error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete vehicle', details: error.message });
    }

    res.json({ message: 'Vehicle deleted successfully', id });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/vehicles/{id}/images:
 *   get:
 *     summary: Get all images for a vehicle
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of vehicle images
 */
router.get('/:id/images', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicle_images')
      .select('*')
      .eq('vehicle_id', id)
      .order('sort_order');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch images' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
