export const difficulty = 0x0fffffffffffffffffffffffffffffffn
export let chainData

import Block, { genesis } from './block'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { promisify } from 'util'
import assert from 'assert'

const writeFile = promisify(writeFileCb)

let dataChanged = false, updating = false
const updateInterval = 1000 // 1s
const chainFile = 'chain.json'

try {
  chainData = JSON.parse(readFileSync(chainFile)).map(b => new Block(b))
} catch(e) {
  chainData = { [genesis.id]: genesis }
  console.log('[INFO] Data file not found, using empty: ' + e)
}

export function addBlock (block) {
  assert(block instanceof Block)
  assert(!block.isGenesis)
  assert(block.validate())
  chainData[block.id] = block
  dataChanged = true
}

export function getLastBlock () {
  return [...Object.keys(chainData)].reduce((prev, curr) => curr.depth > prev.depth ? curr : prev, genesis)
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
      await writeFile(chainFile, JSON.stringify(data))
    } catch {
      console.log('[ERR] Cannot write data file')
    }
    updating = false
  }
}, updateInterval)
