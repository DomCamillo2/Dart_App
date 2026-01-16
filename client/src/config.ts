// Centralized configuration
// In development, this uses localhost.
// In production, we can set VITE_API_URL environment variable or it will use the same host if served together.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
