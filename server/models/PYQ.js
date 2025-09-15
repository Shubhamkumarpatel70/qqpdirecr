import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  courseCategory: {
    type: String,
    required: true,
    enum: ['btech', 'bca', 'mca', 'mba', 'other']
  },
  file: {
    type: String // Path to uploaded file
  },
  link: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PYQ = mongoose.model('PYQ', pyqSchema);

export default PYQ;
