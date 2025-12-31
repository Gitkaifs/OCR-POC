import mongoose from 'mongoose';

const documentContentSchema = new mongoose.Schema(
  {
    // Reference to parent document
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },

    // Raw OCR output
    rawText: {
      type: String,
      default: ''
    },

    // Cleaned / processed OCR text
    cleanedText: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const DocumentContent = mongoose.model(
  'DocumentContent',
  documentContentSchema
);

export default DocumentContent;
