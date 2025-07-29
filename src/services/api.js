const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:7071/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  async getAll(resource, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/${resource}?${queryString}`
      : `/${resource}`;
    return this.request(endpoint);
  }

  async getById(resource, id) {
    return this.request(`/${resource}/${id}`);
  }

  async create(resource, data) {
    return this.request(`/${resource}`, {
      method: "POST",
      body: data,
    });
  }

  async update(resource, id, data) {
    return this.request(`/${resource}/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async delete(resource, id) {
    return this.request(`/${resource}/${id}`, {
      method: "DELETE",
    });
  }
}

const apiService = new ApiService();

export const notesApi = {
  async getAll(params = {}) {
    return apiService.getAll("notes", params);
  },

  async getById(id) {
    return apiService.getById("notes", id);
  },

  async create(note) {
    return apiService.create("notes", note);
  },

  async update(id, note) {
    return apiService.update("notes", id, note);
  },

  async delete(id) {
    return apiService.delete("notes", id);
  },

  async search(searchTerm, filters = {}) {
    return apiService.getAll("notes", { search: searchTerm, ...filters });
  },

  async getByCategory(category) {
    return apiService.getAll("notes", { category });
  },
};

export const contactsApi = {
  async getAll(params = {}) {
    return apiService.getAll("contacts", params);
  },

  async getById(id) {
    return apiService.getById("contacts", id);
  },

  async create(contact) {
    return apiService.create("contacts", contact);
  },

  async update(id, contact) {
    return apiService.update("contacts", id, contact);
  },

  async delete(id) {
    return apiService.delete("contacts", id);
  },

  async search(searchTerm, filters = {}) {
    return apiService.getAll("contacts", { search: searchTerm, ...filters });
  },

  async getByGroup(group) {
    return apiService.getAll("contacts", { group });
  },

  async getFavorites() {
    return apiService.getAll("contacts", { isFavorite: true });
  },
};

export const tasksApi = {
  async getAll(params = {}) {
    return apiService.getAll("tasks", params);
  },

  async getById(id) {
    return apiService.getById("tasks", id);
  },

  async create(task) {
    return apiService.create("tasks", task);
  },

  async update(id, task) {
    return apiService.update("tasks", id, task);
  },

  async delete(id) {
    return apiService.delete("tasks", id);
  },

  async search(searchTerm, filters = {}) {
    return apiService.getAll("tasks", { search: searchTerm, ...filters });
  },

  async getByStatus(status) {
    return apiService.getAll("tasks", { status });
  },

  async getByPriority(priority) {
    return apiService.getAll("tasks", { priority });
  },

  async getByCategory(category) {
    return apiService.getAll("tasks", { category });
  },

  async getUpcoming(days = 7) {
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);
    return apiService.getAll("tasks", {
      dueDateTo: toDate.toISOString(),
      status: "todo,in-progress",
    });
  },

  async getOverdue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apiService.getAll("tasks", {
      dueDateTo: today.toISOString(),
      status: "todo,in-progress",
    });
  },
};

export default apiService;
