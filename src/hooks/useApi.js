// src/hooks/useApi.js - Custom hooks for API operations
import { useState, useEffect, useCallback } from "react";
import { notesApi, contactsApi, tasksApi } from "../services/api";

// Generic API hook
export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
}

// Notes hooks
export function useNotes(params = {}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesApi.getAll(params);
      setNotes(response.notes || response);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (noteData) => {
    try {
      const newNote = await notesApi.create(noteData);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const updatedNote = await notesApi.update(id, noteData);
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? updatedNote : note))
      );
      return updatedNote;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    pagination,
    refetch: loadNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useNote(id) {
  const {
    data: note,
    loading,
    error,
    execute,
  } = useApi(notesApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { note, loading, error, refetch: () => execute(id) };
}

// Contacts hooks
export function useContacts(params = {}) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsApi.getAll(params);
      setContacts(response.contacts || response);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const createContact = async (contactData) => {
    try {
      const newContact = await contactsApi.create(contactData);
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateContact = async (id, contactData) => {
    try {
      const updatedContact = await contactsApi.update(id, contactData);
      setContacts((prev) =>
        prev.map((contact) => (contact._id === id ? updatedContact : contact))
      );
      return updatedContact;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      await contactsApi.delete(id);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    contacts,
    loading,
    error,
    pagination,
    refetch: loadContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}

export function useContact(id) {
  const {
    data: contact,
    loading,
    error,
    execute,
  } = useApi(contactsApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { contact, loading, error, refetch: () => execute(id) };
}

// Tasks hooks
export function useTasks(params = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksApi.getAll(params);
      setTasks(response.tasks || response);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData) => {
    try {
      const newTask = await tasksApi.create(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const updatedTask = await tasksApi.update(id, taskData);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completeTask = async (id) => {
    return updateTask(id, {
      status: "completed",
      progress: 100,
      completedAt: new Date().toISOString(),
    });
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch: loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
}

export function useTask(id) {
  const {
    data: task,
    loading,
    error,
    execute,
  } = useApi(tasksApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { task, loading, error, refetch: () => execute(id) };
}

// Specialized hooks
export function useUpcomingTasks(days = 7) {
  const {
    data: tasks,
    loading,
    error,
    execute,
  } = useApi(tasksApi.getUpcoming, [days]);

  useEffect(() => {
    execute(days);
  }, [days, execute]);

  return {
    upcomingTasks: tasks?.tasks || [],
    loading,
    error,
    refetch: () => execute(days),
  };
}

export function useOverdueTasks() {
  const {
    data: tasks,
    loading,
    error,
    execute,
  } = useApi(tasksApi.getOverdue, []);

  useEffect(() => {
    execute();
  }, [execute]);

  return { overdueTasks: tasks?.tasks || [], loading, error, refetch: execute };
}

export function useFavoriteContacts() {
  const {
    data: contacts,
    loading,
    error,
    execute,
  } = useApi(contactsApi.getFavorites, []);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    favoriteContacts: contacts?.contacts || [],
    loading,
    error,
    refetch: execute,
  };
}

// Search hooks
export function useSearch(apiFunction, initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(
    async (searchQuery, filters = {}) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(searchQuery, filters);
        setResults(
          response.notes || response.contacts || response.tasks || response
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  };
}
