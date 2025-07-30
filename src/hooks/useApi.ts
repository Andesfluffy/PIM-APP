import { useState, useEffect, useCallback } from "react";
import { notesApi, contactsApi, tasksApi } from "../services/api";

// Base types
interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  data?: T;
  pagination?: PaginationInfo;
}

// Entity types
interface Note extends BaseEntity {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
}

interface Contact extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  isFavorite?: boolean;
  avatar?: string;
}

interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  tags?: string[];
  progress: number;
}

// API Response interfaces
interface NotesResponse extends ApiResponse<Note[]> {
  notes: Note[];
}

interface ContactsResponse extends ApiResponse<Contact[]> {
  contacts: Contact[];
}

interface TasksResponse extends ApiResponse<Task[]> {
  tasks: Task[];
}

// Hook return types
interface ApiHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
}

interface NotesHookReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createNote: (noteData: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
}

interface ContactsHookReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createContact: (contactData: Partial<Contact>) => Promise<Contact>;
  updateContact: (
    id: string,
    contactData: Partial<Contact>
  ) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
}

interface TasksHookReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<Task>;
}

interface SearchHookReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  loading: boolean;
  error: string | null;
  search: (searchQuery: string, filters?: Record<string, any>) => Promise<void>;
}

// Generic API hook
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  dependencies: any[] = []
): ApiHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
}

// Notes hooks
export function useNotes(params: Record<string, any> = {}): NotesHookReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const loadNotes = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response: NotesResponse = await notesApi.getAll(params);
      setNotes(response.notes || (response as unknown as Note[]));
      setPagination(response.pagination || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load notes";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (noteData: Partial<Note>): Promise<Note> => {
    try {
      const newNote: Note = await notesApi.create(noteData);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create note";
      setError(errorMessage);
      throw err;
    }
  };

  const updateNote = async (
    id: string,
    noteData: Partial<Note>
  ): Promise<Note> => {
    try {
      const updatedNote: Note = await notesApi.update(id, noteData);
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? updatedNote : note))
      );
      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update note";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete note";
      setError(errorMessage);
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

export function useNote(id: string): {
  note: Note | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<Note>;
} {
  const {
    data: note,
    loading,
    error,
    execute,
  } = useApi<Note>(notesApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { note, loading, error, refetch: () => execute(id) };
}

// Contacts hooks
export function useContacts(
  params: Record<string, any> = {}
): ContactsHookReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const loadContacts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response: ContactsResponse = await contactsApi.getAll(params);
      setContacts(response.contacts || (response as unknown as Contact[]));
      setPagination(response.pagination || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load contacts";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const createContact = async (
    contactData: Partial<Contact>
  ): Promise<Contact> => {
    try {
      const newContact: Contact = await contactsApi.create(contactData);
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create contact";
      setError(errorMessage);
      throw err;
    }
  };

  const updateContact = async (
    id: string,
    contactData: Partial<Contact>
  ): Promise<Contact> => {
    try {
      const updatedContact: Contact = await contactsApi.update(id, contactData);
      setContacts((prev) =>
        prev.map((contact) => (contact._id === id ? updatedContact : contact))
      );
      return updatedContact;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update contact";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteContact = async (id: string): Promise<void> => {
    try {
      await contactsApi.delete(id);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete contact";
      setError(errorMessage);
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

export function useContact(id: string): {
  contact: Contact | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<Contact>;
} {
  const {
    data: contact,
    loading,
    error,
    execute,
  } = useApi<Contact>(contactsApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { contact, loading, error, refetch: () => execute(id) };
}

// Tasks hooks
export function useTasks(params: Record<string, any> = {}): TasksHookReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response: TasksResponse = await tasksApi.getAll(params);
      setTasks(response.tasks || (response as unknown as Task[]));
      setPagination(response.pagination || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    try {
      const newTask: Task = await tasksApi.create(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      throw err;
    }
  };

  const updateTask = async (
    id: string,
    taskData: Partial<Task>
  ): Promise<Task> => {
    try {
      const updatedTask: Task = await tasksApi.update(id, taskData);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      throw err;
    }
  };

  const completeTask = async (id: string): Promise<Task> => {
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

export function useTask(id: string): {
  task: Task | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<Task>;
} {
  const {
    data: task,
    loading,
    error,
    execute,
  } = useApi<Task>(tasksApi.getById, [id]);

  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, [id, execute]);

  return { task, loading, error, refetch: () => execute(id) };
}

export function useUpcomingTasks(days: number = 7): {
  upcomingTasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<TasksResponse>;
} {
  const {
    data: tasks,
    loading,
    error,
    execute,
  } = useApi<TasksResponse>(tasksApi.getUpcoming, [days]);

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

export function useOverdueTasks(): {
  overdueTasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<TasksResponse>;
} {
  const {
    data: tasks,
    loading,
    error,
    execute,
  } = useApi<TasksResponse>(tasksApi.getOverdue, []);

  useEffect(() => {
    execute();
  }, [execute]);

  return { overdueTasks: tasks?.tasks || [], loading, error, refetch: execute };
}

export function useFavoriteContacts(): {
  favoriteContacts: Contact[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<ContactsResponse>;
} {
  const {
    data: contacts,
    loading,
    error,
    execute,
  } = useApi<ContactsResponse>(contactsApi.getFavorites, []);

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

export function useSearch<T extends Note | Contact | Task>(
  apiFunction: (
    query: string,
    filters?: Record<string, any>
  ) => Promise<T[] | { notes?: T[]; contacts?: T[]; tasks?: T[] }>,
  initialQuery: string = ""
): SearchHookReturn<T> {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      searchQuery: string,
      filters: Record<string, any> = {}
    ): Promise<void> => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(searchQuery, filters);

        let searchResults: T[] = [];
        if (Array.isArray(response)) {
          searchResults = response;
        } else if (typeof response === "object" && response !== null) {
          const responseObj = response as {
            notes?: T[];
            contacts?: T[];
            tasks?: T[];
          };
          searchResults =
            responseObj.notes ||
            responseObj.contacts ||
            responseObj.tasks ||
            [];
        }

        setResults(searchResults);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Search failed";
        setError(errorMessage);
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
