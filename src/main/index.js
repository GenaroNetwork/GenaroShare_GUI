import { app, BrowserWindow, Menu, shell, } from 'electron';
import registerProtocals from './customProtocol' 
import { startShare } from '../lib/share'
const defaultMenu = require('./appMenu');
import i18n, { writeLangJsonConfigFile } from '../renderer/i18n';

const { connect } = require('net')
const { fork } = require('child_process')
// const TrayIcon = require('./lib/trayicon')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`


function setMenu() {
    app.menuSetting = {
        updateMenu: addMenu,
        setLocale: function (lang) {
            this.menu = i18n.messages[lang].menu
            writeLangJsonConfigFile(lang)
        }
    }
    app.menuSetting.setLocale(i18n.locale)
}

function addMenu() {
    // Get template for default menu 
    const menu = defaultMenu(app, shell);

    // Set top-level application menu, using modified template 
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function createWindow() {
    /**
     * Initial window options
     */
    registerProtocals();
    setMenu();
    app.menuSetting.updateMenu();
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1500
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

/**
 * Check if the daemon is online and starts it if not running
 */
function maybeStartDaemon(callback) {
    const sock = connect(45015)

    sock.on('connect', () => {
        sock.end()
        sock.removeAllListeners()
        callback()
    })

    sock.on('error', () => {
        sock.removeAllListeners()
        initRPCServer(callback)
    })
}

function initRPCServer(callback) {
    let RPCServer
    if (process.env.NODE_ENV === 'development') {
        RPCServer = fork(`${__dirname}/../../static/rpc-server.js`, { env: { STORJ_NETWORK: 'gtest' } })
    } else {
        RPCServer = fork(`${__dirname}/static/rpc-server.js`,       { env: { STORJ_NETWORK: 'gtest' } })
    }
    process.on('exit', () => {
        RPCServer.kill()
    })
    RPCServer.on('message', (msg) => {
        if (msg.state === 'init') {
            startShare()
            return callback()
        } else {
            RPCServer.removeAllListeners()
            console.log('ddddd')
            // let killMsg = new FatalExceptionDialog(app, mainWindow, new Error(msg.error))

            // killMsg.render()
        }
    })
}

function initRender() {
    maybeStartDaemon(() => {
        createWindow()
    })
}

app.on('ready', initRender)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
