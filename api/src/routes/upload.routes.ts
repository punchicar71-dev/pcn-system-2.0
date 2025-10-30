/**
 * Upload Routes - AWS S3 Image Upload Endpoints
 * Handles vehicle image uploads to S3
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { isS3Configured } from '../config/aws';
import {
  uploadToS3,
  generatePresignedUploadUrl,
  deleteFromS3,
  deleteVehicleImages,
  listVehicleImages,
} from '../utils/s3-upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage (files stored in memory, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Check S3 configuration status
 * NOTE: This endpoint doesn't require authentication since it's just checking config
 */
router.get('/status', (req: Request, res: Response) => {
  const configured = isS3Configured();
  res.json({
    s3Configured: configured,
    message: configured
      ? 'AWS S3 is properly configured'
      : 'AWS S3 is not configured. Please set environment variables.',
  });
});

/**
 * Generate presigned URL for direct browser upload
 * This is the recommended method - faster and more efficient
 * NOTE: No auth required here - requests come through Next.js proxy
 * which already validates Supabase session
 */
router.post(
  '/presigned-url',
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('imageType')
      .isIn(['gallery', 'image_360', 'cr_paper'])
      .withMessage('Invalid image type'),
    body('fileName').notEmpty().withMessage('File name is required'),
    body('mimeType').notEmpty().withMessage('MIME type is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      const { vehicleId, imageType, fileName, mimeType } = req.body;

      const result = await generatePresignedUploadUrl(
        vehicleId,
        imageType,
        fileName,
        mimeType
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate presigned URL',
      });
    }
  }
);

/**
 * Public upload endpoint (no authentication required)
 * Used by the dashboard for vehicle image uploads
 */
router.post(
  '/upload',
  upload.single('file'),
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('imageType')
      .isIn(['gallery', 'image_360', 'cr_paper'])
      .withMessage('Invalid image type'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const { vehicleId, imageType } = req.body;

      const result = await uploadToS3(
        req.file.buffer,
        vehicleId,
        imageType,
        req.file.originalname,
        req.file.mimetype
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload image',
      });
    }
  }
);

/**
 * Authenticated upload endpoint (requires JWT token)
 */
router.post(
  '/upload-authenticated',
  authenticateToken,
  upload.single('file'),
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('imageType')
      .isIn(['gallery', 'image_360', 'cr_paper'])
      .withMessage('Invalid image type'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const { vehicleId, imageType } = req.body;

      const result = await uploadToS3(
        req.file.buffer,
        vehicleId,
        imageType,
        req.file.originalname,
        req.file.mimetype
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload image',
      });
    }
  }
);

/**
 * Direct upload to S3 via server
 * (Deprecated in favor of presigned URLs; keeping comment for context)
 */

/**
 * Upload multiple images at once
 */
router.post(
  '/upload-multiple',
  authenticateToken,
  upload.array('images', 20), // Max 20 images
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('imageType')
      .isIn(['gallery', 'image_360', 'cr_paper'])
      .withMessage('Invalid image type'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
      }

      const { vehicleId, imageType } = req.body;

      // Upload all files in parallel
      const uploadPromises = files.map((file) =>
        uploadToS3(file.buffer, vehicleId, imageType, file.originalname, file.mimetype)
      );

      const results = await Promise.all(uploadPromises);

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successCount;

      res.json({
        success: failedCount === 0,
        total: results.length,
        successCount,
        failedCount,
        results,
      });
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images',
      });
    }
  }
);

/**
 * Delete single image
 */
router.delete(
  '/delete',
  authenticateToken,
  [body('key').notEmpty().withMessage('S3 key is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      const { key } = req.body;
      const success = await deleteFromS3(key);

      res.json({
        success,
        message: success ? 'Image deleted successfully' : 'Failed to delete image',
      });
    } catch (error) {
      console.error('Error deleting from S3:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
      });
    }
  }
);

/**
 * Delete all images for a vehicle
 */
router.delete(
  '/delete-vehicle/:vehicleId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      const { vehicleId } = req.params;
      const success = await deleteVehicleImages(vehicleId);

      res.json({
        success,
        message: success
          ? 'All vehicle images deleted successfully'
          : 'Failed to delete vehicle images',
      });
    } catch (error) {
      console.error('Error deleting vehicle images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete vehicle images',
      });
    }
  }
);

/**
 * List all images for a vehicle
 */
router.get(
  '/list/:vehicleId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (!isS3Configured()) {
        return res.status(503).json({
          success: false,
          error: 'AWS S3 is not configured',
        });
      }

      const { vehicleId } = req.params;
      const { imageType } = req.query;

      const images = await listVehicleImages(
        vehicleId,
        imageType as 'gallery' | 'image_360' | 'cr_paper' | undefined
      );

      res.json({
        success: true,
        vehicleId,
        imageType: imageType || 'all',
        count: images.length,
        images,
      });
    } catch (error) {
      console.error('Error listing vehicle images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list vehicle images',
      });
    }
  }
);

export default router;
