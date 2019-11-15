export const fePort = parseInt(process.env.FE_PORT) || 34991
export const apiPort = parseInt(process.env.API_PORT) || 34992
export const centralPort = parseInt(process.env.CENTRAL_PORT) || 34993
export const syncInterval = 1000 // 1s
export const centralInterval = 10 * 1000 // 10s
export const updateInterval = 1000 // 1s
export const apiHost = process.env.API_HOST || '0.0.0.0'
export const isDev = process.env.NODE_ENV === 'development'
export const hashesPerSec = 'pkg' in process ? 10 : (parseInt(process.env.HASHES_PER_SEC) || 10)
export const difficulty = BigInt('0x001fffffffffffffffffffffffffffff')
export const txPerBlock = 2
export const charPerTx = 16

if (isDev) {
  const log = console.log
  console.log = (...args) => log(apiPort, ...args)
}
