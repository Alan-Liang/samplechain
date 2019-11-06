import { createHash, generateKeyPair as genKeyPairCb, KeyObject } from 'crypto'
import { promisify } from 'util'
import shuffle from 'fast-shuffle'
import { remotes } from './fe-server'
import { apiPort } from './consts'
import Account from './account'

const genKeyPair = promisify(genKeyPairCb)

export function hash (...data) {
  const h = createHash('md5')
  data.forEach(d => h.update(d))
  return h.digest('hex')
}

export async function generateKeyPair () {
  return await genKeyPair('rsa', {
    modulusLength: 2048,
  })
}

export function exportKey (key) {
  return key.export({
    format: 'pem',
    type: key.type === 'public' ? 'spki' : 'pkcs8',
  })
}

export async function useRemotes (callback) {
  let remotesUsed = remotes
  if(remotes.length > 5) remotesUsed = shuffle(remotes).slice(0, 5)
  for (let remote of remotesUsed) {
    const remoteBase = new URL('http://localhost')
    remoteBase.hostname = remote
    remoteBase.port = apiPort
    if (Number(remote)) {
      remoteBase.hostname = '127.0.0.1'
      remoteBase.port = Number(remote)
    }
    try { await callback(remoteBase) } catch {}
  }
}

export function addressFromKey (key) {
  if (key instanceof Account) key = exportKey(key.pub)
  if (key instanceof KeyObject) key = exportKey(key)
  return key.substr(127, 8)
}
