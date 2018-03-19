
import dnode from 'dnode'
import * as configs from './config'
const fs = require('fs')
const storj = require('storj-lib')
const path = require('path')
const mkdirPSync = require('./mkdirpsync')
const genaroshare = require('genaroshare-daemon')
const os = require('os')

const basePath = path.join(os.homedir(), '.config/genaroshare')
mkdirPSync(basePath)
const configDir = path.join(basePath, 'configs');
mkdirPSync(configDir)
const logDir = path.join(basePath, 'logs');
mkdirPSync(logDir)

const config_files = []
function _initConfigs() {
  fs.readdirSync(configDir).forEach(file => {
    if(file.endsWith('.json')) {
      console.log(`add config file: ${file}`);
      config_files.push(file)
    }
  })  
}
_initConfigs()

function hasConfig () {
  return config_files.length !== 0
}

function createConfig (shareSize, shareUnit, shareBasePath) {
  let returnedPath = false
  let configFileDescriptor
  let storPath
  let config = configs.prodConfig
  config.networkPrivateKey = storj.KeyPair().getPrivateKey()
  let nodeID = storj.KeyPair(config.networkPrivateKey).getNodeID()
  let sharePath = shareBasePath

  if (config.storagePath === undefined || config.storagePath === '') {
    storPath = path.join(sharePath, '/', nodeID)
  } else {
    storPath = path.join(config.storagePath, '/')
  }

  config.storagePath = storPath
  config.shareBasePath = shareBasePath
  config.storageAllocation = shareSize + shareUnit

  let logPath = path.join(
      shareBasePath,
    '.config/genaroshare/logs'
  )

  let configPath = path.join(
      shareBasePath,
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
  configPath = path.join(
      shareBasePath,
      '.config/genaroshare/config.json'
  );

  config.loggerOutputFile = logPath
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
  }
  return returnedPath
}

function removeConfig (shareBasePath) {
    let configPath = path.join(
        shareBasePath,
        '.config/genaroshare/config.json'
    );
    fs.unlinkSync(configPath)
}

function startShare (configPath) {
  dnode.connect(45015, (rpc) => {
    // Set up any required view-model store instances
    try {
      rpc.start(configPath, (err) => {
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
  startShare,
  createConfig,
  removeConfig
}
