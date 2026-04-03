import { api, setAuthToken } from './api';

const notesService = {
  async getNotes(token, params = {}) {
    try {
      setAuthToken(token);
      const response = await api.get('/notes', { params });
      return {
        success: response.data.success,
        message: response.data.msg,
        data: response.data.success ? response.data.data : [],
        pagination: response.data.pagination || null,
      };
    } catch {
      return {
        success: false,
        message: 'Failed to fetch notes',
        data: [],
        pagination: null,
      };
    }
  },

  async getNote(token, noteId) {
    try {
      setAuthToken(token);
      const response = await api.get(`/notes/${noteId}`);
      return {
        success: response.data.success,
        message: response.data.msg,
        data: response.data.success ? response.data.data : null,
      };
    } catch {
      return {
        success: false,
        message: 'Failed to fetch note',
        data: null,
      };
    }
  },

  async createNote(token, noteData) {
    try {
      setAuthToken(token);
      const response = await api.post('/notes', noteData);
      return {
        success: response.data.success,
        message: response.data.msg,
        data: response.data.success ? response.data.data : null,
        errors: response.data.errors || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Failed to create note',
        data: null,
        errors: error.response?.data?.errors || [],
      };
    }
  },

  async updateNote(token, noteId, noteData) {
    try {
      setAuthToken(token);
      const response = await api.put(`/notes/${noteId}`, noteData);
      return {
        success: response.data.success,
        message: response.data.msg,
        data: response.data.success ? response.data.data : null,
        errors: response.data.errors || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Failed to update note',
        data: null,
        errors: error.response?.data?.errors || [],
      };
    }
  },

  async deleteNote(token, noteId) {
    try {
      setAuthToken(token);
      const response = await api.delete(`/notes/${noteId}`);
      return {
        success: response.data.success,
        message: response.data.msg,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Failed to delete note',
      };
    }
  },

  async toggleArchive(token, noteId) {
    try {
      setAuthToken(token);
      const response = await api.patch(`/notes/${noteId}/archive`);
      return {
        success: response.data.success,
        message: response.data.msg,
        data: response.data.success ? response.data.data : null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Failed to archive/unarchive note',
        data: null,
      };
    }
  },
};

export default notesService;
