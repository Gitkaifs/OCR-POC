import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: true
    },
    csvPath: {
      type: String,
      default: ''
    },
    jsonPath: {
      type: String,
      default: ''
    },
    extractedText: {
      type: String,
      default: ''
    },
    tables: {
      type: Array,
      default: []
    },
    csvData: {
      type: String,
      default: ''
    },
    confidence: {
      type: Number,
      default: 0
    },
    tableCount: {
      type: Number,
      default: 0
    },
    meta: {
      originalFileName: String,
      fileSize: Number,
      mimeType: String
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;