const config = Object.freeze({
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://localhost:5000',
  CLIENT_URL: process.env.REACT_APP_CLIENT_URL || 'https://localhost:3000',
});

export default config;
