/** @module util */

import { createHash, generateKeyPair as genKeyPairCb, KeyObject } from 'crypto'
import { promisify } from 'util'
import shuffle from 'fast-shuffle'
import { remotes } from './fe-server'
import { apiPort } from './consts'
import Account from './account'

const genKeyPair = promisify(genKeyPairCb)

/**
 * Calculates the MD5 of pieces of data.
 * @param  {...(string|Buffer)} data data to be hashed
 * @returns {string} MD5 data in hexadecimal
 */
export function hash (...data) {
  const h = createHash('md5')
  data.forEach(d => h.update(d))
  return h.digest('hex')
}

/**
 * @typedef {object} KeyPair
 * @property {KeyObject} publicKey public key object
 * @property {KeyObject} privateKey private key object
 */

/**
 * Generates a key pair.
 * @returns {KeyPair}
 */
export async function generateKeyPair () {
  return await genKeyPair('rsa', {
    modulusLength: 2048,
  })
}

/**
 * Exports a KeyObject to a string.
 * @param {KeyObject} key key object to be exported
 * @returns {string} PEM encoding of the key
 */
export function exportKey (key) {
  return key.export({
    format: 'pem',
    type: key.type === 'public' ? 'spki' : 'pkcs8',
  })
}

/**
 * @callback useRemotesCallback
 * @param {URL} remoteBase remote endpoint base URL
 */

/**
 * Pick at most 5 remotes at random and use them.
 * @param {useRemotesCallback} callback callback with one parameter of remote base URL.
 */
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

/**
 * Gets the "address" of a key or account.
 * @param {Account|KeyObject|string} key key to get the address
 * @returns {string}
 */
export function addressFromKey (key) {
  if (key instanceof Account) key = exportKey(key.pub)
  if (key instanceof KeyObject) key = exportKey(key)
  return key.substr(127, 8)
}
