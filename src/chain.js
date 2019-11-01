import Block, { genesis } from './block'
import { readFileSync, writeFile as writeFileCb } from 'fs'
import { promisify } from 'util'
import assert from 'assert'

const writeFile = promisify(writeFileCb)

export let chainData
let dataChanged = false, updating = false
const updateInterval = 1000 // 1s

try {
  chainData = JSON.parse(readFileSync('data.json')).map(b => new Block(b))
} catch(e) {
  chainData = [ genesis ]
  console.log('[INFO] Data file not found, using empty:' + e)
}

export function addBlock (block) {
  assert(block instanceof Block)
  assert(!block.isGenesis)
  chainData.push(block)
  dataChanged = true
}

setInterval(async () => {
  if(dataChanged && !updating) {
    updating = true
    dataChanged = false
    data = chainData.map(block => block.toObject())
    try {
      await writeFile('data.json', JSON.stringify(data))
    } catch {
      console.log('[ERR] Cannot write data file')
    }
    updating = false
  }
}, updateInterval)
