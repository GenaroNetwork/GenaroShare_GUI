import { app, BrowserWindow, Menu, shell, Tray, nativeImage} from 'electron';
import registerProtocals from './customProtocol'
// import { startShare } from '../lib/share'
const defaultMenu = require('./appMenu');
import i18n, { writeLangJsonConfigFile } from '../renderer/i18n';
import { GET_AGREEMENT, GET_TUTORIAL, RPC_PORT } from "../config";

var fs = require('fs'),
    path = require('path');

const { connect } = require('net')
const { fork } = require('child_process')
// const TrayIcon = require('./lib/trayicon')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, tray;
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
    app.externalLink = {
        agreement: GET_AGREEMENT,
        tutorial: GET_TUTORIAL,
    };
    // Get template for default menu 
    const menu = defaultMenu(app, shell);

    // Set top-level application menu, using modified template 
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function setTray(win) {
    let icoPath = require('../../build/icons/icon.ico');
    if (process.platform === 'darwin') {
        icoPath = require('../renderer/assets/img/logo.png');
    }

    if (process.env.NODE_ENV === 'development') {
        icoPath = path.join(__static, '../dist/electron' , icoPath);
    } else {
        icoPath = path.join(__static, '../' , icoPath);
    }
    
    if(fs.existsSync(icoPath)) {
        tray = new Tray(nativeImage.createFromPath(icoPath).resize({width: 16}));

        tray.on('click', () => {
            win.isVisible() ? win.hide() : win.show();
        });
    
        tray.setToolTip('GenaroSharer');
    }
}

function createWindow() {
    /**
     * Initial window options
     */
    registerProtocals();
    setMenu();
    app.menuSetting.updateMenu();
    mainWindow = new BrowserWindow({
        height: 620,
        useContentSize: true,
        width: 1500
    })
    setTray(mainWindow);

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null;
        if(tray && !tray.isDestroyed()) {
            tray.destroy();
            tray = null;
        }
    })
}

/**
 * Check if the daemon is online and starts it if not running
 */
function maybeStartDaemon(callback) {
    const sock = connect(RPC_PORT)

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
        RPCServer = fork(`${__dirname}/../../static/rpc-server.js`, { env: { STORJ_NETWORK: 'gtest', RPC_PORT } })
    } else {
        RPCServer = fork(`${__dirname}/static/rpc-server.js`, { env: { STORJ_NETWORK: 'genaro', RPC_PORT } })
    }
    process.on('exit', () => {
        RPCServer.kill()
    })
    RPCServer.on('message', (msg) => {
        if (msg.state === 'init') {
            //startShare()
            return callback()
        } else {
            RPCServer.removeAllListeners()
            // let killMsg = new FatalExceptionDialog(app, mainWindow, new Error(msg.error))

            // killMsg.render()
        }
    })
}

function initRender() {
    maybeStartDaemon(() => {
        // guarantee daemon is running
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
