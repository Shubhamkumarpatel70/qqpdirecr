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
  college: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  file: {
    type: String // Path to uploaded file
  },
  link: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'coming soon', 'approved'],
    default: 'approved'
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
