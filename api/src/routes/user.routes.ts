import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const router = Router();

// Validation schemas
const userQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

const userCreateSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
  access_level: z.enum(['full_access', 'manage_inventory', 'manage_sales', 'view_only']).default('view_only'),
  status: z.enum(['active', 'inactive']).default('active'),
});

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  access_level: z.enum(['full_access', 'manage_inventory', 'manage_sales', 'view_only']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, editor, viewer]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const queryResult = userQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: queryResult.error.issues });
    }

    const { limit, offset, role, status, search } = queryResult.data;

    let query = supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role, access_level, status, avatar_url, created_at, updated_at, last_sign_in_at', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,username.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, role, access_level, status, avatar_url, created_at, updated_at, last_sign_in_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, editor, viewer]
 *               access_level:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or email already exists
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const bodyResult = userCreateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid user data', details: bodyResult.error.issues });
    }

    const { password, ...userData } = bodyResult.data;

    // Check if email already exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', userData.email).single();
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        password_hash: passwordHash,
        full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null,
      })
      .select('id, email, username, first_name, last_name, role, access_level, status, created_at')
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Failed to create user', details: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
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
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const bodyResult = userUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid user data', details: bodyResult.error.issues });
    }

    const { password, ...updateData } = bodyResult.data;

    // Check if user exists
    const { data: existing } = await supabase.from('users').select('id').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare update object
    const updateObj: Record<string, unknown> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Update full_name if first/last name changed
    if (updateData.first_name || updateData.last_name) {
      updateObj.full_name = `${updateData.first_name || ''} ${updateData.last_name || ''}`.trim() || null;
    }

    // Hash new password if provided
    if (password) {
      updateObj.password_hash = await bcrypt.hash(password, 12);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateObj)
      .eq('id', id)
      .select('id, email, username, first_name, last_name, role, access_level, status, updated_at')
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update user', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const { data: existing } = await supabase.from('users').select('id').eq('id', id).single();
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related sessions first
    await supabase.from('sessions').delete().eq('user_id', id);
    await supabase.from('notifications').delete().eq('user_id', id);

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }

    res.json({ message: 'User deleted successfully', id });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
