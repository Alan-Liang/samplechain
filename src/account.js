import { generateKeyPair, exportKey } from './util'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { createPrivateKey, createPublicKey, KeyObject, createSign, createVerify } from 'crypto'
import { promisify } from 'util'

const writeFile = promisify(writeFileCb)

export default class Account {
  constructor (pub, priv) {
    this.pub = pub
    this.priv = priv
  }

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

  sign (...data) {
    if (!this.priv) throw new Error('Private key must exist to sign a message')
    const sign = createSign('md5')
    for(let d of data) sign.update(d)
    sign.end()
    return sign.sign(this.priv, 'hex')
  }

  verify (sign, ...data) {
    const verify = createVerify('md5')
    for(let d of data) verify.update(d)
    verify.end()
    return verify.verify(this.pub, sign, 'hex')
  }

  static async generate () {
    const { publicKey, privateKey } = await generateKeyPair()
    return new Account(publicKey, privateKey)
  }
}

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
}
