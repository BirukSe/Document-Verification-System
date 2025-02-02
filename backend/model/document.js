import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalImageUrl: {
    type: String,
    required: true,
    unique: true, // Ensures each image URL is unique
  },
  qrCodeData: {
    type: String,
    required: true,
    unique: true, // Ensure the QR code data is unique
  },
  publicId: {
    type: String,
    required: true, // Store the Cloudinary public ID for easy access
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false, // Whether the document has been verified
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
