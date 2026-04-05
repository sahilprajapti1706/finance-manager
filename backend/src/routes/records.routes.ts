import { Router } from 'express';
import * as RecordsController from '../controllers/records.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createRecordSchema, updateRecordSchema, queryRecordSchema } from '../schemas/records.schema';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * @route   GET /api/records
 * @desc    List all financial records with pagination and filtering
 * @access  Private (Viewer+)
 */
router.get('/', validate(queryRecordSchema, 'query'), RecordsController.getRecords);

/**
 * @route   GET /api/records/categories
 * @desc    Get list of unique categoriesFix the drop 
 * @access  Private (Viewer+)
 */
router.get('/categories', RecordsController.getCategories);
router.get('/export', RecordsController.exportRecords);
router.get('/export/json', RecordsController.exportRecordsJSON);

/**
 * @route   GET /api/records/:id
 * @desc    Get record details
 * @access  Private (Viewer+)
 */
router.get('/:id', RecordsController.getRecordById);

/**
 * @route   POST /api/records
 * @desc    Create a new financial record
 * @access  Private (Admin)
 */
router.post('/', authorize('analyst', 'admin'), validate(createRecordSchema), RecordsController.createRecord);

/**
 * @route   PATCH /api/records/:id
 * @desc    Update an existing financial record
 * @access  Private (Admin)
 */
router.patch('/:id', authorize('analyst', 'admin'), validate(updateRecordSchema), RecordsController.updateRecord);

/**
 * @route   DELETE /api/records/:id
 * @desc    Soft delete a financial record
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('analyst', 'admin'), RecordsController.deleteRecord);

export default router;
