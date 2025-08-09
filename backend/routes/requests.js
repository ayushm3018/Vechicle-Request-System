import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin, requireEmployee } from '../middleware/auth.js';
import { sendNewRequestNotification, sendRequestStatusNotification } from '../utils/emailService.js';

const router = express.Router();

// Employee: Submit new vehicle request
router.post('/', [
  authenticateToken,
  requireEmployee,
  body('officer_name').trim().notEmpty().withMessage('Officer name is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('required_date').isISO8601().withMessage('Valid required date is required'),
  body('required_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid required time is required (HH:MM)'),
  body('report_place').trim().notEmpty().withMessage('Report place is required'),
  body('places_to_visit').trim().notEmpty().withMessage('Places to visit is required'),
  body('journey_purpose').trim().notEmpty().withMessage('Journey purpose is required'),
  body('release_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid release time is required (HH:MM)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const {
      officer_name,
      designation,
      required_date,
      required_time,
      report_place,
      places_to_visit,
      journey_purpose,
      release_time
    } = req.body;

    // Submit request
    const [result] = await pool.execute(
      `INSERT INTO vehicle_requests 
       (employee_id, officer_name, designation, required_date, required_time, 
        report_place, places_to_visit, journey_purpose, release_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, officer_name, designation, required_date, required_time, 
       report_place, places_to_visit, journey_purpose, release_time]
    );

    // Get the created request
    const [newRequest] = await pool.execute(
      'SELECT * FROM vehicle_requests WHERE id = ?',
      [result.insertId]
    );

    // Send email notification to admin
    try {
      await sendNewRequestNotification(newRequest[0]);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: 'Vehicle request submitted successfully',
      request: newRequest[0]
    });

  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Server error submitting request' });
  }
});

// Employee: Get own requests
router.get('/my-requests', authenticateToken, requireEmployee, async (req, res) => {
  try {
    const [requests] = await pool.execute(
      `SELECT vr.*, ar.vehicle_id, v.vehicle_number, v.make_model, v.driver_name
       FROM vehicle_requests vr
       LEFT JOIN approved_requests ar ON vr.id = ar.request_id
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       WHERE vr.employee_id = ?
       ORDER BY vr.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests });

  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// Admin: Get all requests
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT vr.*, u.name as employee_name, u.email as employee_email,
             ar.vehicle_id, v.vehicle_number, v.make_model, v.driver_name,
             ar.approved_by, admin.name as approved_by_name
      FROM vehicle_requests vr
      JOIN users u ON vr.employee_id = u.id
      LEFT JOIN approved_requests ar ON vr.id = ar.request_id
      LEFT JOIN vehicles v ON ar.vehicle_id = v.id
      LEFT JOIN users admin ON ar.approved_by = admin.id
    `;

    const queryParams = [];

    if (status) {
      query += ' WHERE vr.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY vr.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [requests] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM vehicle_requests vr';
    const countParams = [];
    
    if (status) {
      countQuery += ' WHERE vr.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({ 
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// Admin: Get single request
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.execute(
      `SELECT vr.*, u.name as employee_name, u.email as employee_email,
              ar.vehicle_id, v.vehicle_number, v.make_model, v.driver_name,
              ar.approved_by, admin.name as approved_by_name
       FROM vehicle_requests vr
       JOIN users u ON vr.employee_id = u.id
       LEFT JOIN approved_requests ar ON vr.id = ar.request_id
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       LEFT JOIN users admin ON ar.approved_by = admin.id
       WHERE vr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ request: requests[0] });

  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error fetching request' });
  }
});

// Admin: Approve request
router.post('/:id/approve', [
  authenticateToken,
  requireAdmin,
  body('vehicle_id').isInt({ min: 1 }).withMessage('Valid vehicle ID is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { vehicle_id } = req.body;

    // Check if request exists and is pending
    const [requests] = await connection.execute(
      'SELECT vr.*, u.email as employee_email FROM vehicle_requests vr JOIN users u ON vr.employee_id = u.id WHERE vr.id = ? AND vr.status = ?',
      [id, 'pending']
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Request not found or not pending' });
    }

    // Check if vehicle exists and is available
    const [vehicles] = await connection.execute(
      'SELECT * FROM vehicles WHERE id = ? AND is_available = true',
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Vehicle not found or not available' });
    }

    // Update request status
    await connection.execute(
      'UPDATE vehicle_requests SET status = ? WHERE id = ?',
      ['approved', id]
    );

    // Create approved request record
    await connection.execute(
      'INSERT INTO approved_requests (request_id, vehicle_id, approved_by) VALUES (?, ?, ?)',
      [id, vehicle_id, req.user.id]
    );

    // Mark vehicle as unavailable (optional - depends on business logic)
    // await connection.execute(
    //   'UPDATE vehicles SET is_available = false WHERE id = ?',
    //   [vehicle_id]
    // );

    await connection.commit();

    // Send approval email
    try {
      const requestData = { ...requests[0] };
      const vehicleInfo = vehicles[0];
      await sendRequestStatusNotification(requestData, 'approved', vehicleInfo);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({ message: 'Request approved successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error approving request' });
  } finally {
    connection.release();
  }
});

// Admin: Reject request
router.post('/:id/reject', [
  authenticateToken,
  requireAdmin,
  body('rejection_reason').trim().notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    // Check if request exists and is pending
    const [requests] = await pool.execute(
      'SELECT vr.*, u.email as employee_email FROM vehicle_requests vr JOIN users u ON vr.employee_id = u.id WHERE vr.id = ? AND vr.status = ?',
      [id, 'pending']
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found or not pending' });
    }

    // Update request status
    await pool.execute(
      'UPDATE vehicle_requests SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', rejection_reason, id]
    );

    // Send rejection email
    try {
      const requestData = { ...requests[0], rejection_reason };
      await sendRequestStatusNotification(requestData, 'rejected');
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({ message: 'Request rejected successfully' });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error rejecting request' });
  }
});

// Admin: Get dashboard statistics
router.get('/stats/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get request counts by status
    const [statusCounts] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM vehicle_requests 
      GROUP BY status
    `);

    // Get total vehicles and available vehicles
    const [vehicleCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_vehicles,
        SUM(is_available) as available_vehicles
      FROM vehicles
    `);

    // Get recent requests (last 7 days)
    const [recentRequests] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM vehicle_requests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Format the data
    const stats = {
      requests: {
        total: statusCounts.reduce((sum, item) => sum + item.count, 0),
        pending: statusCounts.find(item => item.status === 'pending')?.count || 0,
        approved: statusCounts.find(item => item.status === 'approved')?.count || 0,
        rejected: statusCounts.find(item => item.status === 'rejected')?.count || 0
      },
      vehicles: {
        total: vehicleCounts[0].total_vehicles || 0,
        available: vehicleCounts[0].available_vehicles || 0,
        assigned: (vehicleCounts[0].total_vehicles || 0) - (vehicleCounts[0].available_vehicles || 0)
      },
      recentRequests: recentRequests[0].count || 0
    };

    res.json({ stats });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

export default router;