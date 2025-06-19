// Health check endpoint per monitoraggio servizi
export default defineEventHandler((event) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'jbelt-frontend-dev',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }
})