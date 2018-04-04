#!/usr/bin/env node

'use strict'
const genaroshare = require('genaroshare-daemon')
const dnode = require('dnode')
let api = new genaroshare.RPC()

dnode(api.methods).listen(process.env.RPC_PORT, () => {
  console.log('listening..')
  process.send({state: 'init'})
})

process.on('uncaughtException', (err) => {
  Object.assign({}, err)
  process.send({error: err.stack}) // 'A Fatal Exception has occured in the genaroshare-daemon RPC server'
})
