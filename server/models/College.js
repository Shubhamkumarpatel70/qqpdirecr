import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const College = mongoose.model('College', collegeSchema);

export default College;
