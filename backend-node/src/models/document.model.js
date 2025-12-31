import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    // Path of image stored in local uploads folder
    imagePath: {
      type: String,
      required: true
    },

    // Final cleaned OCR text (for quick access / listing)
    extractedText: {
      type: String,
      default: ''
    },

    // File metadata
    meta: {
      originalFileName: {
        type: String
      },
      fileSize: {
        type: Number
      },
      mimeType: {
        type: String
      }
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
