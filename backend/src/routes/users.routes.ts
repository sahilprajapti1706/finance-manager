import { Router } from 'express';
import * as UsersController from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/users.schema';
import { ConflictError } from '../utils/errors';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * All routes below require:
 * 1. Authentication (valid JWT)
 * 2. Authorization (Admin role)
 */

router.use(authenticate, authorize('admin'));

/**
 * @route   GET /api/users
 * @desc    List all users (paginated)
 * @access  Private (Admin)
 */
router.get('/', UsersController.getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user manually
 * @access  Private (Admin)
 */
router.post('/', UsersController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user details
 * @access  Private (Admin)
 */
router.get('/:id', UsersController.getUserById);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user details (Role/Status)
 * @access  Private (Admin)
 */
router.patch('/:id', validate(updateUserSchema), UsersController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft deactivate a user
 * @access  Private (Admin)
 */
router.delete('/:id', UsersController.deleteUser);

export default router;
