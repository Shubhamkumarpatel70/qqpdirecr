import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
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

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;
