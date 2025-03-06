import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;