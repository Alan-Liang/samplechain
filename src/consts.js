export const fePort = parseInt(process.env.FE_PORT) || 34991
export const apiPort = parseInt(process.env.API_PORT) || 34992
export const centralPort = parseInt(process.env.API_PORT) || 34993
export const syncInterval = 1000 // 1s
export const centralInterval = 10 * 1000 // 10s
export const updateInterval = 1000 // 1s
export const apiHost = process.env.API_HOST || '0.0.0.0'
