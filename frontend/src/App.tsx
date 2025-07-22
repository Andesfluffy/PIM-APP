import React, { useState, useEffect, createContext, useContext } from 'react';
import { Loader2, Plus, Edit3, Trash2, Save, X, User, LogOut, StickyNote, Users, CheckSquare } from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-function-app.azurewebsites.net/api';

// API Service
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Notes API
  async getNotes() {
    return this.request('/notes');
  }

  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id, noteData) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Contacts API
  async getContacts() {
    return this.request('/contacts');
  }

  async createContact(contactData) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id, contactData) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks API
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create API service instance
const apiService = new ApiService();

// Auth Context
const AuthContext = createContext();

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd verify the token with your auth service
      // For demo, we'll simulate a logged-in user
      setUser({ id: '1', email: 'demo@example.com', name: 'Demo User' });
      apiService.setToken(token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate auth - in production, integrate with Logto or Auth0
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock JWT token
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkRlbW8gVXNlciIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSJ9.mock-signature';
      
      const userData = {
        id: '1',
        email,
        name: email.split('@')[0]
      };
      
      setUser(userData);
      apiService.setToken(mockToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiService.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Login Component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">PIM App</h1>
          <p className="text-white/80">Personal Information Management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-white/60 text-sm mt-6 text-center">
          Demo: Use any email/password combination
        </p>
      </div>
    </div>
  );
};

// Notes Component
const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data for demo
      setNotes([
        { _id: '1', text: 'Welcome to your PIM app!', createdAt: new Date().toISOString() },
        { _id: '2', text: 'This connects to Azure Functions backend', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setCreating(true);
      const note = await apiService.createNote({ text: newNote.trim() });
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateNote = async () => {
    try {
      await apiService.updateNote(editingId, { text: editingText.trim() });
      setNotes(notes.map(note => 
        note._id === editingId ? { ...note, text: editingText.trim() } : note
      ));
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await apiService.deleteNote(id);
      setNotes(notes.filter(note => note._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditingText(note.text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a new note..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
          <button
            onClick={createNote}
            disabled={creating || !newNote.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 h-fit"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notes.map(note => (
          <div key={note._id} className="bg-white rounded-xl p-6 shadow-sm border">
            {editingId === note._id ? (
              <div className="space-y-4">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={updateNote}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 text-base leading-relaxed mb-4">{note.text}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Contacts Component
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err.message);
      // Fallback mock data
      setContacts([
        { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0456' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingContact) {
        await apiService.updateContact(editingContact._id, formData);
        setContacts(contacts.map(contact =>
          contact._id === editingContact._id ? { ...contact, ...formData } : contact
        ));
      } else {
        const newContact = await apiService.createContact(formData);
        setContacts([newContact, ...contacts]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setShowForm(false);
    setEditingContact(null);
  };

  const editContact = (contact) => {
    setEditingContact(contact);
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone });
    setShowForm(true);
  };

  const deleteContact = async (id) => {
    try {
      await apiService.deleteContact(id);
      setContacts(contacts.filter(contact => contact._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map(contact => (
          <div key={contact._id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 {contact.email}</p>
              <p>📞 {contact.phone}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editContact(contact)}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => deleteContact(contact._id)}
                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tasks Component
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '', status: 'pending' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
      // Fallback mock data
      setTasks([
        { _id: '1', title: 'Complete project documentation', status: 'pending', dueDate: '2025-07-25' },
        { _id: '2', title: 'Review code changes', status: 'completed', dueDate: '2025-07-22' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const newTask = await apiService.createTask(formData);
      setTasks([newTask, ...tasks]);
      setFormData({ title: '', dueDate: '', status: 'pending' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await apiService.updateTask(id, { status });
      setTasks(tasks.map(task =>
        task._id === id ? { ...task, status } : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiService.deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task._id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
            </div>