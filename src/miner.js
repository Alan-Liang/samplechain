import { randomBytes } from 'crypto'
import { hash, exportKey } from './util'
import { difficulty, getLastBlock, addBlock } from './chain'
import Block from './block'
import { account as defaultAccount } from './account'

let intervalId

export function start (hashesPerSec) {
  intervalId = setInterval(() => {
    for(let _ of new Array(hashesPerSec)) {
      const block = tryMine()
      if(block) addBlock(block)
    }
  }, 1000)
}
export function stop () {
  clearInterval(intervalId)
}

export function tryMine (account = defaultAccount, data = [], lastBlock = getLastBlock()) {
  if(typeof account !== 'string') {
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
