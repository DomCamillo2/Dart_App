// Centralized configuration
// In development, this uses localhost.
// In production, we can set VITE_API_URL environment variable.

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Render's Blueprint "host" property might exclude standard https:// prefix.
// We force it here for production environments if missing.
if (import.meta.env.PROD && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
}

export const API_URL = apiUrl;
