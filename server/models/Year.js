import mongoose from 'mongoose';

const yearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Year = mongoose.model('Year', yearSchema);

export default Year;
