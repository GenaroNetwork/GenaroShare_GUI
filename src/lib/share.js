
import dnode from 'dnode'
import * as configs from './config'
import {RPC_PORT} from '../config'
const fs = require('fs')
const storj = require('storj-lib')
const path = require('path')
const mkdirPSync = require('./mkdirpsync')
const genaroshare = require('genaroshare-daemon')
const os = require('os')
const events = require('events');
const shareEventEmitter = new events.EventEmitter();
const { shell } = require('electron')

const BASE_PATH = path.join(os.homedir(), '.config/genaroshare')
try {
  mkdirPSync(BASE_PATH)
  console.log(`config base path: ${BASE_PATH}`)
} catch (error) { }
const CONFIG_DIR = path.join(BASE_PATH, 'configs');
try {
  mkdirPSync(CONFIG_DIR)
  console.log(`config path: ${CONFIG_DIR}`)
} catch (error) { }
const LOG_DIR = path.join(BASE_PATH, 'logs');
try {
  mkdirPSync(LOG_DIR)
  console.log(`log path: ${LOG_DIR}`)
} catch (error) { }

const configIds = []
function _initConfigs() {
  fs.readdirSync(CONFIG_DIR).forEach(file => {
    let fileobj = path.parse(file)
    if (fileobj.ext === '.json' && fileobj.name.length === 40) {
      console.log(`add config file: ${file}`)
      configIds.push(fileobj.name)
    }
  })
}
_initConfigs()
function _getConfigPathById(nodeId) {
  return path.join(
    CONFIG_DIR,
    `${nodeId}.json`
  );
}

function _remove(nodeId) {
  const configPath = _getConfigPathById(nodeId)
  fs.unlinkSync(configPath)
  console.log(`${configPath} deleted`)
}

/**
 * create config with parameters and return nodeID
 * @param {*} shareSize 
 * @param {*} shareUnit 
 * @param {*} shareBasePath 
 */
function create(shareSize, shareUnit, shareBasePath) {
  console.log(`create config with size: ${shareSize}${shareUnit}, path: ${shareBasePath}`)
  let returnedPath = false
  let configFileDescriptor
  let storPath
  let config = configs.prodConfig
  config.networkPrivateKey = storj.KeyPair().getPrivateKey()
  let nodeID = storj.KeyPair(config.networkPrivateKey).getNodeID()
  console.log(`creating node id: ${nodeID}`)
  config.storagePath = shareBasePath
  try {
    mkdirPSync(shareBasePath)
  } catch (err) { }

  if (config.storagePath === undefined || config.storagePath === '') {
    storPath = path.join(sharePath, '/', nodeID)
  } else {
    storPath = path.join(config.storagePath, '/')
  }

  config.storagePath = storPath
  config.storageAllocation = shareSize + shareUnit

  let configFilePath = path.join(
    CONFIG_DIR,
    `${nodeID}.json`
  );

  config.loggerOutputFile = LOG_DIR
  let configArray = JSON.stringify(config, null, 2).split('\n')
  let configBuffer = Buffer.from(configArray.join('\n'))
  try {
    genaroshare.utils.validate(config)
    configFileDescriptor = fs.openSync(configFilePath, 'w')
    fs.writeFileSync(configFileDescriptor, configBuffer)
    console.log(`wrote config file to: ${configFilePath}`)
  } catch (err) {
    console.log(err)
  } finally {
    if (configFileDescriptor) {
      fs.closeSync(configFileDescriptor)
    }
  }
  _initConfigs()
  return nodeID
}

function start(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    let configPath = _getConfigPathById(nodeId);
    remote.start(configPath, (err) => {
      if (cb) {
        cb(err);
      }
      d.end();
    });
  });
}

function startAll(cb) {
  let errs = []
  let len = configIds.length
  configIds.forEach(nodeId => {
    start(nodeId, err => {
      if (err) errs.push(err)
      len--
      if (cb) {
        if (len === 0) {
          if (errs.length > 0) {
            cb(errs)
          } else {
            cb()
          }
        }
      }
    })
  })
}

function stop(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.stop(nodeId, (err) => {
      if (cb) {
        cb(err);
      }
      d.end();
    });
  });
}

function restart(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.restart(nodeId, (err) => {
      if (cb) {
        cb(err);
      }
      d.end();
    });
  });
}

function status(cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.status((err, statuses) => {
      if (cb) {
        cb(err, statuses);
      }
      d.end();
    });
  });
}

function destory(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.destory(nodeId, (err) => {
      _remove(nodeId);
      if (cb) {
        cb(err);
      }
      d.end();
    });
  });
}

function checkReward(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.checkReward(nodeId, (err, data) => {
      if (cb) {
        cb(err, data);
      }
      d.end();
    });
  });
}

function getReward(nodeId, cb) {
  let d = dnode.connect(RPC_PORT);
  d.on('remote', (remote) => {
    remote.getReward(nodeId, (err, data) => {
      if (cb) {
        cb(err, data);
      }
      d.end();
    });
  });
}

function openLogFolder() {
  shell.showItemInFolder(LOG_DIR)
}

function openConfig(nodeId) {
  const configPath = _getConfigPathById(nodeId)
  shell.openItem(configPath)
}
// status watcher
(() => {
  setInterval(() => {
    status((err, statuses) => {
      shareEventEmitter.emit('statusUpdate', statuses)
    })
  }, 3000)
})()

export {
  create,
  start,
  stop,
  restart,
  status,
  destory,
  startAll,
  checkReward,
  getReward,
  shareEventEmitter,
  openLogFolder,
  openConfig,
}
