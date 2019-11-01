import { hash } from './util'
import { readFileSync } from 'fs'
import Transaction from './transaction'
import assert from 'assert'

export const difficulty = 0x0fffffffffffffffffffffffffffffff

export default class Block {
  constructor (options) {
    ;['prev', 'data', 'account', 'nonce', 'isGenesis'].forEach(prop => this[prop] = options[prop])
    this.init()
  }

  init () {
    // TODO
    this.id = hash(this.prev, JSON.stringify(this.data), this.account, this.nonce)
    assert(Array.isArray(this.data))
    this.data = this.data.map(tx => tx instanceof Transaction ? tx : new Transaction(tx))
    if(this.isGenesis) return
    if(!this.validate()) throw new Error('Invalid block')
  }

  validate () {
    // TODO
    if(!this.isGenesis && !parseInt(this.id, 16) < difficulty) return false
    if(!this.data.every(tx => tx instanceof Transaction)) return false
    if(!this.data.every(tx => tx.validate())) return false
    return true
  }

  toObject () {
    const obj = {}
    ;['prev', 'data', 'account', 'nonce', 'id'].forEach(prop => obj[prop] = this[prop])
    if(this.isGenesis) obj.isGenesis = this.isGenesis
    return obj
  }
}

export const genesis = new Block(JSON.parse(readFileSync('genesis.json')))
