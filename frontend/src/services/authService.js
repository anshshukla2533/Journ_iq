const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data : null,
        errors: data.errors || []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        data: null,
        errors: []
      }
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data : null,
        errors: data.errors || []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        data: null,
        errors: []
      }
    }
  },

  // Get current user
  async getCurrentUser(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
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
        data: data.success ? data.user : null
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user data',
        data: null
      }
    }
  },

  // Update user profile
  async updateProfile(profileData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      return {
        success: data.success,
        message: data.msg,
        data: data.success ? data.user : null,
        errors: data.errors || []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please try again.',
        data: null,
        errors: []
      }
    }
  }
}

export default authService