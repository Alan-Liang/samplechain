import { createHash, generateKeyPair as genKeyPairCb } from 'crypto'
import { promisify } from 'util'

const genKeyPair = promisify(genKeyPairCb)

export function hash (...data) {
  const h = createHash('md5')
  data.forEach(d => h.update(d))
  return h.digest('hex')
}

export async function generateKeyPair () {
  return await genKeyPair('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })
}
