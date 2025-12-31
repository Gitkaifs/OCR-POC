import express from 'express';
import cors from 'cors';
import ocrRoutes from './routes/ocr.routes.js';

const app = express();

// Middleware
app.use(cors()); // Enable CORS for Flutter frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', ocrRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'OCR POC Backend is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large. Maximum size is 10MB'
      });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      error: 'Only image files are allowed'
    });
  }

  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

export default app;