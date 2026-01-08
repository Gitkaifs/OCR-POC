import app from './app.js';
import { initiateDB } from './db/index.js';
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 3000;

initiateDB()

app.listen(PORT, () => {
  console.log(`🚀 OCR POC Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload API: http://localhost:${PORT}/api/upload`);
  console.log(`📊 Status API: http://localhost:${PORT}/api/status/:jobId`);
  console.log(`📄 Result API: http://localhost:${PORT}/api/result/:jobId`);
});
