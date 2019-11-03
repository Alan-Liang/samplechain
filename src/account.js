import { generateKeyPair } from './util'

export default class Account {
  constructor (pub, priv) {
    this.pub = pub
    this.priv = priv
  }
  validate () {
    // TODO
    return true
  }
  sign () {
    // TODO
  }
  static async generate () {
    const { publicKey, privateKey } = await generateKeyPair()
    return new Account(publicKey, privateKey)
  }
}
