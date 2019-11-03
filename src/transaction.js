import { chainData } from './chain'
import { hash } from './util'

export const txPerBlock = 4

export default class Transaction {
  constructor ({ blockId, txCount, data, sign, id }) {
    this.blockId = blockId, this.txCount = txCount, this.data = data, this.sign = sign
    if(id) this.id = id
    this.init()
  }

  init () {
    if(!this.id) this.id = hash(this.blockId, this.txCount)
    if(!this.validate()) throw new Error('invalid tx')
  }

  validate () {
    // TODO
    if(this.txCount >= txPerBlock) return false
    if(chainData.some(block => block.data.some(tx => tx.id === this.id))) return false
    return true
  }
}
