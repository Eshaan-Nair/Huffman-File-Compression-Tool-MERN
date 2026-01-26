import axios from 'axios';

// Detect if we're on Netlify or local development
const isNetlify = window.location.hostname.includes('netlify.app');

// Use Netlify Functions path in production, local backend in development
const baseURL = isNetlify 
  ? '/.netlify/functions'  // Netlify serverless functions
  : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';  // Local development

const instance = axios.create({
  baseURL: baseURL,
  timeout: 60000, // Increased to 60 seconds for serverless functions
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default instance;