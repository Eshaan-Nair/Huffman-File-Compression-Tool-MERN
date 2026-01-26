import axios from 'axios';

// Use environment variable for API URL, fallback to local development
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds for file operations
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default instance;