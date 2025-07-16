import api from '../lib/axios';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  }
};

export const timeRecordsService = {
  getTimeRecords: async () => {
    const response = await api.get('/api/time-records');
    return response.data;
  },

  timeIn: async (employeeId, date, timeIn) => {
    const response = await api.post('/api/time-records/time-in', {
      employeeId,
      date,
      timeIn
    });
    return response.data;
  },

  timeOut: async (employeeId, date, timeOut) => {
    const response = await api.post('/api/time-records/time-out', {
      employeeId,
      date,
      timeOut
    });
    return response.data;
  }
};

// Employee services
export const employeeService = {
  getEmployees: async () => {
    const response = await api.get('/api/employees');
    return response.data;
  },

  getEmployee: async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  }
};
