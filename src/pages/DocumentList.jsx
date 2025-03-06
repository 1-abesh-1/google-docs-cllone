import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDocuments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch documents');
      setLoading(false);
    }
  };

  const createDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/documents',
        {
          title: 'Untitled Document',
          content: ''
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate(`/documents/${response.data._id}`);
    } catch (err) {
      setError('Failed to create document');
    }
  };

  const handleDocumentClick = (id) => {
    // Only navigate if we're not in edit mode
    if (editingId === null) {
      navigate(`/documents/${id}`);
    }
  };

  const startEditing = (e, doc) => {
    e.stopPropagation(); // Prevent document click
    setEditingId(doc._id);
    setEditTitle(doc.title);
  };

  const saveDocumentTitle = async (e) => {
    e.preventDefault();
    
    if (!editTitle.trim()) {
      setEditTitle('Untitled Document');
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/documents/${editingId}`,
        { title: editTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc._id === editingId ? { ...doc, title: editTitle } : doc
      ));
      
      // Exit edit mode
      setEditingId(null);
    } catch (err) {
      setError('Failed to update document title');
    }
  };

  const confirmDelete = (e, doc) => {
    e.stopPropagation(); // Prevent document click
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const deleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/documents/${documentToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setDocuments(documents.filter(doc => doc._id !== documentToDelete._id));
      
      // Close modal
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="document-page">
      <nav className="navbar">
        <div className="navbar-logo">
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#4285F4' }}>
            description
          </span>
          <h1 style={{ marginLeft: '8px' }}>Docs</h1>
        </div>
        <div className="navbar-actions">
          {user && (
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="document-list">
        <div className="document-list-header">
          <h2>My Documents</h2>
          <button className="btn btn-primary" onClick={createDocument}>
            <span className="material-symbols-outlined">add</span>
            New Document
          </button>
        </div>

        {loading ? (
          <p>Loading documents...</p>
        ) : error ? (
          <p>{error}</p>
        ) : documents.length === 0 ? (
          <p>No documents yet. Create a new one to get started!</p>
        ) : (
          <div className="document-grid">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="document-card"
                onClick={() => handleDocumentClick(doc._id)}
              >
                <div className="document-card-preview">
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#4285F4' }}>
                    description
                  </span>
                </div>
                <div className="document-card-info">
                  {editingId === doc._id ? (
                    <form onSubmit={saveDocumentTitle} className="edit-title-form">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="edit-title-input"
                      />
                      <button 
                        type="submit" 
                        className="btn btn-icon edit-title-save"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined">check</span>
                      </button>
                    </form>
                  ) : (
                    <div className="document-title-container">
                      <h3 className="document-card-title">{doc.title}</h3>
                      <div className="document-card-actions">
                        <button 
                          className="btn btn-icon document-action-btn"
                          onClick={(e) => startEditing(e, doc)}
                          title="Rename"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          className="btn btn-icon document-action-btn delete-btn"
                          onClick={(e) => confirmDelete(e, doc)}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="document-card-date">
                    {formatDate(doc.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocumentToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary delete-confirm-btn" 
                onClick={deleteDocument}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentList;