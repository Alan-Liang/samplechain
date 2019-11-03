require = require('esm')(module, { cjs: { dedefault: true } })
const { generateKeyPair } = require('../src/util')
const { writeFileSync } = require('fs')
const { hash } = require('../src/util')

;(async () => {
  const {publicKey, privateKey} = await generateKeyPair()
  writeFileSync('public.pem', publicKey)
  writeFileSync('private.pem', privateKey)
  const block = {
    prev: '',
    data: [],
    account: publicKey,
    nonce: '',
    isGenesis: true,
    height: 0,
    id: hash('', '[]', publicKey, ''),
  }
  writeFileSync('genesis.json', JSON.stringify(block, null, 2))
})()
