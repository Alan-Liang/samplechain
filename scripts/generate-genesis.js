require = require('esm')(module, { cjs: { dedefault: true } })
const { generateKeyPair, exportKey, hash } = require('../src/util')
const { writeFileSync } = require('fs')

;(async () => {
  const {publicKey, privateKey} = await generateKeyPair()
  writeFileSync('genesis-public.pem', exportKey(publicKey))
  writeFileSync('genesis-private.pem', exportKey(privateKey))
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
