import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds for file operations
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default instance;