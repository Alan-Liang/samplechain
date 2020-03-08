/** @module consts */

/** Frontend server port. */
export const fePort = parseInt(process.env.FE_PORT) || 34991
/** API server port. */
export const apiPort = parseInt(process.env.API_PORT) || 34992
/** "Central" server port, used for network discovery only. */
export const centralPort = parseInt(process.env.CENTRAL_PORT) || 34993
/** How often we try to sync the chain, in ms. */
export const syncInterval = 1000 // 1s
/** How often we fetch network peers from central, in ms. */
export const centralInterval = 10 * 1000 // 10s
/** FIXME: Seemingly not used */
export const updateInterval = 1000 // 1s
/** API server host. */
export const apiHost = process.env.API_HOST || '0.0.0.0'
/** Whether this server is a development (emulated) server */
export const isDev = process.env.NODE_ENV === 'development'
/** How many times we try to mine per second. */
export const hashesPerSec = 'pkg' in process ? 10 : (parseInt(process.env.HASHES_PER_SEC) || 10)
/** Chain difficulty. */
export const difficulty = BigInt('0x001fffffffffffffffffffffffffffff')
/** Transactions available per block. */
export const txPerBlock = 2
/** Maximum character count in a message. */
export const charPerTx = 16

if (isDev) {
  const log = console.log
  console.log = (...args) => log(apiPort, ...args)
}
