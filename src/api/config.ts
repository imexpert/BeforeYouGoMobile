import Config from 'react-native-config';

console.log('Environment variables:', Config); // Debug için

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export const API_URL = Config.API_URL;

if (!API_URL) {
  console.error('Available env vars:', Config);
  throw new Error(`API_URL is not defined in environment variables. Current environment: ${process.env.NODE_ENV}`);
} 