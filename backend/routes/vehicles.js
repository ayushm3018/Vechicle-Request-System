import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all vehicles (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [vehicles] = await pool.execute(
      'SELECT * FROM vehicles ORDER BY vehicle_number'
    );

    res.json({ vehicles });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server error fetching vehicles' });
  }
});

// Get available vehicles (admin only)
router.get('/available', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [vehicles] = await pool.execute(
      'SELECT * FROM vehicles WHERE is_available = true ORDER BY vehicle_number'
    );

    res.json({ vehicles });

  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({ message: 'Server error fetching available vehicles' });
  }
});

// Get single vehicle by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [vehicles] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ vehicle: vehicles[0] });

  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Server error fetching vehicle' });
  }
});

// Add new vehicle (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('vehicle_number').trim().notEmpty().withMessage('Vehicle number is required'),
  body('make_model').trim().notEmpty().withMessage('Make/Model is required'),
  body('driver_name').trim().notEmpty().withMessage('Driver name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { vehicle_number, make_model, driver_name, is_available = true } = req.body;

    // Check if vehicle number already exists
    const [existingVehicles] = await pool.execute(
      'SELECT id FROM vehicles WHERE vehicle_number = ?',
      [vehicle_number]
    );

    if (existingVehicles.length > 0) {
      return res.status(400).json({ message: 'Vehicle with this number already exists' });
    }

    // Add new vehicle
    const [result] = await pool.execute(
      'INSERT INTO vehicles (vehicle_number, make_model, driver_name, is_available) VALUES (?, ?, ?, ?)',
      [vehicle_number, make_model, driver_name, is_available]
    );

    // Get the created vehicle
    const [newVehicle] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      message: 'Vehicle added successfully',
      vehicle: newVehicle[0]
    });

  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ message: 'Server error adding vehicle' });
  }
});

// Update vehicle (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('vehicle_number').trim().notEmpty().withMessage('Vehicle number is required'),
  body('make_model').trim().notEmpty().withMessage('Make/Model is required'),
  body('driver_name').trim().notEmpty().withMessage('Driver name is required')
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
    const { vehicle_number, make_model, driver_name, is_available } = req.body;

    // Check if vehicle exists
    const [existingVehicles] = await pool.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [id]
    );

    if (existingVehicles.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle number already exists (excluding current vehicle)
    const [duplicateVehicles] = await pool.execute(
      'SELECT id FROM vehicles WHERE vehicle_number = ? AND id != ?',
      [vehicle_number, id]
    );

    if (duplicateVehicles.length > 0) {
      return res.status(400).json({ message: 'Vehicle with this number already exists' });
    }

    // Update vehicle
    await pool.execute(
      'UPDATE vehicles SET vehicle_number = ?, make_model = ?, driver_name = ?, is_available = ? WHERE id = ?',
      [vehicle_number, make_model, driver_name, is_available, id]
    );

    // Get updated vehicle
    const [updatedVehicle] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [id]
    );

    res.json({ 
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle[0]
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Server error updating vehicle' });
  }
});

// Delete vehicle (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const [existingVehicles] = await pool.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [id]
    );

    if (existingVehicles.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle is assigned to any approved requests
    const [assignedRequests] = await pool.execute(
      'SELECT id FROM approved_requests WHERE vehicle_id = ?',
      [id]
    );

    if (assignedRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vehicle. It has been assigned to requests.' 
      });
    }

    // Delete vehicle
    await pool.execute('DELETE FROM vehicles WHERE id = ?', [id]);

    res.json({ message: 'Vehicle deleted successfully' });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Server error deleting vehicle' });
  }
});

export default router;