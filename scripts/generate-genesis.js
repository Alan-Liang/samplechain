require = require('esm')(module, { cjs: { dedefault: true } })
const { generateKeyPair, exportKey } = require('../src/util')
const { writeFileSync } = require('fs')
const { hash } = require('../src/util')

;(async () => {
  const {publicKey, privateKey} = await generateKeyPair()
  writeFileSync('public.pem', exportKey(publicKey))
  writeFileSync('private.pem', exportKey(privateKey))
  const block = {
    prev: '',
    data: [],
    account: exportKey(publicKey),
    nonce: '',
    isGenesis: true,
    height: 0,
    id: hash('', '[]', exportKey(publicKey), ''),
  }
  writeFileSync('genesis.json', JSON.stringify(block, null, 2))
})()
