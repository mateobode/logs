import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Process API error to extract meaningful information
 */
const processApiError = (error, operation) => {
  if (error.response) {
    // Server responded with error status
    console.error(`API Error (${operation}):`, {
      status: error.response.status,
      data: error.response.data
    });

    return {
      message: getErrorMessage(error.response.data),
      originalError: error
    };
  } else if (error.request) {
    // Request made but no response received
    console.error(`API Error (${operation}) - No response`);
    return {
      message: 'No response received from server. Please check your connection.',
      originalError: error
    };
  } else {
    // Request setup error
    console.error(`API Error (${operation}):`, error.message);
    return {
      message: `Error: ${error.message}`,
      originalError: error
    };
  }
};

/**
 * Extract readable error message from response data
 */
const getErrorMessage = (data) => {
  if (typeof data === 'string') return data;
  if (!data) return 'Unknown error occurred';

  // Handle specific error formats
  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors)
      ? data.non_field_errors.join(', ')
      : String(data.non_field_errors);
  }

  // Handle nested error object (our backend typically returns {error: {field: [messages]}})
  if (data.error) {
    if (typeof data.error === 'string') return data.error;

    if (typeof data.error === 'object') {
      // Check for non_field_errors inside the error object
      if (data.error.non_field_errors) {
        return Array.isArray(data.error.non_field_errors)
          ? data.error.non_field_errors.join(', ')
          : String(data.error.non_field_errors);
      }

      // Extract the first field error as a message
      const firstField = Object.keys(data.error)[0];
      if (firstField) {
        const fieldError = data.error[firstField];
        return `${firstField}: ${Array.isArray(fieldError) ? fieldError.join(', ') : String(fieldError)}`;
      }

      return 'Validation error occurred';
    }
  }

  if (data.message) return data.message;
  if (data.detail) return data.detail;

  // Try to create a readable message from field errors
  if (typeof data === 'object') {
    const messages = [];
    Object.entries(data).forEach(([field, message]) => {
      if (field !== 'error') { // Skip 'error' as we've already processed it
        const formattedMsg = Array.isArray(message) ? message.join(', ') : String(message);
        messages.push(`${field}: ${formattedMsg}`);
      }
    });

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  return 'An error occurred';
};

// Log API methods
const LogAPI = {
  // Get all logs with optional filtering
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs/', { params });
      return response.data;
    } catch (error) {
      throw processApiError(error, 'getLogs');
    }
  },

  // Get a single log by ID
  getLog: async (id) => {
    try {
      const response = await api.get(`/logs/${id}/`);
      return response.data;
    } catch (error) {
      throw processApiError(error, `getLog(${id})`);
    }
  },

  // Create a new log
  createLog: async (logData) => {
    try {
      const response = await api.post('/logs/', logData);
      return response.data;
    } catch (error) {
      throw processApiError(error, 'createLog');
    }
  },

  // Update an existing log
  updateLog: async (id, logData) => {
    try {
      const response = await api.put(`/logs/${id}/`, logData);
      return response.data;
    } catch (error) {
      throw processApiError(error, `updateLog(${id})`);
    }
  },

  // Delete a log
  deleteLog: async (id) => {
    try {
      await api.delete(`/logs/${id}/`);
      return true;
    } catch (error) {
      throw processApiError(error, `deleteLog(${id})`);
    }
  },

  // Query logs with filtering
  queryLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs/query/', { params });
      return response.data;
    } catch (error) {
      // Special handling for 404 "No logs found"
      if (error.response && error.response.status === 404) {
        return { results: [], count: 0 };
      }
      throw processApiError(error, 'queryLogs');
    }
  },

  // Get aggregated log data
  getAggregatedLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs/aggregate/', { params });
      return response.data;
    } catch (error) {
      // Special handling for 404 "No logs found"
      if (error.response && error.response.status === 404) {
        return {
          data: {
            total_logs: 0,
            by_severity: [],
            by_source: [],
            by_date: []
          },
          filters: params
        };
      }
      throw processApiError(error, 'getAggregatedLogs');
    }
  },

  // Download logs as CSV
  downloadCSV: async (params = {}) => {
    try {
      const response = await api.get('/logs/download_csv/', {
        params,
        responseType: 'blob'
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      throw processApiError(error, 'downloadCSV');
    }
  }
};

export default LogAPI;