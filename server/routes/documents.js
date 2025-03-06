import express from 'express';
import Document from '../models/Document.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all documents for the current user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new document
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      owner: req.user._id
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a document
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updates = {};
    
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    const document = await Document.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.user._id },
          { collaborators: req.user._id }
        ]
      },
      updates,
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a collaborator to a document
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find document and check ownership
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is already a collaborator
    if (document.collaborators.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add user to collaborators
    document.collaborators.push(user._id);
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;