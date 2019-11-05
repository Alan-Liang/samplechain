import { chainData } from './chain'
import { hash } from './util'
import { account as defaultAccount } from './account'

export const txPerBlock = 4
export const charPerTx = 16

export default class Transaction {
  constructor ({ blockId, txCount, data, sign, id }) {
    this.blockId = blockId, this.txCount = txCount, this.data = data, this.sign = sign
    if (id) this.id = id
    this.init()
  }

  init () {
    if (!this.id) this.id = hash(this.blockId, String(this.txCount))
    if (!this.validate()) throw new Error('Invalid tx')
  }

  validate () {
    // TODO verify signature
    if (this.txCount >= txPerBlock) return false
    return true
  }

  validateNew () {
    // TODO replace with the longest chain
    return !([...Object.values(chainData)].some(block => block.data.some(tx => tx.id === this.id)))
  }

  toObject () {
    const obj = Object.create(null)
    for (let i of ['blockId', 'txCount', 'data', 'sign']) obj[i] = this[i]
    return obj
  }

  static create ({ blockId, account = defaultAccount, txCount, data }) {
    const txObj = {}
    txObj.blockId = blockId, txObj.txCount = txCount, txObj.data = data
    txObj.id = hash(blockId, String(txCount))
    txObj.sign = account.sign(txObj.id, txObj.data)
    const tx = new Transaction(txObj)
    if (!tx.validateNew()) throw new Error('Invalid tx')
    return tx
  }
}
