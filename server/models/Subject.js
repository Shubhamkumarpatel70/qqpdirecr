import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
