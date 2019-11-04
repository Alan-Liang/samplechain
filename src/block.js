import { hash } from './util'
import { readFileSync } from 'fs'
import Transaction from './transaction'
import assert from 'assert'
import { chainData, difficulty } from './chain'

export default class Block {
  constructor (options) {
    ;['prev', 'data', 'account', 'nonce', 'isGenesis', 'id', 'height'].forEach(prop => this[prop] = options[prop])
    this.init()
  }

  init () {
    // TODO
    assert(this.isGenesis || chainData[this.prev], 'No previous block')
    if(!this.id) this.id = hash(this.prev, JSON.stringify(this.data), this.account, this.nonce)
    if(typeof this.height !== 'number') this.height = chainData[this.prev].height + 1
    assert(Array.isArray(this.data))
    this.data = this.data.map(tx => tx instanceof Transaction ? tx : new Transaction(tx))
    if(this.isGenesis) return
    if(!this.validate()) throw new Error('Invalid block')
  }

  validate () {
    // TODO
    if(!this.isGenesis && !(BigInt('0x' + this.id) < difficulty)) return false
    if(!this.data.every(tx => tx instanceof Transaction)) return false
    if(!this.data.every(tx => tx.validate())) return false
    return true
  }

  toObject () {
    const obj = {}
    ;['prev', 'account', 'nonce', 'id', 'height'].forEach(prop => obj[prop] = this[prop])
    obj.data = this.data.map(tx => tx.toObject())
    if(this.isGenesis) obj.isGenesis = this.isGenesis
    return obj
  }
}

export const genesis = new Block(JSON.parse(readFileSync('genesis.json')))