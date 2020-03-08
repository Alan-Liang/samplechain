/** @module transaction */

import { chainData, getLongestChain, getLastBlock } from './chain'
import { hash, addressFromKey } from './util'
import Account, { account as defaultAccount } from './account'
import { txPerBlock } from './consts'

/** Object representing a transaction. */
export default class Transaction {
  /**
   * Creates a transaction object.
   * @param {string} options.blockId block id of the transaction, see module:block~getUsableTx
   * @param {number} options.txCount tx count in the block, see module:block~getUsableTx
   * @param {any} options.data data to carry
   * @param {string} options.sign transaction signature
   * @param {string} [options.id] transaction ID in hexadecimal
   */
  constructor ({ blockId, txCount, data, sign, id }) {
    this.blockId = blockId, this.txCount = txCount, this.data = data, this.sign = sign
    if (id) this.id = id
    this.init()
  }

  /**
   * Initializes the tx object.
   * @throws {Error} on invalid tx
   */
  init () {
    if (!this.id) this.id = hash(this.blockId, String(this.txCount))
    if (!this.validate()) throw new Error('Invalid tx')
  }

  /**
   * Validates the tx.
   * @returns {boolean}
   */
  validate () {
    if(!(new Account(chainData[this.blockId].account).verify(this.sign, this.id, this.data))) return false
    if (this.txCount >= txPerBlock) return false
    return true
  }

  /**
   * Validates a new (incoming) transaction.
   * @param {module:block~Block} from the last block to check
   * @returns {boolean}
   */
  validateNew ( from = getLastBlock() ) {
    return !(getLongestChain(from).some(block => block.data.some(tx => tx.id === this.id)))
  }

  /**
   * Converts this tx to a network-transferrable object.
   * @returns {object}
   */
  toObject () {
    const obj = Object.create(null)
    for (let i of ['blockId', 'txCount', 'data', 'sign']) obj[i] = this[i]
    return obj
  }

  /** Converts this tx to an object to be displayed on FE. */
  toShowObject () {
    const obj = this.toObject()
    obj.account = chainData[this.blockId].account
    obj.address = addressFromKey(obj.account)
    return obj
  }

  /**
   * Creates a new (incoming) transaction.
   * @param {string} options.blockId block ID of the transaction, see module:block~getUsableTx
   * @param {Account} [options.account] account to create the transaction on, defaults to current account
   * @param {number} options.txCount tx count in the block, see module:block~getUsableTx
   * @param {any} data data to carry
   * @throws {Error} on invalid request (unlikely to happen in production)
   * @returns {Transaction}
   */
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
