import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadImage, getStatus, getResult } from '../controllers/ocr.controller.js';

const router = express.Router();

/**
 * API 1: Upload Image (Create OCR Job)
 * POST /api/upload
 */
router.post('/upload', upload.single('image'), uploadImage);

/**
 * API 2: Get OCR Status (Polling API)
 * GET /api/status/:jobId
 */
router.get('/status/:jobId', getStatus);

/**
 * API 3: Get OCR Result (Final Output)
 * GET /api/result/:jobId
 */
router.get('/result/:jobId', getResult);

export default router;