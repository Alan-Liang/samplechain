import { randomBytes } from 'crypto'
import { hash, exportKey } from './util'
import { getLastBlock, addBlock } from './chain'
import Block from './block'
import { account as defaultAccount } from './account'
import { hashesPerSec as hashesPerSecDefault, difficulty, txPerBlock } from './consts'

export const txQueue = []

let intervalId

export function start (hashesPerSec = hashesPerSecDefault) {
  intervalId = setInterval(() => {
    for (let _ of Array(hashesPerSec)) {
      const block = tryMine()
      if (block) {
        try {
          addBlock(block)
        } catch (e) {
          console.log('[ERROR] adding block: ' + e)
          continue
        }
        console.log('[INFO] Discovered block #' + block.id)
        txQueue.splice(0, txPerBlock)
      }
    }
  }, 1000)
}
export function stop () {
  clearInterval(intervalId)
}

export function tryMine (data = txQueue.slice(0, txPerBlock), account = defaultAccount, lastBlock = getLastBlock()) {
  if (typeof account !== 'string') {
    account = account.pub || account
    account = exportKey(account)
  }
  const nonce = randomBytes(16).toString('hex')
  const id = hash(lastBlock.id, JSON.stringify(data), account, nonce)
  if(BigInt('0x' + id) < difficulty) {
    return new Block({
      prev: lastBlock.id,
      data,
      account,
      nonce,
      id,
    })
  }
  return null
}

start()
