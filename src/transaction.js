import { chainData } from './chain'

export default class Transaction {
  constructor ({ account, blockId, sign }) {
    this.account = account, this.blockId = blockId, this.sign = sign
    if(!this.validate()) throw new Error('invalid tx')
  }

  validate () {
    // TODO
    return true
  }
}
