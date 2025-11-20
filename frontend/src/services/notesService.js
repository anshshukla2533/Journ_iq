// Intelligently resolve API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  return '/api';
};

const API_BASE_URL = getApiUrl();

const notesService = {
  // Get all notes
  async getNotes(token, params = {}) {
    try {
      const queryParams = new URLSearchParams(params)
      const response = await fetch(`${API_BASE_URL}/notes?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.data : [],
        pagination: data.pagination || null
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch notes',
        data: [],
        pagination: null
      }
    }
  },

  // Get single note
  async getNote(token, noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.data : null
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch note',
        data: null
      }
    }
  },

  // Create new note
  async createNote(token, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.data : null,
        errors: data.errors || []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create note',
        data: null,
        errors: []
      }
    }
  },

  // Update note
  async updateNote(token, noteId, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.data : null,
        errors: data.errors || []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update note',
        data: null,
        errors: []
      }
    }
  },

  // Delete note
  async deleteNote(token, noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete note'
      }
    }
  },

  // Toggle archive status
  async toggleArchive(token, noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.data : null
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to archive/unarchive note',
        data: null
      }
    }
  }
}

export default notesService