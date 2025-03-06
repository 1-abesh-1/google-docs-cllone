import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import 'react-quill/dist/quill.snow.css';

function Editor() {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDocument(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch document');
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Join document room when socket and document are ready
  useEffect(() => {
    if (socket && document) {
      socket.emit('join-document', id);

      socket.on('document-data', (data) => {
        setContent(data.content);
      });

      socket.on('receive-changes', (delta) => {
        if (quill) {
          quill.updateContents(delta);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('document-data');
        socket.off('receive-changes');
      }
    };
  }, [socket, document, id, quill]);

  // Save document periodically
  const saveDocument = useCallback(async () => {
    if (!document) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/documents/${id}`,
        {
          title,
          content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setLastSaved(new Date());
      setSaving(false);
    } catch (err) {
      console.error('Failed to save document', err);
      setSaving(false);
    }
  }, [document, id, title, content]);

  // Auto-save every 2 seconds if there are changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (document && content !== document.content) {
        saveDocument();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [document, content, saveDocument]);

  // Handle title change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Handle content change
  const handleContentChange = (value) => {
    setContent(value);
    
    if (socket && quill) {
      const delta = quill.getContents();
      socket.emit('send-changes', { delta, documentId: id });
    }
  };

  // Handle Quill editor reference
  const handleQuillRef = (quillInstance) => {
    if (quillInstance) {
      setQuill(quillInstance.getEditor());
    }
  };

  // Go back to document list
  const goBack = () => {
    navigate('/');
  };

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) {
    return <div className="loading">Loading document...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="editor-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <button className="btn btn-icon" onClick={goBack}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#4285F4', marginLeft: '8px' }}>
            description
          </span>
        </div>
        <div className="navbar-title">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={saveDocument}
          />
        </div>
        <div className="navbar-actions">
          <div style={{ fontSize: '14px', color: '#5f6368' }}>
            {saving ? 'Saving...' : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : ''}
          </div>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="document-container">
        <div className="document-paper">
          <ReactQuill
            ref={handleQuillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
          />
        </div>
      </div>
    </div>
  );
}

export default Editor;