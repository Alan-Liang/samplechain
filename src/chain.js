export const difficulty = 0x002fffffffffffffffffffffffffffffn
export let chainData

import Block, { genesis } from './block'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { promisify } from 'util'
import assert from 'assert'
import { updateInterval } from './consts'

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
  chainData[block.id] = block
  dataChanged = true
}

export function getLastBlock () {
  return [...Object.values(chainData)].reduce((prev, curr) => curr.height > prev.height ? curr : prev, genesis)
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
