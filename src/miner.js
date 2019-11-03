import { randomBytes } from 'crypto'
import { hash } from './util'
import { difficulty, getLastBlock } from './chain'
import Block from './block'

let intervalId

export function start (hashesPerMs) {}
export function stop () {
  clearInterval(intervalId)
}

export function tryMine (account, data = [], lastBlock = getLastBlock()) {
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
