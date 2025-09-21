// Environment variable validation
export function validateRequiredEnvVars() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on module load in production
if (process.env.NODE_ENV === 'production') {
  validateRequiredEnvVars();
}