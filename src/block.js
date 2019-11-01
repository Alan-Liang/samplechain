import { hash } from './util'

export default class Block {
  constructor (options) {
    ({ sign: this.sign, data: this.data, account: this.account } = options)
    this.init()
  }
  init () {
    // TODO
    if(!this.validate()) throw new Error('Invalid block')
  }
  validate () {
    // TODO
    return true
  }
}
