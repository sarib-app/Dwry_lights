// api.js - Global API Service
const BASE_URL = 'https://planetdory.dwrylight.com/api';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Helper method to create headers
  createHeaders(includeAuth = false, token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const result = await response.json();
    
    // Check if the API response indicates success (status 200 in response body)
    if (result.status === 200) {
      return {
        success: true,
        data: result,
        status: result.status,
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.message || 'An error occurred',
        status: result.status || response.status,
        errors: result.errors || null
      };
    }
  }

  // User Registration
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // User Login
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(credentials),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // User Logout
  async logout(token) {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Get User Profile
  async getUserProfile(token) {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Update User Profile
  async updateProfile(userData, token) {
    try {
      const response = await fetch(`${this.baseURL}/user/update`, {
        method: 'PUT',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Password Reset Request
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({ email }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Reset Password
  async resetPassword(resetData) {
    try {
      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(resetData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Customer APIs
  async getCustomers(token, page = 1, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      }).toString();

      const response = await fetch(`${this.baseURL}/customers?${queryParams}`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  async createCustomer(customerData, token) {
    try {
      const response = await fetch(`${this.baseURL}/customers`, {
        method: 'POST',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(customerData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  async updateCustomer(customerId, customerData, token) {
    try {
      const response = await fetch(`${this.baseURL}/customers/${customerId}`, {
        method: 'PUT',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(customerData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  async deleteCustomer(customerId, token) {
    try {
      const response = await fetch(`${this.baseURL}/customers/${customerId}`, {
        method: 'DELETE',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Products APIs
  async getProducts(token, page = 1, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      }).toString();

      const response = await fetch(`${this.baseURL}/products?${queryParams}`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Sales APIs
  async createSale(saleData, token) {
    try {
      const response = await fetch(`${this.baseURL}/sales`, {
        method: 'POST',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(saleData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  async getSales(token, page = 1, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      }).toString();

      const response = await fetch(`${this.baseURL}/sales?${queryParams}`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Reports APIs
  async getSalesReport(token, dateRange) {
    try {
      const response = await fetch(`${this.baseURL}/reports/sales`, {
        method: 'POST',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(dateRange),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Inventory APIs
  async getInventory(token, page = 1, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      }).toString();

      const response = await fetch(`${this.baseURL}/inventory?${queryParams}`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Visit Tracking APIs
  async createVisit(visitData, token) {
    try {
      const response = await fetch(`${this.baseURL}/visits`, {
        method: 'POST',
        headers: this.createHeaders(true, token),
        body: JSON.stringify(visitData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }

  // Dashboard APIs
  async getDashboardData(token) {
    try {
      const response = await fetch(`${this.baseURL}/dashboard`, {
        method: 'GET',
        headers: this.createHeaders(true, token),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        networkError: true
      };
    }
  }
}

// Export singleton instance
export default new ApiService();