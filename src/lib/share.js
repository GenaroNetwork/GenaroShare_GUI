
import dnode from 'dnode'
import * as configs from './config'
const fs = require('fs')
const storj = require('storj-lib')
const path = require('path')
const {homedir} = require('os')
const mkdirPSync = require('./mkdirpsync')
const genaroshare = require('genaroshare-daemon')

// const defaultConfig = fs.readFileSync(
//   path.join(__dirname, 'config.prod.json')
// ).toString()

const defaultConfigPath = path.join(homedir(), '.config/edenshare/config.json')

function hasConfig () {
  return (fs.existsSync(defaultConfigPath))
}

function createConfig (shareSize) {
  let returnedPath = false
  let configFileDescriptor
  let storPath
  let config = configs.prodConfig
  config.networkPrivateKey = storj.KeyPair().getPrivateKey()
  let nodeID = storj.KeyPair(config.networkPrivateKey).getNodeID()
  let sharePath = path.join(
    homedir(),
    '.config/edenshare/shares'
  )

  if (config.storagePath === undefined || config.storagePath === '') {
    storPath = path.join(sharePath, '/', nodeID)
  } else {
    storPath = path.join(config.storagePath, '/')
  }

  config.storagePath = storPath

  config.storageAllocation = shareSize + 'GB'

  let logPath = path.join(
    homedir(),
    '.config/edenshare/logs'
  )

  let configPath = path.join(
    homedir(),
    '.config/genaroshare/configs'
  )

  try {
    mkdirPSync(config.storagePath)
    mkdirPSync(sharePath)
    mkdirPSync(logPath)
    mkdirPSync(configPath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.log(err)
    }
  }

  config.loggerOutputFile = logPath
  configPath = defaultConfigPath // path.join(configPath, '/') + nodeID + '.json'

  let configArray = JSON.stringify(config, null, 2).split('\n')

  let configBuffer = Buffer.from(configArray.join('\n'))

  try {
    genaroshare.utils.validate(config)
    configFileDescriptor = fs.openSync(configPath, 'w')
    fs.writeFileSync(configFileDescriptor, configBuffer)
    returnedPath = configPath
  } catch (err) {
    console.log(err)
  } finally {
    if (configFileDescriptor) {
      fs.closeSync(configFileDescriptor)
    }

    if (returnedPath) {
      config = {}
    }
  }
  return returnedPath
}

function setConfig (config) {
  createConfig()
}

function removeConfig () {
  fs.unlinkSync(defaultConfigPath)
}

function startShare () {
  dnode.connect(45015, (rpc) => {
    // Set up any required view-model store instances
    try {
      rpc.start(defaultConfigPath, (err) => {
        console.log('rpc started')
        console.log(err)
      })
    } catch (err) {
      console.log(err)
    }

    // setInterval(() => {
    //   rpc.status((err, shares) => {
    //     console.log('-----')
    //     console.log(err)
    //     console.log(shares)
    //   })
    // }, 3000)
  })
}

export {
  hasConfig,
  setConfig,
  startShare,
  createConfig,
  removeConfig
}
