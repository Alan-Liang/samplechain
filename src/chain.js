export const difficulty = 0x002fffffffffffffffffffffffffffffn
export let chainData

import Block, { genesis } from './block'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { promisify } from 'util'
import assert from 'assert'
import { updateInterval } from './consts'
import Account, { account as defaultAccount } from './account'
import { exportKey, hash } from './util'
import Transaction, { txPerBlock } from './transaction'
import { txQueue } from './miner'

const writeFile = promisify(writeFileCb)

let dataChanged = false, updating = false
const chainFile = 'chain.json'

try {
  chainData = JSON.parse(readFileSync(chainFile))
  for(let id in chainData) chainData[id] = new Block(chainData[id])
} catch(e) {
  chainData = { [genesis.id]: genesis }
  console.log('[INFO] Data file not found, using empty: ' + e)
}

export function addBlock (block) {
  assert(block instanceof Block)
  assert(!block.isGenesis)
  assert(block.validate())
  assert(block.data.every(tx => tx.validateNew()))
  assert(block.data.every((tx, i) => block.data.every((tx1, j) => i === j || tx1.id !== tx.id)))
  chainData[block.id] = block
  dataChanged = true
}

export function getLastBlock () {
  return [...Object.values(chainData)].reduce((prev, curr) => curr.height > prev.height ? curr : prev, genesis)
}

export function getUsableTx (account = defaultAccount) {
  if (account instanceof Account) account = exportKey(account.pub)
  return [...Object.values(chainData)].filter(block => block.account === account).flatMap(block => {
    const usables = []
    for (let txCount of Array(txPerBlock).keys()) {
      const id = hash(block.id, String(txCount))
      if (Transaction.prototype.validateNew.call({ id }) && !txQueue.some(tx => tx.id === id)) usables.push({ block, txCount })
    }
    return usables
  })
}

setInterval(async () => {
  if(dataChanged && !updating) {
    updating = true
    dataChanged = false
    let data = {}
    for (let id in chainData) {
      data[id] = chainData[id].toObject()
    }
    try {
      await writeFile(chainFile,
        JSON.stringify(data, null, process.env.NODE_ENV === 'development' ? 2 : 0)
      )
    } catch {
      console.log('[ERR] Cannot write data file')
    }
    updating = false
  }
}, updateInterval)
