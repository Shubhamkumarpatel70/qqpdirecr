  import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Search = mongoose.model('Search', searchSchema);

export default Search;
