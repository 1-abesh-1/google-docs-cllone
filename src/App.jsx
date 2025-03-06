import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import DocumentList from './pages/DocumentList'
import Editor from './pages/Editor'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <DocumentList /> : <Navigate to="/login" />} />
      <Route path="/documents/:id" element={user ? <Editor /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App