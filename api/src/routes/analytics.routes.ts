import { Router, Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const dateRangeSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'year', 'all']).default('month'),
});

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get vehicle counts by status
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('status');

    if (vehiclesError) {
      console.error('Database error:', vehiclesError);
      return res.status(500).json({ error: 'Failed to fetch vehicle data' });
    }

    const vehicleCounts = {
      total: vehicles?.length || 0,
      available: vehicles?.filter(v => v.status === 'available' || v.status === 'In Sale').length || 0,
      sold: vehicles?.filter(v => v.status === 'sold' || v.status === 'Sold').length || 0,
      reserved: vehicles?.filter(v => v.status === 'reserved' || v.status === 'Reserved').length || 0,
    };

    // Get sales summary
    const { data: sales, error: salesError } = await supabase
      .from('pending_vehicle_sales')
      .select('status, selling_price, created_at');

    if (salesError) {
      console.error('Sales error:', salesError);
    }

    const salesSummary = {
      totalSales: sales?.filter(s => s.status === 'completed').length || 0,
      advancePaidSales: sales?.filter(s => s.status === 'advance_paid').length || 0,
      totalRevenue: sales?.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.selling_price || 0), 0) || 0,
    };

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSales } = await supabase
      .from('pending_vehicle_sales')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: recentVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get user count
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    res.json({
      vehicles: vehicleCounts,
      sales: salesSummary,
      recentActivity: {
        newSalesLast7Days: recentSales || 0,
        newVehiclesLast7Days: recentVehicles || 0,
      },
      users: {
        activeUsers: activeUsers || 0,
      },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *     responses:
 *       200:
 *         description: Sales analytics data
 */
router.get('/sales', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const queryResult = dateRangeSchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { start_date, end_date, period } = queryResult.data;

    // Calculate date range based on period
    let startDate: Date;
    const endDate = end_date ? new Date(end_date) : new Date();

    if (start_date) {
      startDate = new Date(start_date);
    } else {
      startDate = new Date();
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }
    }

    // Get completed sales in date range
    let query = supabase
      .from('pending_vehicle_sales')
      .select(`
        id,
        selling_price,
        payment_type,
        created_at,
        updated_at,
        sales_agents:sales_agent_id (id, name)
      `)
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    const { data: sales, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch sales data' });
    }

    // Calculate analytics
    const totalRevenue = sales?.reduce((sum, s) => sum + (s.selling_price || 0), 0) || 0;
    const totalSales = sales?.length || 0;
    const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group by payment type
    const byPaymentType = {
      cash: sales?.filter(s => s.payment_type === 'cash').length || 0,
      leasing: sales?.filter(s => s.payment_type === 'leasing').length || 0,
      bank_transfer: sales?.filter(s => s.payment_type === 'bank_transfer').length || 0,
    };

    // Group by sales agent
    const salesByAgent: Record<string, { name: string; count: number; revenue: number }> = {};
    sales?.forEach(sale => {
      const agent = sale.sales_agents as unknown as { id: string; name: string } | null;
      if (agent) {
        if (!salesByAgent[agent.id]) {
          salesByAgent[agent.id] = { name: agent.name, count: 0, revenue: 0 };
        }
        salesByAgent[agent.id].count++;
        salesByAgent[agent.id].revenue += sale.selling_price || 0;
      }
    });

    res.json({
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      summary: {
        totalSales,
        totalRevenue,
        averageSalePrice: Math.round(averageSalePrice),
      },
      byPaymentType,
      byAgent: Object.values(salesByAgent).sort((a, b) => b.revenue - a.revenue),
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/analytics/inventory:
 *   get:
 *     summary: Get inventory analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory analytics data
 */
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get vehicles with brand info
    const { data: vehicles, error } = await supabase
      .from('vehicle_inventory_view')
      .select('id, status, brand_name, fuel_type, transmission, price, created_at');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory data' });
    }

    const availableVehicles = vehicles?.filter(v => v.status === 'available') || [];

    // Group by brand
    const byBrand: Record<string, number> = {};
    availableVehicles.forEach(v => {
      const brand = v.brand_name || 'Unknown';
      byBrand[brand] = (byBrand[brand] || 0) + 1;
    });

    // Group by fuel type
    const byFuelType: Record<string, number> = {};
    availableVehicles.forEach(v => {
      const fuel = v.fuel_type || 'Unknown';
      byFuelType[fuel] = (byFuelType[fuel] || 0) + 1;
    });

    // Price distribution
    const priceRanges = {
      'Under 1M': availableVehicles.filter(v => (v.price || 0) < 1000000).length,
      '1M - 3M': availableVehicles.filter(v => (v.price || 0) >= 1000000 && (v.price || 0) < 3000000).length,
      '3M - 5M': availableVehicles.filter(v => (v.price || 0) >= 3000000 && (v.price || 0) < 5000000).length,
      '5M - 10M': availableVehicles.filter(v => (v.price || 0) >= 5000000 && (v.price || 0) < 10000000).length,
      'Over 10M': availableVehicles.filter(v => (v.price || 0) >= 10000000).length,
    };

    // Total inventory value
    const totalValue = availableVehicles.reduce((sum, v) => sum + (v.price || 0), 0);

    res.json({
      summary: {
        totalAvailable: availableVehicles.length,
        totalValue,
        averagePrice: availableVehicles.length > 0 ? Math.round(totalValue / availableVehicles.length) : 0,
      },
      byBrand: Object.entries(byBrand)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byFuelType: Object.entries(byFuelType)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byPriceRange: priceRanges,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/analytics/agents:
 *   get:
 *     summary: Get sales agents performance analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Sales agents analytics data
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const period = (req.query.period as string) || 'month';

    // Calculate start date
    const startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020);
        break;
    }

    // Get all sales agents
    const { data: agents } = await supabase.from('sales_agents').select('*').eq('status', 'active');

    // Get completed sales
    const { data: sales } = await supabase
      .from('pending_vehicle_sales')
      .select('sales_agent_id, selling_price')
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString());

    // Calculate per-agent stats
    const agentStats = (agents || []).map(agent => {
      const agentSales = sales?.filter(s => s.sales_agent_id === agent.id) || [];
      return {
        id: agent.id,
        name: agent.name,
        type: agent.agent_type,
        salesCount: agentSales.length,
        totalRevenue: agentSales.reduce((sum, s) => sum + (s.selling_price || 0), 0),
      };
    });

    // Sort by revenue
    agentStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      period,
      agents: agentStats,
      summary: {
        totalAgents: agents?.length || 0,
        activeAgents: agentStats.filter(a => a.salesCount > 0).length,
        topPerformer: agentStats[0] || null,
      },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
