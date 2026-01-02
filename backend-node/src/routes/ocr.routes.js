import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadImage, getAll } from '../controllers/Ocr.controller.js';

const router = express.Router();

/**
 * API 1: Upload Image (Create OCR ) , upload data to database.
 * POST /api/upload
 */
router.post('/upload', upload.single('image'), uploadImage);


/**
 * API 2: Get all documents from database and give back to user
 * GET /api/getall
 */
router.get('/getall' , getAll);

export default router;