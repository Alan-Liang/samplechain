/** @module account */

import { generateKeyPair, exportKey } from './util'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { createPrivateKey, createPublicKey, KeyObject, createSign, createVerify } from 'crypto'
import { promisify } from 'util'

const writeFile = promisify(writeFileCb)

/** Class representing an endpoint account. */
export default class Account {
  /**
   * Create an  object.
   * @param {KeyObject} pub public key
   * @param {KeyObject} [priv] private key
   */
  constructor (pub, priv) {
    this.pub = pub
    this.priv = priv
  }

  /**
   * Validates the account object.
   * @returns {boolean}
   */
  validate () {
    if (!this.pub instanceof KeyObject) return false
    if (this.pub.type !== 'public') return false
    if (this.priv) {
      if (!this.priv instanceof KeyObject) return false
      if (this.priv.type !== 'private') return false
      const pub1 = createPublicKey(this.priv)
      if (exportKey(this.pub) !== exportKey(pub1)) return false
    }
    return true
  }

  /**
   * Sign pieces of data.
   * @param  {...(string|Buffer)} data data to sign
   * @returns {string} signature
   */
  sign (...data) {
    if (!this.priv) throw new Error('Private key must exist to sign a message')
    const sign = createSign('md5')
    for(let d of data) sign.update(d)
    sign.end()
    return sign.sign(this.priv, 'hex')
  }

  /**
   * Verifies pieces of data signed by `sign()`.
   * @param {string} sign the signature
   * @param  {...any} data data to verify
   * @returns {boolean}
   */
  verify (sign, ...data) {
    const verify = createVerify('md5')
    for(let d of data) verify.update(d)
    verify.end()
    return verify.verify(this.pub, sign, 'hex')
  }

  /**
   * Generates a new account.
   * @returns {Account}
   */
  static async generate () {
    const { publicKey, privateKey } = await generateKeyPair()
    return new Account(publicKey, privateKey)
  }
}

/** The account of the current andpoint. */
export let account
try {
  const priv = createPrivateKey(readFileSync('private.pem'))
  const pub = createPublicKey(priv)
  account = new Account(pub, priv)
} catch (e) {
  console.log('[INFO] Account file read failed, using new: ' + e)
  ;(async () => {
    account = await Account.generate()
    await writeFile('private.pem', exportKey(account.priv))
  })()
  account = { pub: { export () { return '' } } } // No reading from undefined
}
