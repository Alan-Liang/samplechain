import { createHash, generateKeyPair as genCb } from 'crypto'
import { promisify } from 'util'

const genKeyPair = promisify(genCb)

export function hash (str) {
  const h = createHash('sha256')
  h.update(str)
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
