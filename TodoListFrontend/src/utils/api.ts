import { ITask as Task } from "../types";

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${baseUrl}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  async createTask(text: string): Promise<Task[]> {
    try {
      const response = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, isChecked: false }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async deleteTask(id: number): Promise<Task[]> {
    try {
      const response = await fetch(`${baseUrl}/deleteTask`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async updateTaskStatus(id: number, isChecked: boolean): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentData: isChecked }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  },

  async updateTaskText(id: number, text: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentData: text }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task text: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating task text:", error);
      throw error;
    }
  },

  async register(username: string, email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to register: ${response.status}`);
      }
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to login: ${response.status}`);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to logout: ${response.status}`);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/check-auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return false;
        }
        throw new Error(`Failed to check auth: ${response.status}`);
      }
      
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  }
}; 